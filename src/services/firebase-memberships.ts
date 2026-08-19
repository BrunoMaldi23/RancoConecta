import { doc, getDoc, onSnapshot } from 'firebase/firestore';

import { firestore, isFirebaseConfigured } from '../lib/firebase';
import type { Membership } from '../types/backend';

const requireFirestore = () => {
  if (!isFirebaseConfigured || !firestore) {
    throw new Error('Firebase no está configurado. Revisa las variables de entorno.');
  }

  return firestore;
};

type WithToDate = { toDate?: () => Date };

const toIso = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  if (
    value &&
    typeof value === 'object' &&
    typeof (value as WithToDate).toDate === 'function'
  ) {
    return (value as WithToDate).toDate!().toISOString();
  }

  return '';
};

const mapMembership = (userId: string, data: Record<string, unknown>): Membership => ({
  userId,
  status: data.status as Membership['status'],
  amount: data.amount as number,
  currency: 'CLP',
  paymentProvider: data.paymentProvider as Membership['paymentProvider'],
  paymentId: data.paymentId as string,
  startedAt: toIso(data.startedAt),
  expiresAt: toIso(data.expiresAt),
});

export async function getMembership(userId: string): Promise<Membership | null> {
  const db = requireFirestore();
  const snapshot = await getDoc(doc(db, 'memberships', userId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapMembership(userId, snapshot.data() as Record<string, unknown>);
}

export function observeMembership(
  userId: string,
  onNext: (membership: Membership | null) => void,
  onError: (error: Error) => void,
) {
  const db = requireFirestore();

  return onSnapshot(
    doc(db, 'memberships', userId),
    (snapshot) => {
      onNext(
        snapshot.exists()
          ? mapMembership(userId, snapshot.data() as Record<string, unknown>)
          : null,
      );
    },
    (error) => onError(error as Error),
  );
}
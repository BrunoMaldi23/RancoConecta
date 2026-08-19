import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import type {
  CreateServiceRequestPayload,
  DirectoryProvider,
  ProviderPlan,
  ProviderPublicationStatus,
  ServiceRequest,
  ServiceRequestStatus,
} from '../contexts/app-data';
import { firestore, isFirebaseConfigured } from '../lib/firebase';
import type { ProviderDocument, ServiceRequestDocument } from '../types/backend';

const now = () => new Date().toISOString();

const requireFirestore = () => {
  if (!isFirebaseConfigured || !firestore) {
    throw new Error('Firebase is not configured');
  }

  return firestore;
};

export function observeProviders(
  onNext: (providers: DirectoryProvider[]) => void,
  onError: (error: Error) => void,
) {
  const db = requireFirestore();
  const source = query(collection(db, 'providers'), orderBy('name'));

  return onSnapshot(
    source,
    (snapshot) => {
      onNext(snapshot.docs.map((item) => item.data() as DirectoryProvider));
    },
    (error) => onError(error as Error),
  );
}

export function observeRequests(
  userId: string,
  isAdminUser: boolean,
  onNext: (requests: ServiceRequest[]) => void,
  onError: (error: Error) => void,
) {
  const db = requireFirestore();
  const source = isAdminUser
    ? query(collection(db, 'requests'), orderBy('createdAt', 'desc'))
    : query(collection(db, 'requests'), where('userId', '==', userId));

  return onSnapshot(
    source,
    (snapshot) => {
      const items = snapshot.docs.map((item) => item.data() as ServiceRequest);
      onNext(
        items.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
      );
    },
    (error) => onError(error as Error),
  );
}

export async function createRequest(payload: CreateServiceRequestPayload & { userId: string }) {
  const db = requireFirestore();
  const data: ServiceRequestDocument = {
    ...payload,
    status: 'Enviada',
    createdAt: now(),
    updatedAt: now(),
  };

  const ref = await addDoc(collection(db, 'requests'), data);

  return { id: ref.id, ...data } satisfies ServiceRequest;
}

export async function saveProvider(provider: DirectoryProvider) {
  const db = requireFirestore();
  const payload: ProviderDocument = {
    ...provider,
    createdAt: now(),
    updatedAt: now(),
  };

  await setDoc(doc(db, 'providers', provider.id), payload, { merge: true });
}

export async function updateProviderFields(
  providerId: string,
  payload: Partial<DirectoryProvider>,
) {
  const db = requireFirestore();
  await updateDoc(doc(db, 'providers', providerId), {
    ...payload,
    updatedAt: now(),
  });
}

export async function updateProviderPublication(
  providerId: string,
  publicationStatus: ProviderPublicationStatus,
) {
  await updateProviderFields(providerId, {
    publicationStatus,
    available: publicationStatus === 'Publicado',
  });
}

export async function updateProviderPlan(providerId: string, plan: ProviderPlan) {
  await updateProviderFields(providerId, { plan });
}

export async function updateRequestStatus(
  requestId: string,
  status: ServiceRequestStatus,
) {
  const db = requireFirestore();
  await updateDoc(doc(db, 'requests', requestId), {
    status,
    updatedAt: now(),
  });
}

export async function saveRating(providerId: string, rating: number, userId: string) {
  const db = requireFirestore();
  const ratingId = `${userId}_${providerId}`;
  const ratingsRef = collection(db, 'ratings');
  const existing = await getDocs(query(ratingsRef, where('providerId', '==', providerId)));

  let sum = 0;
  let included = false;

  existing.docs.forEach((item) => {
    const value = item.data().rating ?? 0;

    if (item.id === ratingId) {
      sum += rating;
      included = true;
    } else {
      sum += value;
    }
  });

  if (!included) {
    sum += rating;
  }

  const reviews = included ? existing.size : existing.size + 1;
  const nextRating = reviews > 0 ? Math.round((sum / reviews) * 10) / 10 : 0;

  await runTransaction(db, async (transaction) => {
    transaction.set(
      doc(db, 'ratings', ratingId),
      {
        providerId,
        userId,
        rating,
        createdAt: now(),
        updatedAt: now(),
      },
      { merge: true },
    );

    transaction.update(doc(db, 'providers', providerId), {
      rating: nextRating,
      reviews,
      ratingSum: sum,
      updatedAt: now(),
    });
  });
}
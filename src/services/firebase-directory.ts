import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import type {
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

export async function fetchProviders() {
  const db = requireFirestore();
  const snapshot = await getDocs(query(collection(db, 'providers'), orderBy('name')));

  return snapshot.docs.map((item) => item.data() as DirectoryProvider);
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

export async function fetchRequests() {
  const db = requireFirestore();
  const snapshot = await getDocs(query(collection(db, 'requests'), orderBy('createdAt', 'desc')));

  return snapshot.docs.map((item) => item.data() as ServiceRequest);
}

export async function saveRequest(request: ServiceRequest) {
  const db = requireFirestore();
  const payload: ServiceRequestDocument = {
    ...request,
    updatedAt: now(),
  };

  await setDoc(doc(db, 'requests', request.id), payload, { merge: true });
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

export async function saveRating(providerId: string, rating: number) {
  const db = requireFirestore();
  await addDoc(collection(db, 'ratings'), {
    providerId,
    rating,
    createdAt: now(),
  });
}

export async function saveRecommendation(providerId: string) {
  const db = requireFirestore();
  await addDoc(collection(db, 'recommendations'), {
    providerId,
    createdAt: now(),
  });
}

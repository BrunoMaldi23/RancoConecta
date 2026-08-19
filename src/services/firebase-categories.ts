import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import type { AppCategory } from '../contexts/app-data';
import { firestore, isFirebaseConfigured } from '../lib/firebase';
import type { CategoryDocument } from '../types/backend';

const now = () => new Date().toISOString();

const requireFirestore = () => {
  if (!isFirebaseConfigured || !firestore) {
    throw new Error('Firebase is not configured');
  }

  return firestore;
};

export function observeCategories(
  onNext: (categories: AppCategory[]) => void,
  onError: (error: Error) => void,
) {
  const db = requireFirestore();
  const source = query(collection(db, 'categories'), orderBy('name'));

  return onSnapshot(
    source,
    (snapshot) => {
      const items = snapshot.docs.map((item) => ({
        ...(item.data() as AppCategory),
        id: item.id,
      }));

      onNext(items);
    },
    (error) => onError(error as Error),
  );
}

export type CreateCategoryPayload = Pick<
  CategoryDocument,
  'name' | 'description' | 'icon' | 'iconColor' | 'iconBackground' | 'subcategories'
>;

export async function createCategory(payload: CreateCategoryPayload) {
  const db = requireFirestore();
  const categoryId = `cat-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const document: CategoryDocument = {
    ...payload,
    createdAt: now(),
    updatedAt: now(),
  };

  await setDoc(doc(db, 'categories', categoryId), document);

  return { id: categoryId, ...document } satisfies AppCategory;
}

export async function updateCategory(categoryId: string, payload: CreateCategoryPayload) {
  const db = requireFirestore();
  await updateDoc(doc(db, 'categories', categoryId), {
    ...payload,
    updatedAt: now(),
  });
}

export async function deleteCategory(categoryId: string) {
  const db = requireFirestore();
  await deleteDoc(doc(db, 'categories', categoryId));
}
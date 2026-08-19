import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { firebaseStorage, isFirebaseConfigured } from '../lib/firebase';

const requireStorage = () => {
  if (!isFirebaseConfigured || !firebaseStorage) {
    throw new Error('Firebase no está configurado para subir imágenes.');
  }

  return firebaseStorage;
};

export async function uploadImage(uri: string, folder: string): Promise<string> {
  const storage = requireStorage();
  const response = await fetch(uri);
  const blob = await response.blob();
  const rawExtension = uri.split('.').pop()?.split(/[?#]/)[0]?.toLowerCase() || '';
  const extension = rawExtension === 'heic' ? 'jpg' : rawExtension || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${extension}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, blob);

  return getDownloadURL(storageRef);
}

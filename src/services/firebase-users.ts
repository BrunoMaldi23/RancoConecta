import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc } from 'firebase/firestore';

import type { AuthUser, ManagedUser } from '../contexts/auth';
import { firebaseAuth, firestore, isFirebaseConfigured } from '../lib/firebase';
import type { UserDocument } from '../types/backend';

const now = () => new Date().toISOString();

const requireFirebase = () => {
  if (!isFirebaseConfigured || !firebaseAuth || !firestore) {
    throw new Error('Firebase is not configured');
  }

  return { auth: firebaseAuth, db: firestore };
};

export function observeUsers(
  onNext: (users: ManagedUser[]) => void,
  onError: (error: Error) => void,
) {
  const { db } = requireFirebase();

  return onSnapshot(
    query(collection(db, 'users')),
    (snapshot) => {
      onNext(snapshot.docs.map((item) => item.data() as ManagedUser));
    },
    (error) => onError(error as Error),
  );
}

export function observeUserDoc(
  userId: string,
  onNext: (user: ManagedUser | null) => void,
  onError: (error: Error) => void,
) {
  const { db } = requireFirebase();

  return onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      onNext(snapshot.exists() ? (snapshot.data() as ManagedUser) : null);
    },
    (error) => onError(error as Error),
  );
}

export function mapUserDocument(id: string, data: UserDocument): ManagedUser {
  const displayName =
    data.role === 'municipal_admin' && data.name.toLowerCase().includes('municipal')
      ? 'Administrador interno'
      : data.name;

  return {
    id,
    name: displayName,
    email: data.email,
    role: data.role,
    status: data.status,
    businessName: data.businessName,
    serviceName: data.serviceName,
    phone: data.phone,
    favoriteIds: data.favoriteIds,
    mustChangePassword: data.mustChangePassword === true,
  };
}

export async function fetchUserById(userId: string) {
  const { db } = requireFirebase();
  const snapshot = await getDoc(doc(db, 'users', userId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapUserDocument(snapshot.id, snapshot.data() as UserDocument);
}

export async function signInUser(email: string, password: string) {
  const { auth, db } = requireFirebase();
  let credential;

  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Correo o contraseña incorrectos.');
      }

      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Activa Email/Password en Firebase Authentication.');
      }

      throw new Error(`Firebase Auth: ${error.code}`);
    }

    throw error;
  }

  const profile = await getDoc(doc(db, 'users', credential.user.uid));

  if (!profile.exists()) {
    throw new Error('No existe perfil de usuario asociado.');
  }

  return mapUserDocument(credential.user.uid, profile.data() as UserDocument) satisfies AuthUser;
}

export async function createCommerceAccount(payload: {
  name: string;
  email: string;
  password: string;
  businessName: string;
  serviceName: string;
  phone: string;
}) {
  const { auth, db } = requireFirebase();
  const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);

  const document: UserDocument = {
    name: payload.name,
    email: payload.email,
    role: 'commerce',
    status: 'PENDING_MUNICIPAL_APPROVAL',
    businessName: payload.businessName,
    serviceName: payload.serviceName,
    phone: payload.phone,
    createdAt: now(),
    updatedAt: now(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), document);

  return mapUserDocument(credential.user.uid, document);
}

export async function updateUserById(
  userId: string,
  payload: Partial<Pick<UserDocument, 'businessName' | 'serviceName' | 'phone' | 'favoriteIds'>>,
) {
  const { db } = requireFirebase();
  await updateDoc(doc(db, 'users', userId), {
    ...payload,
    updatedAt: now(),
  });
}

export async function signOutUser() {
  const { auth } = requireFirebase();
  await signOut(auth);
}

export async function changeOwnPassword(newPassword: string) {
  const { auth, db } = requireFirebase();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Debes iniciar sesión para cambiar tu contraseña.');
  }

  await updatePassword(currentUser, newPassword);

  await updateDoc(doc(db, 'users', currentUser.uid), {
    mustChangePassword: false,
    updatedAt: now(),
  });
}

import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

export async function signInUser(email: string, password: string) {
  const { auth, db } = requireFirebase();
  let credential;

  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        throw new Error('Correo o contraseña incorrectos en Firebase Auth.');
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

  const data = profile.data() as UserDocument;

  return {
    id: credential.user.uid,
    name: data.name,
    email: data.email,
    role: data.role,
  } satisfies AuthUser;
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
  const user: ManagedUser = {
    id: credential.user.uid,
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: 'commerce',
    status: 'PENDING_MUNICIPAL_APPROVAL',
    businessName: payload.businessName,
    serviceName: payload.serviceName,
    phone: payload.phone,
  };

  const document: UserDocument = {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    businessName: user.businessName,
    serviceName: user.serviceName,
    phone: user.phone,
    createdAt: now(),
    updatedAt: now(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), document);

  return user;
}

export async function signOutUser() {
  const { auth } = requireFirebase();
  await signOut(auth);
}

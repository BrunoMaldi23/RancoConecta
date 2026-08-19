import {
  applyActionCode,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { firebaseAuth, firestore, isFirebaseConfigured } from '../lib/firebase';

type PendingInscription = {
  email: string;
  name: string;
  sentAt: string;
};

const PENDING_KEY = 'ranco.inscripcion.pendiente';
const now = () => new Date().toISOString();

const readPending = (): PendingInscription | null => {
  try {
    const raw = localStorage.getItem(PENDING_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PendingInscription;

    if (!parsed?.email) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const savePending = (pending: PendingInscription) => {
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
};

export const clearPendingInscription = () => {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // sin almacenamiento no hay pendiente que limpiar
  }
};

export const getPendingInscription = readPending;

export function redirectUrlForInscription() {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.origin}/inscribir`;
}

export async function sendInscriptionLink(name: string, email: string) {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error('Firebase no está configurado. Revisa las variables de entorno.');
  }

  const url = redirectUrlForInscription();

  if (!url) {
    throw new Error('No se pudo armar el enlace de inscripción para este dispositivo.');
  }

  await sendSignInLinkToEmail(firebaseAuth, email, {
    url,
    handleCodeInApp: true,
  });

  savePending({ email, name: name.trim(), sentAt: now() });
}

export function isInscriptionSignIn(params: Record<string, string | string[] | undefined>) {
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const oobCode = Array.isArray(params.oobCode) ? params.oobCode[0] : params.oobCode;

  return mode === 'signIn' && Boolean(oobCode);
}

export async function completeInscriptionSignIn() {
  if (!isFirebaseConfigured || !firebaseAuth || !firestore) {
    throw new Error('Firebase no está configurado. Revisa las variables de entorno.');
  }

  if (typeof window === 'undefined') {
    throw new Error('Operación no disponible en este dispositivo.');
  }

  const pending = readPending();

  if (!pending) {
    throw new Error('No encontramos el correo desde el que iniciaste la inscripción. Vuelve a solicitarla.');
  }

  await signInWithEmailLink(firebaseAuth, pending.email, window.location.href);

  const currentUser = firebaseAuth.currentUser;

  if (!currentUser?.email) {
    throw new Error('No se pudo confirmar la cuenta. Revisa que el enlace no haya expirado.');
  }

  const userRef = doc(firestore, 'users', currentUser.uid);
  const existing = await getDoc(userRef);

  if (!existing.exists()) {
    await setDoc(userRef, {
      name: pending.name || pending.email.split('@')[0] || 'Servicio local',
      email: currentUser.email,
      role: 'commerce',
      status: 'PENDING_MUNICIPAL_APPROVAL',
      businessName: pending.name || 'Servicio local',
      createdAt: now(),
      updatedAt: now(),
    });
  }

  return { user: currentUser };
}

export async function cancelPendingEmailLink(email: string, oobCode: string) {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error('Firebase no está configurado. Revisa las variables de entorno.');
  }

  await applyActionCode(firebaseAuth, oobCode);
  clearPendingInscription();
}
import { firebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import type { CreateWebpayPaymentResponse } from '../types/backend';

const FUNCTIONS_BASE_URL = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL?.trim() || '';

// Endpoint al que Webpay retorna tras el pago. Ahí el backend procesa el
// commit; /payment-result solo muestra el resultado recibido por redirect.
export function webpayReturnUrl() {
  if (!FUNCTIONS_BASE_URL) {
    return '';
  }

  return `${FUNCTIONS_BASE_URL}/webpayReturn`;
}

async function requireIdToken() {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error('Firebase no está configurado. Revisa las variables de entorno.');
  }

  const currentUser = firebaseAuth.currentUser;

  if (!currentUser) {
    throw new Error('Debes iniciar sesión para continuar.');
  }

  return currentUser.getIdToken();
}

async function postJson<T>(path: string, body: Record<string, unknown>, idToken: string) {
  if (!FUNCTIONS_BASE_URL) {
    throw new Error('El servicio de pagos no está configurado.');
  }

  let response: Response;

  try {
    response = await fetch(`${FUNCTIONS_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No pudimos conectar con el sistema de pagos.');
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || 'No se pudo completar la operación.');
  }

  return (await response.json()) as T;
}

export type CreateWebpayPaymentPayload = {
  email: string;
  name: string;
  returnUrl: string;
};

export async function createWebpayPayment(
  payload: CreateWebpayPaymentPayload,
): Promise<CreateWebpayPaymentResponse> {
  const idToken = await requireIdToken();

  return postJson<CreateWebpayPaymentResponse>('/createWebpayTransaction', payload, idToken);
}
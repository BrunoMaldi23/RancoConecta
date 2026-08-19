// Configuración del envío de correos transaccionales (Resend).
// RESEND_API_KEY y EMAIL_FROM se leen de functions/.env; en producción
// deben definirse como configuración/secreto de Firebase Functions.
import {Resend} from "resend";

export function resendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

export function emailFrom() {
  return process.env.EMAIL_FROM?.trim() || "";
}

export function getResend() {
  const key = resendApiKey();

  if (!key) {
    return null;
  }

  return new Resend(key);
}
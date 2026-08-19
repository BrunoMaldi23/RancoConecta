import {Timestamp} from "firebase-admin/firestore";

// Pago único anual de la membresía de prestadores.
// Único punto donde se define el valor y el periodo.
export const MEMBERSHIP_AMOUNT = 9990;
export const MEMBERSHIP_CURRENCY = "CLP";
export const MEMBERSHIP_DURATION_MONTHS = 12;

// La membresía dura un año calendario.
export function membershipExpiration(startedAt: Date) {
  const expiresAt = new Date(startedAt);

  expiresAt.setFullYear(
    expiresAt.getFullYear() + 1,
  );

  return expiresAt;
}

export function buildActiveMembershipFields(
  paymentId: string,
  amount: number,
) {
  const startedAt = new Date();
  const expiresAt = membershipExpiration(startedAt);

  return {
    status: "active",
    amount,
    currency: MEMBERSHIP_CURRENCY,
    paymentProvider: "webpay",
    paymentId,
    startedAt: Timestamp.fromDate(startedAt),
    expiresAt: Timestamp.fromDate(expiresAt),
    updatedAt: Timestamp.now(),
  };
}
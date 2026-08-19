import {
  getFirestore,
  Timestamp,
} from "firebase-admin/firestore";

import {
  MEMBERSHIP_AMOUNT,
  MEMBERSHIP_CURRENCY,
} from "../config/membership";

import {
  getWebpayTransaction,
} from "./client";

const PENDING_TTL_MS = 2 * 60 * 1000;

type CreatePaymentInput = {
  uid: string;
  email: string;
  name: string;
};

function createBuyOrder(uid: string) {
  const cleanUid = uid
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10);

  const timestamp = Date.now()
    .toString()
    .slice(-10);

  return `RC${cleanUid}${timestamp}`;
}

function createSessionId(uid: string) {
  return `RC-${uid.slice(0, 12)}-${Date.now()}`;
}

export async function createPayment(
  input: CreatePaymentInput,
  returnUrl: string,
) {
  const db = getFirestore();

  const {
    uid,
    email,
    name,
  } = input;

  // Si existe un pago pendiente reciente, evitar duplicados.
  const pendingSnapshots =
    await db
      .collection("payments")
      .where("userId", "==", uid)
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

  const existing =
    pendingSnapshots.docs[0];

  if (existing) {
    const createdAt =
      existing.get("createdAt") as
        Timestamp | undefined;

    const ageMs = createdAt
      ? Date.now() - createdAt.toMillis()
      : Number.POSITIVE_INFINITY;

    if (
      ageMs < PENDING_TTL_MS
    ) {
      throw new Error(
        "PAGO_PENDIENTE",
      );
    }
  }

  const paymentRef =
    db.collection("payments").doc();

  const paymentId =
    paymentRef.id;

  const buyOrder =
    createBuyOrder(uid);

  const sessionId =
    createSessionId(uid);

  const separator =
    returnUrl.includes("?")
      ? "&"
      : "?";

  const webpayReturnUrl =
    `${returnUrl}${separator}paymentId=${encodeURIComponent(paymentId)}`;

  const transaction =
    getWebpayTransaction();

  const result =
    await transaction.create(
      buyOrder,
      sessionId,
      MEMBERSHIP_AMOUNT,
      webpayReturnUrl,
    );

  await paymentRef.set({
    id: paymentId,

    userId: uid,

    email:
      email.trim().toLowerCase(),

    name:
      name.trim(),

    purpose:
      "membership",

    provider:
      "webpay",

    amount:
      MEMBERSHIP_AMOUNT,

    currency:
      MEMBERSHIP_CURRENCY,

    status:
      "pending",

    buyOrder,
    sessionId,

    webpayToken:
      result.token,

    createdAt:
      Timestamp.now(),

    updatedAt:
      Timestamp.now(),
  });

  return {
    paymentId,

    token:
      result.token,

    url:
      result.url,

    amount:
      MEMBERSHIP_AMOUNT,

    currency:
      MEMBERSHIP_CURRENCY,
  };
}
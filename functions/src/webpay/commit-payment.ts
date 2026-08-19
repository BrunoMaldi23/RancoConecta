import {
  getFirestore,
  Timestamp,
} from "firebase-admin/firestore";

import {
  getAuth,
} from "firebase-admin/auth";

import {
  MEMBERSHIP_CURRENCY,
} from "../config/membership";

import {
  buildActiveMembership,
} from "../memberships/activate-membership";

import {
  provisionMemberAccount,
} from "../accounts/provision-member-account";

import {
  getWebpayTransaction,
} from "./client";

export async function commitPayment(
  paymentId: string,
  token: string,
) {
  const db = getFirestore();

  const paymentRef =
    db.collection("payments").doc(paymentId);

  const snapshot =
    await paymentRef.get();

  if (!snapshot.exists) {
    throw new Error(
      "Pago no encontrado.",
    );
  }

  const payment =
    snapshot.data();

  if (!payment) {
    throw new Error(
      "Información de pago inválida.",
    );
  }

  // Este endpoint se llama desde el retorno de Webpay (sin ID Token).
  // La autoridad de la operación se valida con el token guardado del pago
  // y el estado de la transacción, no con un uid del navegador.
  if (
    payment.status === "authorized"
  ) {
    return {
      authorized: true,
      alreadyProcessed: true,
      paymentId,
      amount:
        typeof payment.amount === "number"
          ? payment.amount
          : undefined,
      currency:
        MEMBERSHIP_CURRENCY,
      membershipStatus:
        "active",
    };
  }

  if (
    payment.webpayToken !== token
  ) {
    throw new Error(
      "El token recibido no corresponde al pago.",
    );
  }

  const transaction =
    getWebpayTransaction();

  const result =
    await transaction.commit(token);

  const authorized =
    result.status === "AUTHORIZED" &&
    result.response_code === 0;

  if (!authorized) {
    await paymentRef.update({
      status:
        "failed",

      webpayStatus:
        result.status ?? null,

      responseCode:
        result.response_code ?? null,

      updatedAt:
        Timestamp.now(),
    });

    return {
      authorized:
        false,

      paymentId,

      status:
        result.status,

      responseCode:
        result.response_code,
    };
  }

  const userId =
    payment.userId as string;

  if (!userId) {
    throw new Error(
      "El pago no tiene un usuario asociado.",
    );
  }

  const membershipRef =
    db
      .collection("memberships")
      .doc(userId);

  const batch =
    db.batch();

  batch.update(
    paymentRef,
    {
      status:
        "authorized",

      amount:
        result.amount,

      authorizationCode:
        result.authorization_code ?? null,

      paymentTypeCode:
        result.payment_type_code ?? null,

      installmentsNumber:
        result.installments_number ?? 0,

      cardNumber:
        result.card_detail
          ?.card_number ?? null,

      accountingDate:
        result.accounting_date ?? null,

      transactionDate:
        result.transaction_date ?? null,

      webpayStatus:
        result.status,

      responseCode:
        result.response_code,

      paidAt:
        Timestamp.now(),

      updatedAt:
        Timestamp.now(),
    },
  );

  batch.set(
    membershipRef,
    {
      userId,

      ...buildActiveMembership(
        paymentId,
        result.amount,
      ),

      createdAt:
        Timestamp.now(),
    },
    {
      merge: true,
    },
  );

  await batch.commit();

  // El comercio se inscribió con email-link, sin clave. Después del primer
  // pago se le asigna una contraseña temporal y se le envía por correo.
  // Si el usuario ya tiene contraseña (renovación), no se pisa.
  try {
    const authUser =
      await getAuth().getUser(userId);

    const hasPassword =
      authUser.providerData.some(
        (provider) =>
          provider.providerId === "password",
      );

    if (!hasPassword) {
      await provisionMemberAccount(
        userId,
        payment.email as string,
        payment.name as string,
      );
    }
  } catch (error) {
    console.error(
      "commitPayment provision:",
      error,
    );
  }

  return {
    authorized:
      true,

    alreadyProcessed:
      false,

    paymentId,

    amount:
      result.amount,

    currency:
      MEMBERSHIP_CURRENCY,

    membershipStatus:
      "active",
  };
}
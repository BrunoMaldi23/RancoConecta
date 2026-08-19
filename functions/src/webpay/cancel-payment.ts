import {
  getFirestore,
  Timestamp,
} from "firebase-admin/firestore";

// Marca un pago como cancelado cuando Webpay retorna con TBK_TOKEN
// (cancelación/aborto) o cuando el pago no llegó a concretarse.
// Operación idempotente: solo cambia un pago que siga en "pending"/"failed".
export async function cancelPayment(
  paymentId: string,
) {
  const db = getFirestore();

  const paymentRef =
    db.collection("payments").doc(paymentId);

  const snapshot =
    await paymentRef.get();

  if (!snapshot.exists) {
    return;
  }

  const status =
    snapshot.get("status");

  if (
    status !== "pending" &&
    status !== "failed"
  ) {
    return;
  }

  await paymentRef.update({
    status: "cancelled",
    updatedAt: Timestamp.now(),
  });
}
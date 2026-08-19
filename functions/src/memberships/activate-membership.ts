import {
  buildActiveMembershipFields,
} from "../config/membership";

export function buildActiveMembership(
  paymentId: string,
  amount: number,
) {
  return buildActiveMembershipFields(
    paymentId,
    amount,
  );
}
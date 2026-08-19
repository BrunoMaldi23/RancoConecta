export const MEMBERSHIP_AMOUNT = 9990;
export const MEMBERSHIP_CURRENCY = 'CLP';
export const MEMBERSHIP_PERIOD_MONTHS = 12;

export function formatMembershipPrice(amount = MEMBERSHIP_AMOUNT) {
  return `$${amount.toLocaleString('es-CL')}`;
}

export const MEMBERSHIP_PRICE_LABEL = formatMembershipPrice();
export const MEMBERSHIP_PERIOD_LABEL = '/ año';
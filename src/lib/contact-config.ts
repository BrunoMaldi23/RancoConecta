const adminWhatsapp = process.env.EXPO_PUBLIC_ADMIN_WHATSAPP?.trim() || '';
const adminPhone = process.env.EXPO_PUBLIC_ADMIN_PHONE?.trim() || '';
const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL?.trim() || '';

export function whatsappUrl(phone: string | undefined, text: string) {
  const digits = (phone ?? '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function telUrl(phone: string | undefined) {
  const value = (phone ?? '').trim();

  if (!value) {
    return '';
  }

  return `tel:${value}`;
}

export function mailtoUrl(email: string | undefined, subject: string) {
  const value = (email ?? '').trim();

  if (!value) {
    return '';
  }

  return `mailto:${value}?subject=${encodeURIComponent(subject)}`;
}

export const CONTACT_ADMIN_WHATSAPP = adminWhatsapp;
export const CONTACT_ADMIN_PHONE = adminPhone;
export const CONTACT_ADMIN_EMAIL = adminEmail;
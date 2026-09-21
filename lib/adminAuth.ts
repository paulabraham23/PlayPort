import { auth } from '@/lib/firebase';

const OPS_EMAILS = new Set(['paulabraham.net@gmail.com']);
const OPS_PHONES = new Set(['+919346577926', '919346577926', '9346577926']);

function normalizePhone(value?: string | null): string {
  return (value || '').replace(/\D/g, '');
}

/** True when the current ID token has `admin: true` or an allowlisted ops identity. */
export async function checkIsAdmin(forceRefresh = false): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  const token = await user.getIdTokenResult(forceRefresh);
  if (token.claims.admin === true) return true;

  const email = (user.email || (token.claims.email as string | undefined) || '').toLowerCase();
  if (OPS_EMAILS.has(email)) return true;

  const phone =
    user.phoneNumber ||
    (token.claims.phone_number as string | undefined) ||
    '';
  const digits = normalizePhone(phone);
  if (OPS_PHONES.has(phone) || OPS_PHONES.has(digits) || OPS_PHONES.has(digits.slice(-10))) {
    return true;
  }
  return false;
}

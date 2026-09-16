import {
  ConfirmationResult,
  RecaptchaVerifier,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPhoneNumber,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '@/lib/firebase';
import { fetchUserProfile, upsertUserProfile } from '@/lib/firestore';
import { HUB } from '@/data/mock';
import type { User } from '@/types';

let phoneConfirmation: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

function profileFromAuth(firebaseUser: FirebaseUser, phone?: string): User {
  const digits = (phone ?? firebaseUser.phoneNumber ?? '').replace(/\D/g, '').slice(-10);
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || (digits ? `Member ${digits.slice(-4)}` : 'PlayPort Member'),
    phone: phone ?? firebaseUser.phoneNumber ?? (digits ? `+91${digits}` : ''),
    email: firebaseUser.email ?? '',
    avatar:
      firebaseUser.photoURL ||
      `https://api.dicebear.com/7.x/avataaars/png?seed=${firebaseUser.uid}`,
    kycVerified: Boolean(firebaseUser.phoneNumber || digits),
    sessionsCount: 0,
    homeHub: HUB.city,
    homeHubId: HUB.id,
  };
}

export function watchAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function ensureRecaptcha(containerId = 'playport-recaptcha'): Promise<RecaptchaVerifier | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
  if (recaptchaVerifier) return recaptchaVerifier;

  let el = document.getElementById(containerId);
  if (!el) {
    el = document.createElement('div');
    el.id = containerId;
    el.style.display = 'none';
    document.body.appendChild(el);
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  await recaptchaVerifier.render();
  return recaptchaVerifier;
}

/** Send Firebase Phone Auth OTP (web). Falls back to mock confirmation in DEV when Phone Auth is unavailable. */
export async function startPhoneLogin(phone10: string): Promise<{ mode: 'firebase' | 'mock' }> {
  const e164 = `+91${phone10.replace(/\D/g, '').slice(-10)}`;

  if (Platform.OS === 'web') {
    try {
      const verifier = await ensureRecaptcha();
      if (verifier) {
        phoneConfirmation = await signInWithPhoneNumber(auth, e164, verifier);
        return { mode: 'firebase' };
      }
    } catch (err) {
      console.warn('Phone Auth send failed, using mock path:', err);
      phoneConfirmation = null;
    }
  }

  // Mock path: store phone for confirmPhoneLogin (anonymous + profile).
  (globalThis as { __playportMockPhone?: string }).__playportMockPhone = e164;
  return { mode: 'mock' };
}

export async function confirmPhoneLogin(code: string, name = 'PlayPort Member'): Promise<User> {
  const mockPhone = (globalThis as { __playportMockPhone?: string }).__playportMockPhone;

  if (phoneConfirmation) {
    const cred = await phoneConfirmation.confirm(code);
    phoneConfirmation = null;
    const user = profileFromAuth(cred.user);
    if (name) user.name = name;
    await upsertUserProfile(cred.user.uid, user);
    return user;
  }

  // DEV / unavailable Phone Auth: any 6-digit code + anonymous session keyed by phone.
  if (!/^\d{6}$/.test(code)) {
    throw new Error('Enter the 6-digit OTP');
  }
  const phone = mockPhone ?? '+910000000000';
  const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
  const user = profileFromAuth(cred.user, phone);
  user.name = name;
  user.kycVerified = true;
  await upsertUserProfile(cred.user.uid, user);
  delete (globalThis as { __playportMockPhone?: string }).__playportMockPhone;
  return user;
}

export async function mapFirebaseUserToAppUser(firebaseUser: FirebaseUser): Promise<User> {
  const existing = await fetchUserProfile(firebaseUser.uid);
  if (existing) {
    return {
      ...existing,
      id: firebaseUser.uid,
      phone: existing.phone || firebaseUser.phoneNumber || '',
      email: existing.email || firebaseUser.email || '',
    };
  }
  const user = profileFromAuth(firebaseUser);
  await upsertUserProfile(firebaseUser.uid, user);
  return user;
}

/** Guest browse — anonymous Firebase session. */
export async function signInAsGuest() {
  const cred = await signInAnonymously(auth);
  await upsertUserProfile(cred.user.uid, {
    id: cred.user.uid,
    name: 'Guest',
    phone: '',
    email: '',
    avatar: '',
    kycVerified: false,
    sessionsCount: 0,
    homeHub: HUB.city,
    homeHubId: HUB.id,
  });
  return cred.user;
}

/** @deprecated Prefer startPhoneLogin + confirmPhoneLogin */
export async function signInWithPhoneMock(phone: string, name = 'PlayPort Member') {
  await startPhoneLogin(phone);
  return confirmPhoneLogin('000000', name);
}

export async function signOutUser() {
  phoneConfirmation = null;
  await signOut(auth);
}

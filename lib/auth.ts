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
import { useCatalogStore } from '@/store/catalogStore';
import type { User } from '@/types';
import { isPlaceholderName } from '@/utils/onboarding';

let phoneConfirmation: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

function hubDefaults() {
  const hub = useCatalogStore.getState().hub;
  return {
    homeHub: hub?.city && hub.city !== '—' ? hub.city : hub?.name || 'PlayPort',
    homeHubId: hub?.id && hub.id !== 'pending' ? hub.id : undefined,
  };
}

function profileFromAuth(firebaseUser: FirebaseUser, phone?: string): User {
  const digits = (phone ?? firebaseUser.phoneNumber ?? '').replace(/\D/g, '').slice(-10);
  const hub = hubDefaults();
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || (digits ? `Member ${digits.slice(-4)}` : 'PlayPort Member'),
    phone: phone ?? firebaseUser.phoneNumber ?? (digits ? `+91${digits}` : ''),
    email: firebaseUser.email ?? '',
    avatar:
      firebaseUser.photoURL ||
      `https://api.dicebear.com/7.x/avataaars/png?seed=${firebaseUser.uid}`,
    kycVerified: false,
    sessionsCount: 0,
    homeHub: hub.homeHub,
    homeHubId: hub.homeHubId,
    onboardingComplete: false,
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

/** Send Firebase Phone Auth OTP (web). Falls back to mock only in __DEV__. */
export async function startPhoneLogin(phone10: string): Promise<{ mode: 'firebase' | 'mock' }> {
  const e164 = `+91${phone10.replace(/\D/g, '').slice(-10)}`;

  if (Platform.OS === 'web') {
    try {
      const verifier = await ensureRecaptcha();
      if (!verifier) {
        throw new Error('Could not start phone verification on this browser.');
      }
      phoneConfirmation = await signInWithPhoneNumber(auth, e164, verifier);
      return { mode: 'firebase' };
    } catch (err) {
      console.warn('Phone Auth send failed:', err);
      const message = err instanceof Error ? err.message : String(err);
      // Production: surface the real error (API key / Identity Toolkit / billing / etc.)
      if (typeof __DEV__ === 'undefined' || !__DEV__) {
        if (/identitytoolkit|API.?key|blocked|PERMISSION_DENIED|requests? to this API/i.test(message)) {
          throw new Error(
            'Phone sign-in is blocked by Google Cloud API key settings. Identity Toolkit must be allowed on the Firebase browser key.'
          );
        }
        throw new Error(message || 'Could not send OTP. Try again.');
      }
      // DEV only: fall back to mock OTP
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
    return finalizePhoneSession(cred.user, undefined, name);
  }

  // DEV / unavailable Phone Auth: any 6-digit code + anonymous session keyed by phone.
  if (!/^\d{6}$/.test(code)) {
    throw new Error('Enter the 6-digit OTP');
  }
  const phone = mockPhone ?? '+910000000000';
  const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
  const user = await finalizePhoneSession(cred.user, phone, name);
  delete (globalThis as { __playportMockPhone?: string }).__playportMockPhone;
  return user;
}

/** Merge auth session with any existing Firestore profile — never wipe name / onboarding on re-login. */
async function finalizePhoneSession(
  firebaseUser: FirebaseUser,
  phoneOverride?: string,
  fallbackName = 'PlayPort Member'
): Promise<User> {
  const existing = await fetchUserProfile(firebaseUser.uid);
  const base = profileFromAuth(firebaseUser, phoneOverride);
  const phone = existing?.phone || base.phone;
  const digits = phone.replace(/\D/g, '').slice(-10);

  const preservedName =
    existing?.name && !isPlaceholderName(existing.name)
      ? existing.name
      : fallbackName && !isPlaceholderName(fallbackName)
        ? fallbackName
        : existing?.name || base.name;

  const user: User = {
    ...base,
    ...existing,
    id: firebaseUser.uid,
    phone: phone || (digits ? `+91${digits}` : base.phone),
    email: existing?.email || base.email,
    name: preservedName,
    avatar: existing?.avatar || base.avatar,
    kycVerified: existing?.kycVerified ?? false,
    sessionsCount: existing?.sessionsCount ?? 0,
    homeHub: existing?.homeHub || base.homeHub,
    homeHubId: existing?.homeHubId || base.homeHubId,
    onboardingComplete: Boolean(existing?.onboardingComplete),
  };

  // Only write auth/contact fields on login — never reset onboarding or a chosen name.
  const patch: Record<string, unknown> = {
    id: user.id,
    phone: user.phone,
    email: user.email,
    avatar: user.avatar,
    homeHub: user.homeHub,
    homeHubId: user.homeHubId,
  };
  if (!existing) {
    patch.name = user.name;
    patch.onboardingComplete = false;
    patch.kycVerified = false;
    patch.sessionsCount = 0;
  } else {
    // Keep completion sticky; re-assert true so a parallel bootstrap can't demote it.
    if (existing.onboardingComplete) patch.onboardingComplete = true;
    if (existing.name && !isPlaceholderName(existing.name)) patch.name = existing.name;
  }
  await upsertUserProfile(firebaseUser.uid, patch);

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
      // Never demote a completed profile during auth bootstrap.
      onboardingComplete: Boolean(existing.onboardingComplete),
    };
  }
  // Brand-new UID only — do not overwrite an existing doc with placeholder defaults.
  const user = profileFromAuth(firebaseUser);
  await upsertUserProfile(firebaseUser.uid, {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    avatar: user.avatar,
    kycVerified: false,
    sessionsCount: 0,
    homeHub: user.homeHub,
    homeHubId: user.homeHubId,
    onboardingComplete: false,
  });
  return user;
}

/** Guest browse — anonymous Firebase session. */
export async function signInAsGuest() {
  const cred = await signInAnonymously(auth);
  const hub = hubDefaults();
  await upsertUserProfile(cred.user.uid, {
    id: cred.user.uid,
    name: 'Guest',
    phone: '',
    email: '',
    avatar: '',
    kycVerified: false,
    sessionsCount: 0,
    homeHub: hub.homeHub,
    homeHubId: hub.homeHubId,
    onboardingComplete: false,
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

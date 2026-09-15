import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { upsertUserProfile } from '@/lib/firestore';

export function watchAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
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
    homeHub: 'Indiranagar',
  });
  return cred.user;
}

/**
 * Phone OTP is still UI-mocked for now.
 * Creates/updates an anonymous session keyed by phone in the user profile.
 */
export async function signInWithPhoneMock(phone: string, name = 'PlayPort Member') {
  const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
  await upsertUserProfile(cred.user.uid, {
    id: cred.user.uid,
    name,
    phone: `+91${phone}`,
    email: '',
    avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${phone}`,
    kycVerified: true,
    sessionsCount: 0,
    homeHub: 'Indiranagar',
  });
  return cred.user;
}

export async function signOutUser() {
  await signOut(auth);
}

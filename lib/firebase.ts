import { initializeApp, getApps, getApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

/**
 * Firebase web config for PlayPort.
 * Client API keys are expected to be public; access is enforced by Auth + Security Rules.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyA2jGQ74H_FFUfYp-9B1iZyx9Q86M2VaGI',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'playport-blr-2026.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'playport-blr-2026',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'playport-blr-2026.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '149399541034',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:149399541034:web:95a442d98b07419a83fa53',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const isFirebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

/** Connect to local emulators when EXPO_PUBLIC_USE_EMULATORS=1 (no Blaze needed). */
const useEmulators = process.env.EXPO_PUBLIC_USE_EMULATORS === '1';
const emulatorHost =
  process.env.EXPO_PUBLIC_EMULATOR_HOST ??
  (typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1');

if (useEmulators && !(globalThis as { __playportEmulatorsConnected?: boolean }).__playportEmulatorsConnected) {
  connectFirestoreEmulator(db, emulatorHost, 8080);
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  (globalThis as { __playportEmulatorsConnected?: boolean }).__playportEmulatorsConnected = true;
}

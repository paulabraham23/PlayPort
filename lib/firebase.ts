import { initializeApp, getApps, getApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

/**
 * Firebase web config for PlayPort.
 * Client API keys are expected to be public; access is enforced by Auth + Security Rules.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyDHFf92p5J02ZreBdronzDxCpC6-352ALw',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'playport-fd57f.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'playport-fd57f',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'playport-fd57f.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '55486567683',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:55486567683:web:8fb28cff70047a2c9dc536',
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

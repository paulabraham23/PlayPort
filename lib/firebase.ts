import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  type Auth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

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

/**
 * Persist auth across reloads / days.
 * Web: IndexedDB (durable) with localStorage fallback.
 * Native: AsyncStorage — without this, sessions are memory-only and vanish on restart.
 */
function createAuth(): Auth {
  if (Platform.OS === 'web') {
    try {
      return initializeAuth(firebaseApp, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      });
    } catch {
      return getAuth(firebaseApp);
    }
  }

  try {
    // RN-only export; not present on the web Auth bundle.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getReactNativePersistence } = require('firebase/auth') as {
      getReactNativePersistence: (storage: unknown) => unknown;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage) as never,
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const auth = createAuth();
export const db = getFirestore(firebaseApp);
export const isFirebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

/** Keep the refresh token warm when the tab/app becomes active again. */
export function startAuthSessionKeepAlive() {
  const refresh = () => {
    const user = auth.currentUser;
    if (!user) return;
    void user.getIdToken(/* forceRefresh */ false).catch(() => {});
  };

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    // Periodic soft refresh (~every 45m) so long-lived PWAs don't go cold.
    const interval = setInterval(refresh, 45 * 60 * 1000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }

  const interval = setInterval(refresh, 45 * 60 * 1000);
  return () => clearInterval(interval);
}

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

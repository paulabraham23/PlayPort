import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { Platform } from 'react-native';
import { firebaseApp } from '@/lib/firebase';
import { callRegisterFcmToken } from '@/lib/functions';

/**
 * Web FCM registration. Requires a service worker at /firebase-messaging-sw.js
 * and EXPO_PUBLIC_FIREBASE_VAPID_KEY. No-ops when unsupported.
 */
export async function registerWebPushIfAvailable() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    const supported = await isSupported();
    if (!supported) return;
    const vapid = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapid) {
      console.info('FCM: set EXPO_PUBLIC_FIREBASE_VAPID_KEY to enable web push');
      return;
    }
    const messaging = getMessaging(firebaseApp);
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
    const token = await getToken(messaging, { vapidKey: vapid });
    if (token) await callRegisterFcmToken(token);
  } catch (err) {
    console.warn('FCM register skipped', err);
  }
}

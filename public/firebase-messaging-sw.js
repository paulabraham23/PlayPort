/**
 * Public FCM service worker stub for web push.
 * Copy to `public/firebase-messaging-sw.js` or Expo web static output as needed.
 * Configure messagingSenderId to match the Firebase web app.
 */
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA2jGQ74H_FFUfYp-9B1iZyx9Q86M2VaGI',
  authDomain: 'playport-blr-2026.firebaseapp.com',
  projectId: 'playport-blr-2026',
  messagingSenderId: '149399541034',
  appId: '1:149399541034:web:95a442d98b07419a83fa53',
});

firebase.messaging();

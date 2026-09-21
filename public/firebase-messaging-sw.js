/**
 * PlayPort service worker — FCM push + minimal PWA install support.
 * Network-first only (no aggressive offline cache) so deploys stay fresh.
 */
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDHFf92p5J02ZreBdronzDxCpC6-352ALw',
  authDomain: 'playport-fd57f.firebaseapp.com',
  projectId: 'playport-fd57f',
  messagingSenderId: '55486567683',
  appId: '1:55486567683:web:8fb28cff70047a2c9dc536',
});

firebase.messaging();

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch handler required by some browsers for installability. Pass through only.
self.addEventListener('fetch', () => {
  // intentionally empty — let the network handle everything
});

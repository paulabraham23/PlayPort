import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

const SITE = 'https://playport-one.vercel.app';
const TITLE = 'PlayPort — Entertainment kits, delivered fast';
const DESCRIPTION =
  'PlayPort — entertainment kits delivered fast. Consoles, cinema, VR and more at your door.';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="color-scheme" content="light" />
        <meta name="application-name" content="PlayPort" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PlayPort" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="canonical" href={`${SITE}/`} />

        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <link rel="manifest" href="/manifest.json?v=3" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="PlayPort" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={`${SITE}/`} />
        <meta property="og:image" content={`${SITE}/icon-512.png?v=3`} />
        <meta property="og:locale" content="en_IN" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE}/icon-512.png?v=3`} />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
        <script dangerouslySetInnerHTML={{ __html: registerServiceWorker }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const registerServiceWorker = `
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(function () {});
  });
}
`;

const globalCss = `
html, body, #root {
  background-color: #FFFFFF;
  min-height: 100%;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  touch-action: manipulation;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color-scheme: light;
  scroll-behavior: smooth;
}
* {
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}
img, video, canvas, svg {
  max-width: 100%;
  height: auto;
}
[role="button"], [role="tab"], button, a {
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.15s ease;
}
input, textarea, select {
  outline: none;
  font-size: 16px;
  max-width: 100%;
}
::selection {
  background: rgba(249, 115, 22, 0.28);
  color: #fff;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: #2A3042;
  border-radius: 8px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3A4256;
}
::-webkit-scrollbar-track {
  background: transparent;
}
@media (max-width: 379px) {
  html { font-size: 15px; }
}
@media (min-width: 1280px) {
  html { font-size: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

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
        <meta name="theme-color" content="#0F0F10" />
        <meta
          name="description"
          content="PlayPort — entertainment kits delivered fast. Consoles, cinema, VR and more."
        />
        <ScrollViewStyleReset />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalCss = `
html, body, #root {
  background-color: #0F0F10;
  min-height: 100%;
  width: 100%;
  overflow-x: hidden;
  touch-action: manipulation;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color-scheme: dark;
}
* {
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}
img, video {
  max-width: 100%;
  height: auto;
}
[role="button"], [role="tab"], button, a {
  cursor: pointer;
}
input, textarea {
  outline: none;
  font-size: 16px;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: #3A3A40;
  border-radius: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
@media (min-width: 1024px) {
  body {
    background: #0F0F10;
  }
}
`;

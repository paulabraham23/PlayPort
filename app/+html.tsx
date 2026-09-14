import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#121212" />
        <meta name="description" content="PlayPort — quick commerce for entertainment. Consoles, cinema kits, karaoke and more delivered in 30 mins." />
        <ScrollViewStyleReset />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600&display=swap"
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
  background-color: #121212;
  min-height: 100%;
}
* {
  -webkit-tap-highlight-color: transparent;
}
[role="button"], [role="tab"], button, a {
  cursor: pointer;
}
[role="tab"]:hover {
  opacity: 0.9;
}
input, textarea {
  outline: none;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: #2A2A30;
  border-radius: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
`;

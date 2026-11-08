import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import { fi } from './src/i18n/fi.ts';

// GitHub Pages serves the app from /<repo-name>/. The manifest's start_url and
// scope are derived from this so they cannot drift apart.
const base = '/isan-viinit/';
const themeColor = '#7b1e3a';
const backgroundColor = '#faf6f1';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    {
      // Keeps the page title in fi.ts along with every other Finnish string.
      name: 'inject-app-name',
      transformIndexHtml: (html) => html.replaceAll('%APP_NAME%', fi.appName),
    },
    VitePWA({
      registerType: 'prompt',
      // The icons are already precached through globPatterns.
      includeManifestIcons: false,
      manifest: {
        name: fi.appName,
        short_name: fi.appName,
        description: fi.appDescription,
        lang: 'fi',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        theme_color: themeColor,
        background_color: backgroundColor,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // json covers public/knowledge.json once it exists (M1), so it works offline.
        globPatterns: ['**/*.{js,css,html,png,svg,json}'],
      },
    }),
  ],
});

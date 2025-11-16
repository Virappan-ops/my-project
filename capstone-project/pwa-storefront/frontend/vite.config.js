import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PWA Storefront',
        short_name: 'MyStore',
        description: 'An offline-first PWA storefront',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      // --- YEH HAI ASLI FIX ---
      // Strategy 'injectManifest' honi chahiye
      strategy: 'injectManifest',
      
      // Apni custom service worker file ka path
      srcDir: 'src',
      filename: 'sw.js',
      // -------------------------
    }),
  ],
  server: {
    // Proxy (sirf development ke liye)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
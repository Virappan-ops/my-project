import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // ... (plugins aur server proxy section waise hi rahenge) ...
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        // ... (manifest data waisa hi rahega) ...
        name: 'PWA Storefront',
        short_name: 'MyStore',
        description: 'An offline-first PWA storefront',
        theme_color: '#ffffff',
        icons: [ /* ... (icons waise hi) ... */ ],
      },

      // --- YE SECTION BADAL RAHA HAI ---
      // 'generateSW' (default) se 'injectManifest' mein badlein
      strategy: 'injectManifest',
      
      // Hamari custom service worker source file ka path
      srcDir: 'src',
      filename: 'sw.js',
      // ---------------------------------
      
      // 'workbox' section ab yahan nahi chahiye,
      // kyunki 'runtimeCaching' ab hum 'src/sw.js' mein manage karenge.
    }),
  ],
  server: {
    // Proxy (ye waisa hi rahega)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
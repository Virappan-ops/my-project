// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // Aapka manifest object (Yeh bilkul sahi hai)
      manifest: {
        name: 'PWA Storefront',
        short_name: 'MyStore',
        description: 'An offline-first PWA storefront',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // Yeh files 'public' folder mein honi chahiye
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png', // Yeh files 'public' folder mein honi chahiye
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      // Aapki custom SW strategy (Yeh bhi sahi hai)
      strategy: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      
      // --- YEH NAYA ADD KIYA GAYA HAI (NAVIGATION FIX) ---
      workbox: {
        // Sabhi navigation requests ko 'index.html' par bhej do
        navigateFallback: '/index.html',
        
        // 'allowlist' batata hai ki kin routes par upar wala rule laagu ho
        navigateFallbackAllowlist: [
          /^\/home/,   // /home se shuru hone wale
          /^\/cart/,   // /cart se shuru hone wale
          /^\/orders/, // /orders se shuru hone wale
        ],
      }
      // --- FIX KHATAM ---
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
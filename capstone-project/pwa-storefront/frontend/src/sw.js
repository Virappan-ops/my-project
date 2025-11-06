/* eslint-disable no-restricted-globals */

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { openDB } from 'idb';

// 1. Pre-caching (Vite PWA plugin iske liye yahan code inject karega)
// 'self.__WB_MANIFEST' ko mat badlein
precacheAndRoute(self.__WB_MANIFEST || []);

// 2. Runtime Caching (Jo humne vite.config.js se hataya tha)

// API Caching (Products)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/products'),
  new StaleWhileRevalidate({
    cacheName: 'api-product-cache',
    plugins: [],
  })
);

// Image Caching
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [],
  })
);


// 3. --- BACKGROUND SYNC LOGIC ---

// Database helper (SW ke andar)
const DB_NAME = 'pwa-store-db';
const SYNC_QUEUE_STORE = 'sync-queue';

async function getDb() {
  return openDB(DB_NAME, 2); // Assume version 2
}

// Sync event ko suno
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event sun raha hoon!', event.tag);
  
  // Agar 'sync-new-order' tag hai, toh process karo
  if (event.tag === 'sync-new-order') {
    event.waitUntil(processSyncQueue());
  }
});

// Queue ko process karne ka function
async function processSyncQueue() {
  const db = await getDb();
  
  // 1. Queue se saare pending orders nikaalo
  const allActions = await db.getAll(SYNC_QUEUE_STORE);
  
  console.log(`[Service Worker] Sync queue mein ${allActions.length} item mile.`);

  for (const action of allActions) {
    try {
      console.log('[Service Worker] Action process kar raha hoon:', action);

      // 2. Server ko 'fetch' (POST) request bhejo
      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action.payload), // Order data bhejo
      });

      if (response.ok) {
        // 3a. Agar successful, toh queue se delete kar do
        console.log(`[Service Worker] Action ID ${action.id} safaltapurvak sync hua.`);
        await db.delete(SYNC_QUEUE_STORE, action.id);
      } else {
        // 3b. Agar fail hua (e.g., server 500 error), toh log karo
        console.error(`[Service Worker] Action ID ${action.id} sync fail hua.`, response);
        // Hum ise queue mein chhod denge taaki agle sync mein try ho sake
      }
    } catch (err) {
      // 3c. Agar fetch hi fail ho gaya (network firse chala gaya?)
      console.error('[Service Worker] Sync fetch error:', err);
      // Kuch mat karo, agle sync mein try hoga
    }
  }
}

// Service worker ko update hone par activate karein
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
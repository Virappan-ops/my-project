/* eslint-disable no-restricted-globals */

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { openDB } from 'idb';

// --- Backend ka poora URL ---
const API_BASE_URL = 'http://localhost:5000'; 

// 1. Pre-caching
precacheAndRoute(self.__WB_MANIFEST || []);

// 2. Runtime Caching (Products & Images)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/products'),
  new StaleWhileRevalidate({ cacheName: 'api-product-cache' })
);
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'image-cache' })
);

// 3. --- BACKGROUND SYNC LOGIC ---
const DB_NAME = 'pwa-store-db';
const SYNC_QUEUE_STORE = 'sync-queue';

async function getDb() {
  return openDB(DB_NAME, 2); // Ye 'db.js' se match hona chahiye
}

// --- NEW: Helper to send messages to the app ---
async function broadcastToClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(message);
  });
}

// Sync event ko suno
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event received!', event.tag);
  if (event.tag === 'sync-new-order') { 
    event.waitUntil(processSyncQueue());
  }
});

// --- NEW: Listen for messages from the app (e.g., "MANUAL_SYNC") ---
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'MANUAL_SYNC') {
    console.log('[Service Worker] Manual sync triggered from app.');
    event.waitUntil(processSyncQueue());
  }
});

// Queue ko process karne ka function
async function processSyncQueue() {
  // --- NEW: Tell the app we are starting the sync ---
  await broadcastToClients({ type: 'SYNC_START' });
  
  const db = await getDb();
  const allActions = await db.getAll(SYNC_QUEUE_STORE); 
  
  console.log(`[Service Worker] Found ${allActions.length} items in sync queue.`);
  let syncFailed = false;

  for (const action of allActions) {
    try {
      console.log('[Service Worker] Processing action:', action);

      const response = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${action.token}`
        },
        body: JSON.stringify(action.payload),
      });

      if (response.ok) {
        console.log(`[Service Worker] Action ID ${action.id} synced successfully.`);
        await db.delete(SYNC_QUEUE_STORE, action.id);
      } else {
        console.error(`[Service Worker] Action ID ${action.id} failed to sync.`, response);
        if (response.status === 401) { // Bad token, delete it
          await db.delete(SYNC_QUEUE_STORE, action.id);
        } else {
          syncFailed = true; // Keep it for next sync
        }
      }
    } catch (err) {
      console.error('[Service Worker] Sync fetch error:', err);
      syncFailed = true; // Network error, keep it for next sync
    }
  }

  // --- NEW: Tell the app we are finished ---
  await broadcastToClients({ type: 'SYNC_COMPLETE', failed: syncFailed });
  console.log('[Service Worker] Sync processing finished.');
}
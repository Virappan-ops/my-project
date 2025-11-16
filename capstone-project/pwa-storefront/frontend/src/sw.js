// src/sw.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { clientsClaim } from 'workbox-core';

precacheAndRoute(self.__WB_MANIFEST || []);

self.skipWaiting();
clientsClaim();

// 1. API Calls (Network First)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-cache' })
);

// 2. Assets (Stale While Revalidate)
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new StaleWhileRevalidate({ cacheName: 'assets-cache' })
);

// ----------------------------------------------------
// --- OFFLINE ORDER SYNC LOGIC (FIXED) ---
// ----------------------------------------------------

// 1. IndexedDB library import
importScripts('https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js');

// 2. DB helper functions (db.js se match karte hue)
const DB_NAME = 'e-com-db';
const DB_VERSION = 1; 

// 'syncQueue' se data nikalega
const getAllSyncActions = async () => {
  const db = await idb.openDB(DB_NAME, DB_VERSION);
  return db.getAll('syncQueue');
};

// 'syncQueue' ko clear karega
const clearSyncQueue = async () => {
  const db = await idb.openDB(DB_NAME, DB_VERSION);
  await db.clear('syncQueue');
};


// 3. 'sync' event ko suno
self.addEventListener('sync', (event) => {
  // Yeh tag aapki CartPage.jsx se match ho raha hai
  if (event.tag === 'sync-new-order') {
    console.log('[SW] Sync event triggered: sync-new-order');
    postMessageToClient('SYNC_START');
    
    event.waitUntil(
      syncPendingCheckouts()
        .then(() => {
          console.log('[SW] Sync complete!');
          postMessageToClient('SYNC_COMPLETE');
        })
        .catch((err) => {
          console.error('[SW] Sync failed:', err);
          postMessageToClient('SYNC_FAILED');
        })
    );
  }
});

// 4. Server ko data bhejne wala function (FIXED)
async function syncPendingCheckouts() {
  const allActions = await getAllSyncActions();
  
  // Sirf checkout wale actions ko filter karo
  const checkoutActions = allActions.filter(action => action.type === 'checkout');

  if (checkoutActions.length === 0) {
    console.log('[SW] No pending checkout actions to sync.');
    return;
  }

  console.log(`[SW] Syncing ${checkoutActions.length} pending checkouts...`);

  const promises = checkoutActions.map(action => {
    const orderData = action.payload; // payload ko nikalo
    const token = action.token;       // token ko nikalo

    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Agar token hai, toh header mein add karo
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch('/api/orders/checkout', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(orderData),
    });
  });

  const responses = await Promise.all(promises);
  const allSuccessful = responses.every(res => res.ok);

  if (allSuccessful) {
    console.log('[SW] All pending checkouts synced successfully.');
    await clearSyncQueue();
  } else {
    console.error('[SW] Some pending checkouts failed to sync.');
    throw new Error('Sync failed, will retry later.');
  }
}

// 5. Client (React app) ko message bhejne wala helper
async function postMessageToClient(messageType) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  clients.forEach(client => {
    client.postMessage({ type: messageType });
  });
}
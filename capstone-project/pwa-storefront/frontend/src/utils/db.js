import { openDB } from 'idb';

const DB_NAME = 'pwa-store-db';
const DB_VERSION = 2; // Version 2
const CART_STORE = 'cart-items';
const SYNC_QUEUE_STORE = 'sync-queue'; // This MUST match sw.js

async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      switch (oldVersion) {
        case 0:
          console.log('Database creating (v0 -> v2)');
          db.createObjectStore(CART_STORE, { keyPath: 'productId' });
          db.createObjectStore(SYNC_QUEUE_STORE, { autoIncrement: true, keyPath: 'id' });
          break;
        case 1:
          console.log('Database upgrading (v1 -> v2)');
          db.createObjectStore(SYNC_QUEUE_STORE, { autoIncrement: true, keyPath: 'id' });
          break;
      }
    },
  });
  return db;
}

// --- Cart Functions ---
export async function addOrUpdateCartItem(item) {
  const db = await initDB();
  await db.put(CART_STORE, item); // 'put' overwrites, fixing duplicate bug
}

export async function getCartItems() {
  const db = await initDB();
  return db.getAll(CART_STORE);
}

export async function removeCartItem(productId) {
  const db = await initDB();
  await db.delete(CART_STORE, productId);
}

export async function clearCart() {
  const db = await initDB();
  await db.clear(CART_STORE);
}

// --- SYNC QUEUE Functions (Correct) ---
export async function addToSyncQueue(action) {
  const db = await initDB();
  return db.add(SYNC_QUEUE_STORE, action);
}

export async function getSyncQueue() {
  const db = await initDB();
  return db.getAll(SYNC_QUEUE_STORE);
}

export async function removeFromSyncQueue(actionId) {
  const db = await initDB();
  return db.delete(SYNC_QUEUE_STORE, actionId);
}
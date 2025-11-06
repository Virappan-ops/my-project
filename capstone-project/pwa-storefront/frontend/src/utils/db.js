import { openDB } from 'idb';

const DB_NAME = 'pwa-store-db';
const DB_VERSION = 2; // Hum ab version 2 par hain
const CART_STORE = 'cart-items';
const SYNC_QUEUE_STORE = 'sync-queue';

// Database ko initialize karne ka function
async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    // 'upgrade' function tab chalta hai jab version badalta hai ya DB naya banta hai
    upgrade(db, oldVersion) {
      // Ye 'switch' logic sabse best hai.
      // Ye check karega ki purana version kya tha aur us hisab se stores banayega.
      
      switch (oldVersion) {
        case 0:
          // 'oldVersion' 0 ka matlab hai database naya ban raha hai.
          // Dono stores banado.
          console.log('Database ban raha hai (v0 -> v2)');
          db.createObjectStore(CART_STORE, { keyPath: 'productId' });
          db.createObjectStore(SYNC_QUEUE_STORE, { autoIncrement: true, keyPath: 'id' });
          break;
        case 1:
          // 'oldVersion' 1 ka matlab hai user ke paas purana 'cart-items' wala DB hai.
          // Sirf naya 'sync-queue' store add karo.
          console.log('Database upgrade ho raha hai (v1 -> v2)');
          db.createObjectStore(SYNC_QUEUE_STORE, { autoIncrement: true, keyPath: 'id' });
          break;
      }
    },
  });
  return db;
}

// --- Cart Functions ---

// Cart mein naya item add karna (ya quantity update karna)
export async function addOrUpdateCartItem(item) {
  const db = await initDB();
  const tx = db.transaction(CART_STORE, 'readwrite');
  const store = tx.objectStore(CART_STORE);
  
  const existingItem = await store.get(item.productId);

  if (existingItem) {
    existingItem.quantity += (item.quantity || 1); // Quantity badhao
    await store.put(existingItem);
  } else {
    await store.put(item); // Naya item add karo
  }
  
  return tx.done;
}

// Cart se saare items get karna
export async function getCartItems() {
  const db = await initDB();
  // Ye 'CART_STORE' se saara data laayega
  return db.getAll(CART_STORE);
}

// Cart se ek item remove karna
export async function removeCartItem(productId) {
  const db = await initDB();
  const tx = db.transaction(CART_STORE, 'readwrite');
  await tx.objectStore(CART_STORE).delete(productId);
  return tx.done;
}

// Poora cart clear karna (checkout ke baad)
export async function clearCart() {
  const db = await initDB();
  const tx = db.transaction(CART_STORE, 'readwrite');
  await tx.objectStore(CART_STORE).clear();
  return tx.done;
}


// --- SYNC QUEUE Functions (Ye waise hi rahenge) ---

// Queue mein naya action add karna
export async function addToSyncQueue(action) {
  const db = await initDB();
  const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
  await tx.objectStore(SYNC_QUEUE_STORE).add(action);
  return tx.done;
}

// Queue se saare pending actions get karna
export async function getSyncQueue() {
  const db = await initDB();
  return db.getAll(SYNC_QUEUE_STORE);
}

// Queue se ek action remove karna (jab wo sync ho jaaye)
export async function removeFromSyncQueue(actionId) {
  const db = await initDB();
  const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
  await tx.objectStore(SYNC_QUEUE_STORE).delete(actionId);
  return tx.done;
}
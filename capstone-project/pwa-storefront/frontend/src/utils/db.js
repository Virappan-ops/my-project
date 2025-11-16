// src/utils/db.js
import { openDB } from 'idb';

const DB_NAME = 'e-com-db';
const DB_VERSION = 1;

const initDB = () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 1. Cart store
      if (!db.objectStoreNames.contains('cart')) {
        db.createObjectStore('cart', { keyPath: 'productId' });
      }
      
      // 2. Sync Queue store (Aapke CartPage ke hisaab se)
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// --- Cart Functions ---

export const addOrUpdateCartItem = async (item) => {
  const db = await initDB();
  await db.put('cart', item);
};

// 'getCartItems' (bina "All") - yahi AuthContext ko chahiye
export const getCartItems = async () => {
  const db = await initDB();
  return db.getAll('cart');
};

export const removeCartItem = async (productId) => {
  const db = await initDB();
  await db.delete('cart', productId);
};

export const clearCart = async () => {
  const db = await initDB();
  await db.clear('cart');
};

// --- Sync Queue Functions (Aapke CartPage ke hisaab se) ---

export const addToSyncQueue = async (action) => {
  const db = await initDB();
  await db.add('syncQueue', action);
};

// Yeh functions SW ke liye hain
export const getAllSyncActions = async () => {
  const db = await initDB();
  return db.getAll('syncQueue');
};

export const clearSyncQueue = async () => {
  const db = await initDB();
  await db.clear('syncQueue');
};
// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// --- YEH RAHA FIX ---
// 'getAllCartItems' ko 'getCartItems' kar diya
import { getCartItems, clearCart, addOrUpdateCartItem } from '../utils/db';
// --- FIX KHATAM ---

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncAndLoadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          // "LOCAL WINS" SYNC LOGIC
          // --- YEH RAHA FIX ---
          const localCart = await getCartItems(); // 'getAllCartItems' ko badla
          // --- FIX KHATAM ---
          
          const updatedRes = await axios.post('/api/cart/update', { cart: localCart });
          const finalCart = updatedRes.data; 

          await clearCart();
          for (const item of finalCart) {
            await addOrUpdateCartItem(item);
          }
          
          const savedUser = JSON.parse(localStorage.getItem('user'));
          setUser({ ...savedUser, cart: finalCart });
          
        } catch (err) {
          console.error("Token invalid or sync failed, logging out", err);
          logout();
        }
      }
      setLoading(false);
    };

    syncAndLoadUser();
  }, []);

  // --- LOGIN FUNCTION ---
  const login = async (loginData) => {
    setLoading(true);
    try {
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${loginData.token}`;

      const serverCart = loginData.user.cart || [];
      // --- YEH RAHA FIX ---
      const localCart = await getCartItems(); // 'getAllCartItems' ko badla
      // --- FIX KHATAM ---

      const mergedCartMap = new Map();
      serverCart.forEach(item => mergedCartMap.set(item.productId, item));
      localCart.forEach(item => mergedCartMap.set(item.productId, item)); // Local wins
      const mergedCart = Array.from(mergedCartMap.values());
      
      const updatedRes = await axios.post('/api/cart/update', { cart: mergedCart });
      const finalCart = updatedRes.data;

      await clearCart();
      for (const item of finalCart) {
        await addOrUpdateCartItem(item);
      }

      setToken(loginData.token);
      setUser({ ...loginData.user, cart: finalCart });

    } catch (err) {
      console.error("Login sync failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT FUNCTION ---
  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    try {
      await clearCart();
    } catch (err) {
      console.error("Failed to clear local cart on logout:", err);
    }
  };

  const value = {
    token,
    user,
    setUser,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
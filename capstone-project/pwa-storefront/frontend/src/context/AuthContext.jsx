import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
// db.js se in functions ko import karein
import { getCartItems, clearCart, addOrUpdateCartItem } from '../utils/db'; // 'getCartItems' ki ab login mein zarurat nahi

// ... (Context banana waisa hi rahega) ...
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user'))); // User ko storage se load karein
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // App load hone par local DB ko server cart se sync karein
        try {
          const res = await axios.get('/api/cart');
          const serverCart = res.data;
          
          await clearCart(); // Local ko saaf karo
          for (const item of serverCart) { // Server cart ko local mein daalo
            await addOrUpdateCartItem(item);
          }
        } catch (err) {
          console.error("Token invalid, logging out");
          logout(); // logout function ko call karein
        }

      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    };

    loadData();
  }, [token]); // Token change hone par run karein

  // --- LOGIN FUNCTION (UPDATED) ---
  const login = async (data) => {
    setLoading(true);
    try {
      // 1. Token aur User data set karein
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setToken(data.token);
      setUser(data.user);

      // 2. Server cart (jo login response se mila) lo
      const serverCart = data.user.cart || [];

      // 3. Local IndexedDB ko saaf karo
      await clearCart();

      // 4. Local IndexedDB ko Server cart se bharo
      for (const item of serverCart) {
        await addOrUpdateCartItem(item);
      }
      
    } catch (err) {
      console.error("Login sync fail hua:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT FUNCTION (UPDATED) ---
  const logout = async () => { // Ise 'async' banayein
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    
    // Sabse zaroori: Cart bleeding rokne ke liye local DB clear karein
    try {
      await clearCart();
    } catch (err) {
      console.error("Logout par local cart clear nahi ho paaya:", err);
    }
  };

  const value = {
    token,
    user,
    setUser, // setUser ko export karein
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
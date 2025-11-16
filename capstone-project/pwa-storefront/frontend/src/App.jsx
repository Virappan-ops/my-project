import React, { useContext, useEffect, useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useOnlineStatus } from './useOnlineStatus';

// --- MUI Theme Imports ---
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from './context/ThemeContext'; // Hamara naya context
// -------------------------

import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrdersPage from './pages/OrdersPage';

import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/OfflineBanner';
import Sidebar from './components/Sidebar';
import SyncBanner from './components/SyncBanner';

function App() {
  const { token } = useContext(AuthContext);
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  
  // --- NAYA THEME CODE ---
  const { mode } = useContext(ThemeContext); 

  const theme = useMemo(() => {
    // --- YEH AAPKA NAYA GRADIENT HAI ---
    const lightGradient = 'linear-gradient(120deg, #e6f7ff 0%, #f0f8ff 100%)'; // Light Bluish
    const darkGradient = 'linear-gradient(120deg, #2d3436 0%, #000000 100%)';

    return createTheme({
      palette: {
        mode: mode,
        background: {
          default: mode === 'light' ? lightGradient : darkGradient,
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundImage: mode === 'light' ? lightGradient : darkGradient,
              backgroundAttachment: 'fixed',
              backgroundSize: 'cover',
            },
          },
        },
      },
    });
  }, [mode]);
  // --- END THEME CODE ---

  // ... (aapka baaki useEffect logic waise ka waisa rahega) ...
  
  useEffect(() => {
    if (isOnline && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.active) {
          try {
            reg.active.postMessage({ type: 'MANUAL_SYNC' });
            console.log('App → asked SW to MANUAL_SYNC');
          } catch (err) {
            console.warn('Failed to postMessage to SW', err);
          }
        }
      });
    }
  }, [isOnline]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const msg = event.data;
        if (msg?.type === 'SYNC_START') {
          setSyncing(true);
        } else if (msg?.type === 'SYNC_COMPLETE') {
          setSyncing(false);
          if (window.location.pathname === '/orders') {
            window.location.reload();
          }
        }
      });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <BrowserRouter>
        <OfflineBanner />
        <SyncBanner syncing={syncing} />
        {token && <Sidebar />}

        <div className="app-container">
          <Routes>
            <Route
              path="/login"
              element={!token ? <LoginPage /> : <Navigate to="/home" replace />}
            />
            <Route
              path="/signup"
              element={!token ? <SignupPage /> : <Navigate to="/home" replace />}
            />
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>
            <Route
              path="*"
              element={<Navigate to={token ? '/home' : '/login'} replace />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
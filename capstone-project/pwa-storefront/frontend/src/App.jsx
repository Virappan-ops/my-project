// App.jsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useOnlineStatus } from './useOnlineStatus';

// --- MUI Theme Imports ---
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from './context/ThemeContext'; // Aapka context
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

// --- YEH NAYE GRADIENT COLORS HAIN (OPTION 1 WALE) ---
const lightColors = {
  bg: '#f0f2f5', // Light grey BG
  color1: 'hsla(210, 60%, 70%, 0.3)', // Light blue
  color2: 'hsla(340, 60%, 70%, 0.3)', // Light pink
  color3: 'hsla(190, 60%, 70%, 0.3)', // Light cyan
};

const darkColors = {
  bg: '#121212', // Dark BG
  color1: 'hsla(210, 60%, 40%, 0.4)', // Deeper blue
  color2: 'hsla(340, 60%, 40%, 0.4)', // Deeper pink
  color3: 'hsla(190, 60%, 40%, 0.4)', // Deeper cyan
};
// --- YAHAN TAK ---

function App() {
  const { token } = useContext(AuthContext);
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  
  // --- AAPKA THEME CODE ---
  const { mode } = useContext(ThemeContext); 

  const theme = useMemo(() => {
    
    // Yahan check hota hai 'light' hai ya 'dark'
    const colors = mode === 'light' ? lightColors : darkColors;

    return createTheme({
      palette: {
        mode: mode,
        // Background ka default color set kiya
        background: {
          default: colors.bg, 
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              // --- YAHAN BADLAAV KIYA GAYA HAI ---
              // Aapke linear-gradient ko naye mesh gradient se badal diya
              backgroundColor: colors.bg,
              backgroundImage: `
                radial-gradient(at 0% 0%, ${colors.color1} 0px, transparent 50%),
                radial-gradient(at 100% 100%, ${colors.color2} 0px, transparent 50%),
                radial-gradient(at 0% 100%, ${colors.color3} 0px, transparent 50%)
              `,
              // --- BADLAAV KHATAM ---
              
              backgroundAttachment: 'fixed',
              transition: 'background-color 0.3s ease, background-image 0.3s ease',
            },
          },
        },
      },
    });
  }, [mode]);
  // --- END THEME CODE ---

  // ... (Aapka baaki useEffect logic waise ka waisa rahega) ...
  
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
            {/* ... Aapke saare routes ... */}
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
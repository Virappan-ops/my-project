import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext'; // <-- 1. Import Karein
import { registerSW } from 'virtual:pwa-register';

registerSW({ onNeedRefresh: () => {}, onOfflineReady: () => {} });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. App ko AuthProvider ke BAHAAR wrap karein */}
    <CustomThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </CustomThemeProvider>
  </React.StrictMode>,
);
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrdersPage from './pages/OrdersPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/OfflineBanner';
import Sidebar from './components/Sidebar'; // <-- Sidebar ko import karein

function App() {
  const { token } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <OfflineBanner />
      
      {/* Agar user logged-in hai, toh Sidebar dikhayein */}
      {token && <Sidebar />} 

      <div className="app-container">
        <Routes>
          {/* Public Routes (Login/Signup) */}
          <Route 
            path="/login" 
            element={!token ? <LoginPage /> : <Navigate to="/home" replace />} 
          />
          <Route 
            path="/signup" 
            element={!token ? <SignupPage /> : <Navigate to="/home" replace />} 
          />

          {/* Protected Routes (Inke liye login zaroori hai) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>
          
          {/* Default Route */}
          <Route 
            path="*" 
            element={<Navigate to={token ? "/home" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
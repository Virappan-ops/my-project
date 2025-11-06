import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <h2>Loading...</h2>; // Loading state jab token check ho raha ho
  }

  // Agar token nahi hai, toh /login par bhej do
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Agar token hai, toh child component (HomePage, CartPage) ko render karo
  return <Outlet />;
}

export default ProtectedRoute;
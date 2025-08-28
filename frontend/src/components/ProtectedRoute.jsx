import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requireCustomer = false, requireStaff = false }) => {
  const { user, loading, isAuthenticated, isCustomer, isStaff } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If customer access is required but user is not a customer
  if (requireCustomer && !isCustomer()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If staff access is required but user is not staff
  if (requireStaff && !isStaff()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access auth pages, redirect appropriately
  if (!requireAuth && isAuthenticated()) {
    if (isCustomer()) {
      return <Navigate to="/dashboard" replace />;
    } else if (isStaff()) {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
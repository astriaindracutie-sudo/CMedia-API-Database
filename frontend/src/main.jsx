import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

import './components/Starfield.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: (
      <ProtectedRoute requireAuth={false}>
        <LoginPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <ProtectedRoute requireAuth={false}>
        <RegisterPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <ProtectedRoute requireAuth={false}>
        <ForgotPasswordPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requireAuth={true} requireCustomer={true}>
        <CustomerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/services',
    element: <ServicesPage />,
  },
  {
    path: '/services/:category',
    element: <ServicesPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAuth={true} requireStaff={true}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);

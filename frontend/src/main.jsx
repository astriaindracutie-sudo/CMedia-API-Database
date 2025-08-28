import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminPage from './pages/AdminPage.jsx';
import './components/Starfield.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

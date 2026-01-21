import { Navigate, Outlet } from 'react-router-dom';

// Dashboard Guard: Redirects to login if NOT authenticated
export const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// Auth Guard: Redirects to /hospital if ALREADY authenticated
export const PublicRoute = () => {
  const token = localStorage.getItem('access_token');
  return token ? <Navigate to="/hospital" replace /> : <Outlet />;
};
import { useNavigate, Navigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * A wrapper component that redirects to /login if no access token is found.
 */
export const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

/**
 * A reusable Logout button that clears session data and redirects.
 */
export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Clear all session data
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');

    // 2. Show notification
    toast.success("Logged out successfully");

    // 3. Redirect to login
    navigate('/login', { replace: true });
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center text-red-600 hover:bg-red-50 p-2 rounded-lg"
    >
      Logout
    </button>
  );
};
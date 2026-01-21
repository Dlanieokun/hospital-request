import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LogoutButton = () => {
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
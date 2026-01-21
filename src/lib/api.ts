// Helper to get headers with the Bearer token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  const type = localStorage.getItem('token_type') || 'Bearer';

  if (!token) return { 'Content-Type': 'application/json', 'Accept': 'application/json' };

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${type} ${token}`,
  };
};

// Helper to logout
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
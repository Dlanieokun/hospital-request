import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserCircle, Hospital, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loginPromise = fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/hospital', { replace: true });
      return data;
    });

    toast.promise(loginPromise, {
      loading: 'Authenticating...',
      success: 'Welcome back!',
      error: (err) => `${err.message}`,
    });

    try { await loginPromise; } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4 text-blue-600">
            <Hospital size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Portal</h1>
          <p className="text-slate-500 mt-1">Access your certificates</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username or Email</label>
            <div className="relative">
              <UserCircle className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input name="login" required onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50/50" placeholder="Enter credentials" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input name="password" type="password" required onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50/50" placeholder="••••••••" />
            </div>
          </div>
          <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center shadow-lg shadow-blue-200">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
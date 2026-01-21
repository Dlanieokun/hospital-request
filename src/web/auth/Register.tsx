import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, AtSign, ArrowLeft, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', username: '', role: '', password: '', password_confirmation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) return toast.error("Passwords do not match");

    setIsLoading(true);
    const registerPromise = fetch('http://127.0.0.1:8000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      navigate('/login');
      return data;
    });

    toast.promise(registerPromise, {
      loading: 'Creating account...',
      success: 'Registration successful!',
      error: (err) => `${err.message}`,
    });

    try { await registerPromise; } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <button onClick={() => navigate('/login')} className="inline-flex items-center text-sm text-slate-400 hover:text-blue-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">Create System Account</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <div className="relative mt-1">
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input name="name" required onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" placeholder="Ronald Mercado" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative mt-1">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input name="email" type="email" required onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" placeholder="asdasd@gmail.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Role</label>
              <div className="relative mt-1">
                <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <select name="role" required onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 appearance-none">
                  <option value="">Select Role</option>
                  <option value="administrator">Administrator</option>
                  <option value="doctor">Doctor</option>
                  <option value="treasurer">Treasurer</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Username</label>
            <div className="relative mt-1">
              <AtSign className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input name="username" required onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" placeholder="test" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-1">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input name="password" type="password" required onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
              <div className="relative mt-1">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input name="password_confirmation" type="password" required onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4 transition-all flex justify-center items-center shadow-lg">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
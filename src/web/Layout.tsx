import React, { useState, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Home,
  Landmark, FileCheck, Settings, LogOut,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionTimeoutModal from '../components/SessionTimeoutModal';

// IMPORT ASSETS
import leyteLogo from '../assets/leyte_provl_logo.jpg';
import hospitalLogo from '../assets/logo.png'; 

const Layouts: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // User session handling
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { name: 'Medical Staff', role: 'Staff' };
  const userRole = user.role?.toLowerCase() || '';

  const handleLogout = useCallback(() => {
    localStorage.clear();
    toast.success("Signed out successfully");
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleTimeout = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowTimeoutWarning(false);
    localStorage.clear();
    toast.error("Session expired due to inactivity");
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleWarning = useCallback(() => {
    setShowTimeoutWarning(true);
    setCountdown(10);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const { reset } = useSessionTimeout({ onWarning: handleWarning, onTimeout: handleTimeout });

  const handleStayLoggedIn = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowTimeoutWarning(false);
    reset();
  };

  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Dashboard', 
      path: '/hospital',
      allowedRoles: ['administrator', 'medical records', 'hospital cashier'] 
    },
    { 
      icon: <Landmark size={20} />, 
      label: 'Billing & Fees', 
      path: '/hospital/cashier',
      allowedRoles: ['administrator', 'hospital cashier'] 
    },
    { 
      icon: <FileCheck size={20} />, 
      label: 'Certificates', 
      path: '/hospital/certificate',
      allowedRoles: ['administrator', 'medical records'] 
    },
    { 
      icon: <Settings size={20} />, 
      label: 'System Setup', 
      path: '/hospital/settings',
      allowedRoles: ['administrator'] 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  return (
    <div className="flex min-h-screen bg-slate-50 transition-colors duration-300 text-slate-600">
      <SessionTimeoutModal
        isOpen={showTimeoutWarning}
        countdown={countdown}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
      />
      {/* Sidebar */}
      <aside className={`h-screen sticky top-0 flex flex-col transition-all duration-500 border-r z-20 bg-white border-slate-200 shadow-xl ${isCollapsed ? 'w-20' : 'w-72'}`}>
        
        {/* Hospital Branding Section */}
        <div className="p-6 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img 
                src={hospitalLogo} 
                alt="Hospital Logo" 
                className="w-10 h-10 object-contain rounded-lg"
              />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">
                HOSPITAL<span className="text-emerald-500">RCS</span>
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 mt-6 space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.label} 
                to={item.path} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium group ${
                  isActive 
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                  : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-emerald-500'}`}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Leyte Provincial Logo */}
        <div className={`px-8 py-6 flex flex-col items-center justify-center transition-all duration-500 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <img 
            src={leyteLogo} 
            alt="Leyte Provincial Logo" 
            className="w-28 h-auto object-contain rounded-lg" 
          />
          <p className="mt-3 text-[10px] font-bold text-slate-400 tracking-widest text-center uppercase">
            Province of Leyte
          </p>
        </div>

        {/* Footer: User Profile */}
        <div className="p-4 mt-auto border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
              {user.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
                <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] text-rose-500 font-bold hover:underline">
                  <LogOut size={10} /> SIGN OUT
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b px-10 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-slate-200">
          <div className="flex items-center gap-4">
            <Activity className="text-emerald-500" size={20} />
            <h1 className="text-xl font-bold text-slate-900 capitalize">
              {location.pathname.split('/').pop() || 'Medical Overview'}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layouts;
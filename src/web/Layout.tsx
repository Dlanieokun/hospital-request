import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Home, 
  Sun, Moon, Landmark, FileCheck, Settings, LogOut,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

// IMPORT ASSETS
// Replace these paths if your file structure differs
import leyteLogo from '../assets/leyte_provl_logo.jpg';
import hospitalLogo from '../assets/logo.jpg'; 

const Layouts: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  const location = useLocation();
  const navigate = useNavigate();

  // User session handling
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { name: 'Medical Staff', role: 'Staff' };
  const userRole = user.role?.toLowerCase() || '';

  // Theme Sync
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Signed out successfully");
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Dashboard', 
      path: '/hospital',
      allowedRoles: ['administrator', 'medical staff', 'treasurer'] 
    },
    { 
      icon: <Landmark size={20} />, 
      label: 'Billing & Fees', 
      path: '/hospital/treasurer',
      allowedRoles: ['administrator', 'treasurer'] 
    },
    { 
      icon: <FileCheck size={20} />, 
      label: 'Certificates', 
      path: '/hospital/certificate',
      allowedRoles: ['administrator', 'medical staff'] 
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

  const isDark = theme === 'dark';
  const themeClasses = {
    aside: isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200 shadow-xl',
    mainBg: isDark ? 'bg-slate-900' : 'bg-slate-50',
    navActive: isDark ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-400' : 'bg-blue-50 text-blue-700 border-r-4 border-blue-600',
    footer: isDark ? 'bg-slate-900/50' : 'bg-slate-50/80',
    userName: isDark ? 'text-slate-100' : 'text-slate-900',
  };

  return (
    <div className={`flex min-h-screen ${themeClasses.mainBg} transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`h-screen sticky top-0 flex flex-col transition-all duration-500 border-r z-20 ${themeClasses.aside} ${isCollapsed ? 'w-20' : 'w-72'}`}>
        
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
              <span className={`font-bold text-lg leading-tight tracking-tight ${themeClasses.userName}`}>
                HOSPITAL<span className="text-emerald-500">RCS</span>
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium group ${isActive ? themeClasses.navActive : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
              >
                <div className={`${isActive ? '' : 'text-slate-400 group-hover:text-emerald-500'}`}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Leyte Provincial Logo (Original Color) */}
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

        {/* Footer: User Profile & Theme Toggle */}
        <div className={`p-4 mt-auto border-t border-slate-200 dark:border-slate-800 ${themeClasses.footer}`}>
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">Appearance</span>
              <button onClick={toggleTheme} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {isDark ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-blue-600" />}
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
              {user.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className={`text-sm font-bold truncate ${themeClasses.userName}`}>{user.name}</p>
                <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] text-rose-500 font-bold hover:underline">
                  <LogOut size={10} /> SIGN OUT
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b px-10 flex items-center justify-between bg-white/80 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-10 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Activity className="text-emerald-500" size={20} />
            <h1 className="text-xl font-bold dark:text-white capitalize">
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
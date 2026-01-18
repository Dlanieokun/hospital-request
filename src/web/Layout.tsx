import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Home, LogOut, 
  Sun, Moon, Landmark, FileCheck, Settings 
} from 'lucide-react';

const Layouts: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const location = useLocation();

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Paths updated to match App.tsx nested routes
  const menuItems = [
    { icon: <Home size={20} />, label: 'Overview', path: '/hospital' },
    { icon: <Landmark size={20} />, label: 'Treasurer', path: '/hospital/treasurer' },
    { icon: <FileCheck size={20} />, label: 'Certificate', path: '/hospital/certificate' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/hospital/settings' },
  ];

  const isDark = theme === 'dark';
  const themeClasses = {
    aside: isDark ? 'bg-slate-950 text-slate-400 border-emerald-900/30' : 'bg-white text-slate-600 border-slate-200 shadow-sm',
    mainBg: isDark ? 'bg-slate-900' : 'bg-slate-50',
    logo: isDark ? 'text-emerald-400' : 'text-indigo-600',
    logoDot: isDark ? 'text-white' : 'text-slate-900',
    button: isDark ? 'bg-slate-900 hover:text-emerald-400 border-slate-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200',
    navActive: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-50 text-indigo-700',
    navHover: isDark ? 'hover:bg-emerald-500/10 hover:text-emerald-50' : 'hover:bg-indigo-50 hover:text-indigo-700',
    iconHover: isDark ? 'group-hover:text-emerald-400' : 'group-hover:text-indigo-600',
    footer: isDark ? 'border-slate-900' : 'border-slate-100 bg-slate-50/50',
    profileHover: isDark ? 'hover:bg-slate-900' : 'hover:bg-white hover:shadow-sm hover:border-slate-200',
    userName: isDark ? 'text-slate-100' : 'text-slate-900',
    planText: isDark ? 'text-emerald-600' : 'text-slate-500',
  };

  return (
    <div className={`flex min-h-screen ${themeClasses.mainBg} transition-colors duration-300`}>
      {/* SIDEBAR (Left Side) */}
      <aside 
        className={`h-screen sticky top-0 flex flex-col transition-all duration-300 border-r ${themeClasses.aside} ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-6 flex items-center justify-between overflow-hidden">
          {!isCollapsed && (
            <span className={`font-black text-xl tracking-tighter ${themeClasses.logo}`}>
              Request Certificate System<span className={themeClasses.logoDot}>.</span>
            </span>
          )}
          <div className="flex gap-2">
            <button onClick={toggleTheme} className={`p-1.5 rounded-lg border transition-all ${themeClasses.button}`}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1.5 rounded-lg border transition-all ${themeClasses.button}`}>
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${
                  isActive ? themeClasses.navActive : themeClasses.navHover
                }`}
              >
                <div className={`transition-colors ${isActive ? (isDark ? 'text-emerald-400' : 'text-indigo-600') : 'text-slate-400'} ${themeClasses.iconHover}`}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t transition-colors ${themeClasses.footer}`}>
          <div className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all group border border-transparent ${themeClasses.profileHover}`}>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex-shrink-0 border-2 shadow-sm ${isDark ? 'border-slate-950' : 'border-white'}`} />
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className={`text-sm font-bold truncate ${themeClasses.userName}`}>Alex Rivera</p>
                <p className={`text-xs font-medium truncate ${themeClasses.planText}`}>Pro Plan</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CONTENT AREA (Right Side) */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className={`h-16 border-b flex items-center px-8 transition-colors ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h1 className={`font-bold capitalize ${themeClasses.userName}`}>
            {location.pathname === '/hospital' ? 'Overview' : location.pathname.split('/').pop()}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* THIS IS THE ROUTE DISPLAY */}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layouts;
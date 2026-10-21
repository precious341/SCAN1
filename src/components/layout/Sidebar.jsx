import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  GitCompare, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Report', path: '/upload', icon: UploadCloud },
    { name: 'My Reports', path: '/reports', icon: FileText },
    { name: 'Compare Reports', path: '/compare', icon: GitCompare },
    { name: 'Clinical Assistant', path: '/assistant', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B192C] text-white flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800/80
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">MedScan</h1>
            <p className="text-[10px] text-purple-300 font-semibold tracking-wider uppercase mt-1">Clinical Portal</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-slate-300" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-400/20 text-purple-200 border border-purple-400/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="mb-3 px-2">
            <p className="text-[11px] text-slate-400 truncate">Patient Account</p>
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Patient'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

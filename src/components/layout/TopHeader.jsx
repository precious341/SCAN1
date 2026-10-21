import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Menu, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TopHeader({ onMenuClick, onSearchChange, searchValue = '' }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'P';
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Precious';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 h-18 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search laboratory reports, biomarkers or consult AI..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0B192C] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-2xs"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {/* Security Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Encrypted Vault</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-[#0B192C] hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-bold text-[#0B192C]">Clinical Alerts</p>
                <span className="text-[10px] text-indigo-600 font-semibold cursor-pointer" onClick={() => setShowNotifications(false)}>Clear all</span>
              </div>
              <div className="divide-y divide-slate-50">
                <div 
                  className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
                  onClick={() => { setShowNotifications(false); navigate('/reports'); }}
                >
                  <p className="text-xs font-semibold text-slate-800">Complete Blood Count (CBC) Extracted</p>
                  <p className="text-[11px] text-slate-500">All 7 hematology parameters parsed and reference intervals verified.</p>
                  <p className="text-[10px] text-teal-600 font-medium">Just now</p>
                </div>
                <div 
                  className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
                  onClick={() => { setShowNotifications(false); navigate('/assistant'); }}
                >
                  <p className="text-xs font-semibold text-slate-800">AI Medical Consultation Ready</p>
                  <p className="text-[11px] text-slate-500">Discussion questions prepared for your doctor consultation.</p>
                  <p className="text-[10px] text-indigo-600 font-medium">1 hour ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill Badge */}
        <Link 
          to="/profile"
          className="flex items-center gap-2 pl-2 py-1 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B192C] to-[#1E3E62] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {userInitial}
          </div>
          <span className="text-xs font-bold text-[#0B192C] hidden md:inline">
            {firstName}
          </span>
        </Link>
      </div>
    </header>
  );
}

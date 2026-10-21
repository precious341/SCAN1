import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, MessageSquare, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar({ dark = false }) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Clinical Features', href: '/#features' },
    { name: 'Clinical Assistant', to: '/assistant', isHighlight: true },
    { name: 'Privacy & Vault', href: '/#privacy' },
    { name: 'Disclaimer', href: '/#disclaimer' },
    { name: 'Dashboard', to: '/dashboard' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-200 ${
      dark 
        ? 'bg-[#07111E]/95 backdrop-blur-md border-b border-white/10 text-white' 
        : 'bg-white/95 backdrop-blur-md border-b border-slate-200 text-[#0B192C] shadow-2xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 hover:opacity-95 transition-opacity">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1E3E62] via-[#2A4365] to-[#4338CA] text-white flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-teal-300" />
          </div>
          <div className="flex flex-col">
            <span className={`leading-none text-lg sm:text-xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-[#0B192C]'}`}>
              MedScan
            </span>
            <span className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${dark ? 'text-teal-400' : 'text-teal-600'}`}>
              Medical Report Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation links - Desktop */}
        <nav className={`hidden md:flex items-center gap-5 lg:gap-6 text-xs sm:text-[13px] font-medium ${
          dark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {navLinks.map((item) => {
            if (item.to) {
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    item.isHighlight
                      ? dark
                        ? 'text-teal-300 hover:text-white font-semibold'
                        : 'text-teal-700 hover:text-teal-900 font-semibold'
                      : dark
                        ? 'hover:text-white'
                        : 'hover:text-[#0B192C]'
                  }`}
                >
                  {item.name === 'Clinical Assistant' && <MessageSquare className="w-3.5 h-3.5 text-teal-400" />}
                  {item.name === 'Dashboard' && <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{item.name}</span>
                </Link>
              );
            }
            return (
              <a
                key={item.name}
                href={item.href}
                className={`transition-colors whitespace-nowrap ${dark ? 'hover:text-white' : 'hover:text-[#0B192C]'}`}
              >
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Action buttons & Mobile toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 hover:shadow-md rounded-xl transition-all shadow-sm whitespace-nowrap"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4 text-teal-200" />
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className={`px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  dark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-[#0B192C]'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 hover:from-teal-500 hover:to-purple-500 hover:shadow-md rounded-xl transition-all shadow-sm whitespace-nowrap"
              >
                <span>Get Started</span>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              dark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-[#0B192C] hover:bg-slate-100'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-4 py-4 space-y-3 ${
          dark ? 'bg-[#07111E] border-white/10 text-white' : 'bg-white border-slate-200 text-[#0B192C]'
        }`}>
          <div className="flex flex-col space-y-1.5 text-sm font-medium">
            {navLinks.map((item) => (
              item.to ? (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg flex items-center gap-2.5 ${
                    dark ? 'hover:bg-white/10 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {item.name === 'Clinical Assistant' && <MessageSquare className="w-4 h-4 text-teal-400" />}
                  {item.name === 'Dashboard' && <LayoutDashboard className="w-4 h-4 text-indigo-400" />}
                  <span>{item.name}</span>
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg block ${
                    dark ? 'hover:bg-white/10 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {item.name}
                </a>
              )
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200/20 flex flex-col gap-2">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-bold text-xs bg-teal-600 text-white shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-center py-2 rounded-xl text-xs font-semibold border ${
                    dark ? 'border-white/20 text-white' : 'border-slate-300 text-slate-800'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 text-white shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

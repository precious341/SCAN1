import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      setEmail('preciousifeanyichukwu64@gmail.com');
      setPassword('Password123!');
      await login('preciousifeanyichukwu64@gmail.com', 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 text-2xl font-extrabold text-[#0B192C]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#6366F1] text-white flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6 text-teal-300" />
          </div>
          <span>MedScan</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-[#0B192C]">
          Patient Health Portal
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500">
          Access your clinical reports, biomarker analyses, and health assistant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Instant 1-Click Demo Login Box */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-200/80 shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#0B192C]">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Instant Clinical Demo</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">Pre-loaded with sample laboratory test records & insights.</p>
              </div>
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                disabled={demoLoading || loading}
                className="px-3.5 py-2 bg-[#0B192C] text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-all shrink-0 shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {demoLoading ? (
                  <span>Entering...</span>
                ) : (
                  <>
                    <span>1-Click Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
                  </>
                )}
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="mt-1.5 relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-[#0B192C]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-[#0B192C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#4338CA] hover:shadow-md disabled:opacity-50 transition-all mt-2 active:scale-[0.99]"
            >
              {loading ? (
                <span>Validating credentials...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 text-purple-300" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:underline">
              Create a free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopHeader from '../components/layout/TopHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const payload = { full_name: fullName };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await api.profile.update(payload);
      if (res.success && res.data?.profile) {
        updateUser(res.data.profile);
        setStatusMessage({ type: 'success', text: 'Profile information updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#263746]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#123047] tracking-tight">Patient Profile</h1>
            <p className="text-xs sm:text-sm text-[#697B89]">
              Manage your personal details and account credentials.
            </p>
          </div>

          {statusMessage.text && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#DCE5EC] p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#123047] pb-2 border-b border-slate-100">
                  General Information
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#263746]">Full Legal Name</label>
                  <div className="mt-1.5 relative">
                    <User className="w-4 h-4 text-[#697B89] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#DCE5EC] rounded-lg focus:ring-2 focus:ring-[#168C91] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263746]">Email Address</label>
                  <div className="mt-1.5 relative">
                    <Mail className="w-4 h-4 text-[#697B89] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-[#DCE5EC] rounded-lg text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-[#697B89] mt-1">
                    Email address is tied to your medical session records and cannot be altered directly.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-[#123047]">
                  Change Password (Optional)
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#263746]">Current Password</label>
                  <div className="mt-1.5 relative">
                    <Lock className="w-4 h-4 text-[#697B89] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#DCE5EC] rounded-lg focus:ring-2 focus:ring-[#168C91] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#263746]">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="mt-1.5 w-full px-3 py-2 text-sm bg-white border border-[#DCE5EC] rounded-lg focus:ring-2 focus:ring-[#168C91] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#263746]">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="mt-1.5 w-full px-3 py-2 text-sm bg-white border border-[#DCE5EC] rounded-lg focus:ring-2 focus:ring-[#168C91] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#168C91] text-white text-xs font-semibold rounded-lg hover:bg-[#127074] disabled:opacity-50 transition-colors shadow-2xs"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

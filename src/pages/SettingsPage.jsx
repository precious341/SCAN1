import React, { useState } from 'react';
import { Shield, Bell, Database, Lock, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopHeader from '../components/layout/TopHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function SettingsPage() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('7');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#263746]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#123047] tracking-tight">Account Settings</h1>
            <p className="text-xs sm:text-sm text-[#697B89]">
              Configure system preferences, session longevity, and privacy parameters.
            </p>
          </div>

          {saved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings successfully updated.</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#DCE5EC] p-6 sm:p-8 shadow-xs space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Security & Sessions */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#123047]">
                  <Lock className="w-4 h-4 text-[#168C91]" />
                  <span>Session & Authentication Security</span>
                </div>
                <div>
                  <label className="block text-xs text-[#263746] font-medium">Session Longevity</label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="mt-1.5 w-full sm:w-64 px-3 py-2 text-xs bg-white border border-[#DCE5EC] rounded-lg focus:ring-2 focus:ring-[#168C91] focus:outline-none"
                  >
                    <option value="1">1 Day</option>
                    <option value="7">7 Days (Default)</option>
                    <option value="30">30 Days</option>
                  </select>
                  <p className="text-[11px] text-[#697B89] mt-1">
                    HTTP-only session cookies will expire after the selected duration of inactivity.
                  </p>
                </div>
              </div>

              {/* Privacy Controls */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#123047]">
                  <Shield className="w-4 h-4 text-[#168C91]" />
                  <span>Medical Privacy & AI Controls</span>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-0.5 rounded border-[#DCE5EC] text-[#168C91] focus:ring-[#168C91]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#123047]">Private Processing Guarantee</p>
                    <p className="text-[11px] text-[#697B89] mt-0.5 leading-relaxed">
                      All lab documents remain exclusively in your personal vault. Personal identifiers are never sent to external AI services.
                    </p>
                  </div>
                </label>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#123047]">
                  <Bell className="w-4 h-4 text-[#168C91]" />
                  <span>Extraction & Analysis Notifications</span>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="mt-0.5 rounded border-[#DCE5EC] text-[#168C91] focus:ring-[#168C91]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#123047]">In-App Processing Alerts</p>
                    <p className="text-[11px] text-[#697B89] mt-0.5">
                      Show in-app notification indicators when new reports finish OCR and entity parsing.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#168C91] text-white text-xs font-semibold rounded-lg hover:bg-[#127074] transition-colors shadow-2xs"
                >
                  Save Settings
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

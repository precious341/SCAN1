import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      setNotice(res.data?.message || 'Password reset request processed.');
      setSubmitted(true);
    } catch (err) {
      setNotice(err.message || 'Unable to process request.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 text-2xl font-bold text-[#123047]">
          <div className="w-10 h-10 rounded-xl bg-[#168C91] text-white flex items-center justify-center shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <span>MedScan</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-[#123047]">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-xs text-[#697B89]">
          Enter your registered email address to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-[#DCE5EC] sm:rounded-2xl sm:px-10">
          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-3">
                <Info className="w-5 h-5 text-[#168C91] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#123047]">Delivery Notice</p>
                  <p className="leading-relaxed">{notice}</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#168C91] hover:bg-[#127074] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-[#263746]">Email Address</label>
                <div className="mt-1.5 relative">
                  <Mail className="w-4 h-4 text-[#697B89] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#DCE5EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#168C91] focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#168C91] hover:bg-[#127074] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Checking...' : 'Send Reset Instructions'}
              </button>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168C91] hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

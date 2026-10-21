import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  MessageSquare, 
  Lightbulb, 
  HelpCircle, 
  ArrowRight,
  Heart,
  BookOpen,
  Sparkles,
  GitCompare,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopHeader from '../components/layout/TopHeader.jsx';
import QuickActionCard from '../components/dashboard/QuickActionCard.jsx';
import RecentReportsTable from '../components/dashboard/RecentReportsTable.jsx';
import RecentActivityList from '../components/dashboard/RecentActivityList.jsx';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.reports.list();
      if (res.success && res.data?.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleDeleteReport = (id) => {
    const rep = reports.find(r => r.id === id);
    setDeleteTarget(rep || { id, title: 'Medical Report' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.reports.delete(deleteTarget.id);
      setReports(prev => prev.filter(r => r.id !== deleteTarget.id));
      setFeedback({
        type: 'success',
        message: `Medical report "${deleteTarget.title}" was permanently deleted.`
      });
      setDeleteTarget(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete report.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (!searchQuery) return true;
    return r.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Patient';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B192C]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader 
          onMenuClick={() => setMobileOpen(true)} 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Notification Feedback Toast */}
          {feedback && (
            <div 
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
                feedback.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xs' 
                  : 'bg-rose-50 border-rose-200 text-rose-900 shadow-xs'
              }`}
              role="alert"
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Welcome Banner with clinical status */}
          <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#4338CA] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-purple-200 border border-white/15 shadow-2xs">
                <Activity className="w-3.5 h-3.5 text-teal-300" />
                <span>Encrypted Clinical Health Portal • Patient Diagnostics & Records</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {firstName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                Your medical reports are securely organized. Review extracted lab biomarkers, explore evidence-grounded explanations, or consult your clinical assistant with custom questions.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/assistant"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0B192C] font-bold text-xs rounded-xl hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Consult Clinical Assistant</span>
                </Link>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all backdrop-blur-md"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload New Report</span>
                </Link>
              </div>
            </div>

            {/* Decorative background watermark */}
            <div className="absolute right-4 -bottom-6 text-white/5 pointer-events-none hidden md:block">
              <Activity className="w-56 h-56" />
            </div>
          </div>

          {/* Quick Metrics / Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reports</p>
                <p className="text-xl font-extrabold text-[#0B192C] tabular-nums">{reports.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Analyzed</p>
                <p className="text-xl font-extrabold text-[#0B192C] tabular-nums">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI Assistant</p>
                <p className="text-xl font-extrabold text-[#0B192C]">Online</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vault</p>
                <p className="text-xs font-bold text-[#0B192C]">Isolated</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <QuickActionCard
              title="Upload Lab Report"
              subtitle="PDF, scan, or photo of test results"
              icon={UploadCloud}
              to="/upload"
              iconGradient="from-[#0B192C] via-[#1E3E62] to-[#4338CA]"
            />
            <QuickActionCard
              title="View All Reports"
              subtitle={`${reports.length} laboratory records in portal`}
              icon={FileText}
              to="/reports"
              iconGradient="from-[#1E3E62] to-[#3B82F6]"
            />
            <QuickActionCard
              title="Clinical Assistant"
              subtitle="Live biomarker & medical explanation"
              icon={MessageSquare}
              to="/assistant"
              iconGradient="from-indigo-600 to-purple-600"
            />
          </div>

          {/* Main Dashboard Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8-column section: Recent Reports & Activity */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Recent Reports Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#0B192C]">Recent Medical Reports</h2>
                  <Link 
                    to="/reports" 
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                  >
                    <span>View all ({reports.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <RecentReportsTable 
                  reports={filteredReports.slice(0, 5)} 
                  onDelete={handleDeleteReport}
                  loading={loading}
                />
              </div>

              {/* Recent Activity */}
              <RecentActivityList />

            </div>

            {/* Right 4-column section: Quick Tips & Need Help */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Tips Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="flex items-center gap-2.5 text-[#0B192C]">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Lightbulb className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm font-bold">Clinical Interpretation Tips</h3>
                </div>

                <ol className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-indigo-600">1.</span>
                    <span>Upload readable lab reports (PDF, PNG, JPEG) with clear numbers.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-indigo-600">2.</span>
                    <span>Review test flags (normal, low, high) against reference intervals.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-indigo-600">3.</span>
                    <span>Use generated clinician questions to guide doctor visits.</span>
                  </li>
                </ol>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold">
                    <Heart className="w-3.5 h-3.5 text-purple-600 fill-purple-100" />
                    <span>Evidence-grounded health literacy</span>
                  </div>
                </div>
              </div>

              {/* Need Help Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-center shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 mx-auto flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B192C]">Need Assistance?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Learn how our biomarker parser extracts lab units, flags out-of-range parameters, and crafts personalized discussion topics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="w-full py-2.5 px-3 text-xs font-semibold text-[#0B192C] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                >
                  View Patient Guide
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#0B192C] font-bold text-base">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Patient User Guide</span>
              </div>
              <button 
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-96 overflow-y-auto pr-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-[#0B192C]">1. Document Formats & Security</p>
                <p className="text-slate-500 mt-0.5">We support digital PDFs and lab scans up to 15MB. All files are stored in private server storage.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-[#0B192C]">2. Reference Ranges</p>
                <p className="text-slate-500 mt-0.5">Reference intervals describe typical healthy adult boundaries. Minor shifts outside ranges often happen due to hydration or diet.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-[#0B192C]">3. Clinical AI Assistance</p>
                <p className="text-slate-500 mt-0.5">Our assistant translates obscure medical jargon into clear language and suggests informed questions for your physician.</p>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-[#0B192C] to-[#1E3E62] text-white text-xs font-semibold rounded-xl hover:to-[#4338CA] transition-all"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Dashboard */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Medical Report"
        message="Are you sure you want to delete this medical report? This action cannot be undone."
        itemTitle={deleteTarget ? `${deleteTarget.title}` : null}
        confirmText="Delete Report"
        cancelText="Cancel"
        isDeleting={isDeleting}
        isDangerAll={false}
      />
    </div>
  );
}

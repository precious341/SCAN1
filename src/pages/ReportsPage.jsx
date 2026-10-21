import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  GitCompare, 
  UploadCloud,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopHeader from '../components/layout/TopHeader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.jsx';
import api from '../services/api.js';

export default function ReportsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  // Delete State
  const [singleDeleteTarget, setSingleDeleteTarget] = useState(null); // report object to delete
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / Feedback message
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  // Auto-dismiss success notification after 5 seconds
  useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.reports.list();
      if (res.success && res.data?.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to load medical reports from database.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open individual delete confirmation dialog
  const openSingleDeleteModal = (report) => {
    setSingleDeleteTarget(report);
  };

  // Cancel individual delete
  const closeSingleDeleteModal = () => {
    if (isDeleting) return;
    setSingleDeleteTarget(null);
  };

  // Execute individual report delete
  const handleConfirmSingleDelete = async () => {
    if (!singleDeleteTarget || isDeleting) return;

    try {
      setIsDeleting(true);
      await api.reports.delete(singleDeleteTarget.id);

      // Immediately remove report from local state without requiring page reload
      setReports(prev => prev.filter(r => r.id !== singleDeleteTarget.id));
      setSelectedForCompare(prev => prev.filter(id => id !== singleDeleteTarget.id));

      setFeedback({
        type: 'success',
        message: `Medical report "${singleDeleteTarget.title}" was permanently deleted.`
      });
      setSingleDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete report:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete report. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Delete All modal
  const openDeleteAllModal = () => {
    if (reports.length === 0) return;
    setShowDeleteAllModal(true);
  };

  // Cancel Delete All
  const closeDeleteAllModal = () => {
    if (isDeleting) return;
    setShowDeleteAllModal(false);
  };

  // Execute Delete All Reports
  const handleConfirmDeleteAll = async () => {
    if (reports.length === 0 || isDeleting) return;

    try {
      setIsDeleting(true);
      const res = await api.reports.deleteAll();

      // Immediately clear all reports from state
      const countDeleted = reports.length;
      setReports([]);
      setSelectedForCompare([]);

      setFeedback({
        type: 'success',
        message: res.message || `All ${countDeleted} medical report(s) have been permanently deleted from your history.`
      });
      setShowDeleteAllModal(false);
    } catch (err) {
      console.error('Failed to delete all reports:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete all report history. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectForCompare = (id) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 3) {
          setFeedback({
            type: 'error',
            message: 'You can compare up to 3 reports at once.'
          });
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleStartComparison = () => {
    if (selectedForCompare.length < 2) {
      setFeedback({
        type: 'error',
        message: 'Please select at least 2 reports to compare.'
      });
      return;
    }
    navigate(`/compare?ids=${selectedForCompare.join(',')}`);
  };

  const filtered = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.original_filename.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#263746]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
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

          {/* Header Title & Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#123047] tracking-tight">Medical Report History</h1>
              <p className="text-xs sm:text-sm text-[#697B89] mt-0.5">
                Manage, review, compare, or delete your saved clinical laboratory records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Compare Button */}
              {selectedForCompare.length >= 2 && (
                <button
                  type="button"
                  onClick={handleStartComparison}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#123047] text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <GitCompare className="w-4 h-4 text-teal-400" />
                  <span>Compare ({selectedForCompare.length}) Reports</span>
                </button>
              )}

              {/* Delete All History Button */}
              <button
                type="button"
                onClick={openDeleteAllModal}
                disabled={reports.length === 0 || loading}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all border cursor-pointer ${
                  reports.length > 0
                    ? 'border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100 hover:border-rose-300 shadow-2xs active:scale-[0.99]'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title={reports.length === 0 ? 'No saved reports in history' : 'Permanently delete all reports'}
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete All History</span>
              </button>

              {/* Upload Report Button */}
              <Link
                to="/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#168C91] text-white text-xs font-semibold rounded-xl hover:bg-[#127074] transition-colors shadow-2xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Report</span>
              </Link>
            </div>
          </div>

          {/* Search, Status Tabs and Count Summary */}
          <div className="bg-white rounded-2xl border border-[#DCE5EC] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-[#697B89] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or filename..."
                className="w-full pl-9 pr-3 py-2 bg-[#F4F7FA] border border-[#DCE5EC] rounded-xl text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#168C91] transition-all"
              />
            </div>

            <div className="flex items-center gap-1 self-start sm:self-auto p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-[#123047] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  statusFilter === 'completed' ? 'bg-white text-[#123047] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({reports.filter(r => r.status === 'completed').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('processing')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  statusFilter === 'processing' ? 'bg-white text-[#123047] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Processing ({reports.filter(r => r.status === 'processing').length})
              </button>
            </div>
          </div>

          {/* Reports Content List / Table */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#DCE5EC] p-12 text-center text-xs text-[#697B89] space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mx-auto" />
              <p>Loading medical report history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DCE5EC] p-12 text-center shadow-2xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#168C91] mx-auto flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#123047]">
                {reports.length === 0 ? 'No medical reports in history' : 'No matching reports found'}
              </h3>
              <p className="text-xs text-[#697B89] max-w-sm mx-auto leading-relaxed">
                {reports.length === 0 
                  ? 'Your medical report history is empty. Upload your first laboratory report to get started with structured biomarker analysis.'
                  : 'Try adjusting your search keywords or active status filter.'}
              </p>
              {reports.length === 0 && (
                <div className="pt-2">
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#168C91] hover:bg-[#127074] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload First Report</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#DCE5EC] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#DCE5EC] text-xs font-semibold text-[#697B89]">
                      <th className="py-3.5 px-4 w-10 text-center">Compare</th>
                      <th className="py-3.5 px-4">Report Details</th>
                      <th className="py-3.5 px-4">Examination Date</th>
                      <th className="py-3.5 px-4">Parameters</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5EC]">
                    {filtered.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedForCompare.includes(report.id)}
                            onChange={() => toggleSelectForCompare(report.id)}
                            className="rounded border-[#DCE5EC] text-[#168C91] focus:ring-[#168C91] cursor-pointer"
                            title="Select for biomarker comparison"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <Link 
                            to={`/reports/${report.id}`}
                            className="font-bold text-[#123047] hover:text-[#168C91] transition-colors flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-[#168C91] shrink-0" />
                            <span>{report.title}</span>
                          </Link>
                          <span className="text-[11px] text-[#697B89] block mt-0.5">
                            {report.original_filename} · {(report.file_size / 1024).toFixed(0)} KB
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-[#263746] tabular-nums whitespace-nowrap">
                          {report.report_date || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#697B89] tabular-nums whitespace-nowrap">
                          {report.result_count ? `${report.result_count} tests extracted` : 'Extraction complete'}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Report */}
                            <Link
                              to={`/reports/${report.id}`}
                              className="p-2 text-slate-600 hover:text-[#168C91] hover:bg-teal-50 rounded-xl transition-all"
                              title="View report details"
                              aria-label={`View ${report.title}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Download PDF */}
                            <a
                              href={api.reports.downloadUrl(report.id)}
                              className="p-2 text-slate-600 hover:text-[#168C91] hover:bg-teal-50 rounded-xl transition-all"
                              title="Download original document"
                              download
                              aria-label={`Download ${report.original_filename}`}
                            >
                              <Download className="w-4 h-4" />
                            </a>

                            {/* Individual Delete Button with Trash Icon */}
                            <button
                              type="button"
                              onClick={() => openSingleDeleteModal(report)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer group"
                              title="Delete this medical report"
                              aria-label={`Delete report ${report.title}`}
                            >
                              <Trash2 className="w-4 h-4 group-hover:scale-105 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Individual Report Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={!!singleDeleteTarget}
        onClose={closeSingleDeleteModal}
        onConfirm={handleConfirmSingleDelete}
        title="Delete Medical Report"
        message="Are you sure you want to delete this medical report? This action cannot be undone."
        itemTitle={singleDeleteTarget ? `${singleDeleteTarget.title} (${singleDeleteTarget.report_date || 'No Date'})` : null}
        confirmText="Delete Report"
        cancelText="Cancel"
        isDeleting={isDeleting}
        isDangerAll={false}
      />

      {/* Delete All Report History Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={showDeleteAllModal}
        onClose={closeDeleteAllModal}
        onConfirm={handleConfirmDeleteAll}
        title="Delete All Medical Report History"
        message="Are you sure you want to permanently delete ALL your medical report history? This action cannot be undone."
        itemTitle={`All ${reports.length} report(s) will be permanently erased from your account and server storage.`}
        confirmText="Delete All History"
        cancelText="Cancel"
        isDeleting={isDeleting}
        isDangerAll={true}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink,
  ShieldAlert,
  Copy,
  Printer,
  Trash2
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopHeader from '../components/layout/TopHeader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import FormattedMessage from '../components/assistant/FormattedMessage.jsx';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.jsx';
import api from '../services/api.js';

export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'explanation'
  const [copiedQuestion, setCopiedQuestion] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.reports.get(id);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await api.reports.delete(id);
      navigate('/reports');
    } catch (err) {
      alert(err.message || 'Failed to delete medical report.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(index);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#263746] flex">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="lg:pl-64 flex-1 flex flex-col">
          <TopHeader onMenuClick={() => setMobileOpen(true)} />
          <div className="p-8 text-center text-sm text-[#697B89] animate-pulse">
            Loading laboratory details and clinical explanations...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#263746] flex">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="lg:pl-64 flex-1 flex flex-col">
          <TopHeader onMenuClick={() => setMobileOpen(true)} />
          <div className="p-8 max-w-lg mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-[#123047]">Report Unavailable</h2>
            <p className="text-xs text-[#697B89]">{error || 'Could not find the requested medical record.'}</p>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#168C91] text-white text-xs font-semibold rounded-lg hover:bg-[#127074] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reports</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { report, results = [], analysis } = data;

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#263746]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Breadcrumb Back Button */}
          <div>
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#697B89] hover:text-[#168C91] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Reports</span>
            </Link>
          </div>

          {/* Report Summary Card Header */}
          <div className="bg-white rounded-2xl border border-[#DCE5EC] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#168C91] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#123047] tracking-tight">{report.title}</h1>
                  <StatusBadge status={report.status} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#697B89]">
                  <span>Examination Date: <strong className="text-[#263746] font-mono">{report.report_date || 'N/A'}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Original File: <strong>{report.original_filename}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>{results.length} Parameters Identified</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={api.reports.downloadUrl(report.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#123047] bg-[#F4F7FA] border border-[#DCE5EC] rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
                download
              >
                <Download className="w-4 h-4 text-[#168C91]" />
                <span>Download PDF</span>
              </a>

              <Link
                to={`/assistant?reportId=${report.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#168C91] hover:bg-[#127074] rounded-xl transition-colors shadow-2xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask Assistant</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                title="Delete this medical report"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Report</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation: Results vs AI Explanation */}
          <div className="flex items-center gap-2 border-b border-[#DCE5EC] pb-px">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'results'
                  ? 'border-[#168C91] text-[#168C91]'
                  : 'border-transparent text-[#697B89] hover:text-[#123047]'
              }`}
            >
              Laboratory Results ({results.length})
            </button>
            <button
              onClick={() => setActiveTab('explanation')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'explanation'
                  ? 'border-[#168C91] text-[#168C91]'
                  : 'border-transparent text-[#697B89] hover:text-[#123047]'
              }`}
            >
              Clinical Interpretation & Questions
            </button>
          </div>

          {/* Tab Content: Results Table */}
          {activeTab === 'results' && (
            <div className="bg-white rounded-2xl border border-[#DCE5EC] overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-[#DCE5EC] bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#123047]">Extracted Laboratory Analytes</h3>
                  <p className="text-xs text-[#697B89]">Verified test values, units, and laboratory reference boundaries.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#DCE5EC] text-xs font-semibold text-[#697B89]">
                      <th className="py-3 px-4">Test Name</th>
                      <th className="py-3 px-4">Result Value</th>
                      <th className="py-3 px-4">Unit</th>
                      <th className="py-3 px-4">Reference Range</th>
                      <th className="py-3 px-4">Status Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5EC]">
                    {results.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#123047]">
                          {res.test_name}
                          {res.category && (
                            <span className="block text-[11px] font-normal text-[#697B89]">
                              {res.category}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#123047] tabular-nums">
                          {res.result_value}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#697B89]">
                          {res.unit || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-[#263746] tabular-nums">
                          {res.reference_range || 'Standard'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={res.flag} type="flag" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content: AI Explanation & Questions */}
          {activeTab === 'explanation' && (
            <div className="space-y-6">
              {analysis ? (
                <>
                  {/* Summary Card */}
                  <div className="bg-white rounded-2xl border border-[#DCE5EC] p-6 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2.5 text-[#123047]">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#168C91] flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-semibold">Plain-Language Summary</h3>
                    </div>
                    <div className="pt-1">
                      <FormattedMessage text={analysis.plain_language_summary} />
                    </div>
                  </div>

                  {/* Key Findings Card */}
                  {analysis.key_findings && analysis.key_findings.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#DCE5EC] p-6 space-y-3 shadow-xs">
                      <h3 className="text-sm font-semibold text-[#123047]">Key Observations</h3>
                      <ul className="space-y-2 text-xs sm:text-sm text-[#263746]">
                        {analysis.key_findings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#168C91] mt-2 shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Questions to ask doctor */}
                  {analysis.questions_for_clinician && analysis.questions_for_clinician.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#DCE5EC] p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[#123047]">Suggested Questions for Your Doctor</h3>
                          <p className="text-xs text-[#697B89]">Informed questions to take to your upcoming consultation.</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {analysis.questions_for_clinician.map((q, idx) => (
                          <div 
                            key={idx} 
                            className="p-3.5 bg-[#F8FAFC] border border-[#DCE5EC] rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm text-[#123047]"
                          >
                            <span className="font-medium">"{q}"</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(q, idx)}
                              className="text-xs font-semibold text-[#168C91] hover:text-[#127074] inline-flex items-center gap-1 shrink-0 px-2 py-1 bg-white border border-teal-200 rounded-md"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedQuestion === idx ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Authoritative Medical Citations */}
                  {analysis.citations && analysis.citations.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#DCE5EC] p-5 shadow-xs">
                      <h4 className="text-xs font-semibold text-[#697B89] uppercase tracking-wider mb-3">
                        Authoritative Reference Citations
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {analysis.citations.map((cite, idx) => (
                          <a
                            key={idx}
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-[#DCE5EC] text-xs font-medium text-[#123047] hover:text-[#168C91] hover:bg-teal-50/50 transition-colors"
                          >
                            <span>{cite.title}</span>
                            <ExternalLink className="w-3 h-3 text-[#697B89]" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-[#DCE5EC] p-8 text-center text-xs text-[#697B89]">
                  Summary interpretation is processing or unavailable.
                </div>
              )}
            </div>
          )}

          {/* Mandatory Clinical Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Important Clinical Disclaimer</p>
              <p className="leading-relaxed">
                MedScan provides educational explanations and does not diagnose disease or replace physician guidance. Laboratory numbers must always be evaluated in conjunction with medical history, medications, and physical examinations.
              </p>
            </div>
          </div>

        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Medical Report"
        message="Are you sure you want to delete this medical report? This action cannot be undone."
        itemTitle={report ? `${report.title} (${report.report_date || 'No Date'})` : null}
        confirmText="Delete Report"
        cancelText="Cancel"
        isDeleting={isDeleting}
        isDangerAll={false}
      />
    </div>
  );
}

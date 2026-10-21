import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, ArrowUpRight, FileText, Sparkles, MessageSquare } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';

export default function RecentReportsTable({ reports = [], onDelete, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4 shadow-xs">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-10 bg-slate-100 rounded"></div>
        <div className="h-10 bg-slate-100 rounded"></div>
        <div className="h-10 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#0B192C]">No medical reports uploaded yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Upload a lab PDF, scan, or panel to receive structured biomarker ranges and plain-English explanations.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#0B192C] text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <span>Upload First Report</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-purple-300" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
              <th className="py-3 px-4">Report Name</th>
              <th className="py-3 px-4">Date Recorded</th>
              <th className="py-3 px-4">Analysis Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50/70 transition-colors group">
                <td className="py-3.5 px-4 font-medium text-[#0B192C]">
                  <Link 
                    to={`/reports/${report.id}`} 
                    className="hover:text-indigo-600 transition-colors flex items-center gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="truncate max-w-xs font-semibold text-xs sm:text-sm">{report.title}</span>
                  </Link>
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                  {report.report_date || (report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A')}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={report.status} />
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/assistant?reportId=${report.id}`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Ask AI Assistant About This Report"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/reports/${report.id}`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View Report Analysis"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(report.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer group"
                        title="Delete this medical report"
                        aria-label={`Delete report ${report.title}`}
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-105 transition-transform" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

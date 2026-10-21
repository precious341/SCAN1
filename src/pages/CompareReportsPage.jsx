import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  GitCompare, 
  ArrowLeft, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  Info
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopHeader from '../components/layout/TopHeader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import api from '../services/api.js';

export default function CompareReportsPage() {
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allReports, setAllReports] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoading(true);
      const res = await api.reports.list();
      if (res.success && res.data?.reports) {
        const reps = res.data.reports;
        setAllReports(reps);

        // Pre-select from query params if available
        const paramIds = searchParams.get('ids');
        if (paramIds) {
          const ids = paramIds.split(',').filter(Boolean);
          setSelectedIds(ids);
          if (ids.length >= 2) {
            await fetchComparison(ids);
          }
        } else if (reps.length >= 2) {
          // Default to the first two reports for instant comparison
          const defaultIds = [reps[0].id, reps[1].id];
          setSelectedIds(defaultIds);
          await fetchComparison(defaultIds);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize comparison.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async (ids) => {
    try {
      setError('');
      const res = await api.reports.compare(ids);
      if (res.success && res.data) {
        setComparisonData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch comparison.');
      setComparisonData(null);
    }
  };

  const toggleReport = async (id) => {
    let nextIds;
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert('At least two reports are required for comparison.');
        return;
      }
      nextIds = selectedIds.filter(i => i !== id);
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare up to 4 reports simultaneously.');
        return;
      }
      nextIds = [...selectedIds, id];
    }
    setSelectedIds(nextIds);
    await fetchComparison(nextIds);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#263746]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#123047] tracking-tight">Compare Medical Reports</h1>
              <p className="text-xs sm:text-sm text-[#697B89]">
                Analyze laboratory marker trends and chronological changes across your previous visits.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Reports to Compare selector */}
          <div className="bg-white rounded-2xl border border-[#DCE5EC] p-5 space-y-3 shadow-xs">
            <h2 className="text-xs font-semibold text-[#123047] uppercase tracking-wider">
              Select Reports to Include in Trend Comparison (2-4 reports)
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {allReports.map((r) => {
                const isSelected = selectedIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleReport(r.id)}
                    className={`
                      px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all
                      ${isSelected 
                        ? 'bg-[#123047] text-white border-[#123047] shadow-xs' 
                        : 'bg-white text-[#263746] border-[#DCE5EC] hover:bg-slate-50'}
                    `}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-400' : 'text-slate-300'}`} />
                    <span className="font-semibold">{r.title}</span>
                    <span className="text-[11px] opacity-80 tabular-nums">({r.report_date || 'N/A'})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          {comparisonData && comparisonData.reports && comparisonData.reports.length >= 2 ? (
            <div className="bg-white rounded-2xl border border-[#DCE5EC] overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-[#DCE5EC] bg-[#F8FAFC]">
                <h3 className="text-sm font-semibold text-[#123047]">Laboratory Trend Comparison Matrix</h3>
                <p className="text-xs text-[#697B89]">Matched laboratory test parameters across {comparisonData.reports.length} examinations.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#DCE5EC] text-xs font-semibold text-[#697B89]">
                      <th className="py-3 px-4 w-1/3">Test Name & Reference Range</th>
                      {comparisonData.reports.map((rep) => (
                        <th key={rep.id} className="py-3 px-4">
                          <div className="font-semibold text-[#123047]">{rep.title}</div>
                          <div className="text-[11px] text-[#697B89] font-normal tabular-nums">{rep.report_date || 'N/A'}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5EC]">
                    {comparisonData.comparison.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#123047]">
                          <div>{item.test_name}</div>
                          <div className="text-[11px] text-[#697B89] font-normal">
                            Unit: {item.unit || '—'} · Range: {item.reference_range || 'Standard'}
                          </div>
                        </td>

                        {comparisonData.reports.map((rep) => {
                          const valObj = item.valuesByReport[rep.id];
                          if (!valObj) {
                            return (
                              <td key={rep.id} className="py-3.5 px-4 text-xs text-slate-400">
                                Not recorded
                              </td>
                            );
                          }
                          return (
                            <td key={rep.id} className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-[#123047] tabular-nums">
                                  {valObj.value}
                                </span>
                                <StatusBadge status={valObj.flag} type="flag" />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#DCE5EC] p-12 text-center">
              <GitCompare className="w-8 h-8 text-[#168C91] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#123047]">Select At Least Two Reports</h3>
              <p className="text-xs text-[#697B89] mt-1 max-w-sm mx-auto">
                Choose two or more reports from the selector above to compare biomarker changes over time.
              </p>
            </div>
          )}

          {/* Clinical Context Notice */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-3 text-xs text-[#123047]">
            <Info className="w-5 h-5 text-[#168C91] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Clinical Comparison Guidance</p>
              <p className="leading-relaxed text-[#263746]">
                Laboratories may use different calibration instruments and reagents between visits. Subtle numerical changes between dates do not alone indicate illness progression or resolution. Discuss all comparative trends with your healthcare practitioner.
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

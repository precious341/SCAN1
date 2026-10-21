import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  FileCheck
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopHeader from '../components/layout/TopHeader.jsx';
import api from '../services/api.js';

export default function UploadReportPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      selectFile(e.target.files[0]);
    }
  };

  const selectFile = (selected) => {
    setError('');
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
    if (!validTypes.includes(selected.type) && !selected.name.endsWith('.pdf')) {
      setError('Please select a valid PDF or lab image document.');
      return;
    }
    if (selected.size > 15 * 1024 * 1024) {
      setError('Selected file exceeds the 15MB size limit.');
      return;
    }
    setFile(selected);
    if (!title) {
      const baseName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(baseName);
    }
  };

  // Helper to create synthetic demo files for rapid testing
  const createSampleFile = (type) => {
    let content = '';
    let name = '';
    let sampleTitle = '';

    if (type === 'lipid') {
      sampleTitle = 'Lipid Cholesterol Panel';
      name = 'Lipid_Panel_Report.txt';
      content = `METROPOLITAN HOSPITAL CLINICAL LABORATORY
PATIENT: Demo Patient
DATE: ${reportDate}
PANEL: Lipid & Cardiovascular Risk Panel
Total Cholesterol: 215 mg/dL (Reference: < 200) [High]
HDL Cholesterol: 42 mg/dL (Reference: > 40)
LDL Cholesterol: 142 mg/dL (Reference: < 100) [High]
Triglycerides: 165 mg/dL (Reference: < 150) [High]
Cholesterol/HDL Ratio: 5.1 (Reference: < 5.0) [High]`;
    } else {
      sampleTitle = 'Comprehensive Metabolic Panel (CMP)';
      name = 'Metabolic_Panel_Report.txt';
      content = `METROPOLITAN HOSPITAL CLINICAL LABORATORY
PATIENT: Demo Patient
DATE: ${reportDate}
PANEL: Comprehensive Metabolic Panel (CMP)
Glucose (Fasting): 94 mg/dL (Reference: 70 - 99)
Blood Urea Nitrogen (BUN): 16 mg/dL (Reference: 7 - 20)
Serum Creatinine: 0.95 mg/dL (Reference: 0.6 - 1.2)
Sodium: 139 mmol/L (Reference: 136 - 145)
Potassium: 4.4 mmol/L (Reference: 3.5 - 5.1)
Chloride: 102 mmol/L (Reference: 96 - 106)
Total Calcium: 9.6 mg/dL (Reference: 8.5 - 10.5)
Total Protein: 7.1 g/dL (Reference: 6.0 - 8.3)
Serum Albumin: 4.5 g/dL (Reference: 3.5 - 5.0)
Total Bilirubin: 0.7 mg/dL (Reference: 0.1 - 1.2)`;
    }

    const sampleBlob = new Blob([content], { type: 'text/plain' });
    const sampleObj = new File([sampleBlob], name, { type: 'text/plain' });
    setFile(sampleObj);
    setTitle(sampleTitle);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or upload a document first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('report_date', reportDate);

      const res = await api.reports.upload(formData);
      if (res.success && res.data?.reportId) {
        navigate(`/reports/${res.data.reportId}`);
      } else {
        navigate('/reports');
      }
    } catch (err) {
      setError(err.message || 'Error processing report upload.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#263746]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#123047] tracking-tight">Upload Medical Report</h1>
            <p className="text-xs sm:text-sm text-[#697B89]">
              Securely upload your laboratory test report to extract structured values and generate clinical explanations.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Pre-load cards */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#123047] mb-2">
              <Sparkles className="w-4 h-4 text-[#168C91]" />
              <span>Testing without a personal PDF right now?</span>
            </div>
            <p className="text-[11px] text-[#697B89] mb-3">
              Generate a realistic synthetic clinical laboratory document with one click:
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => createSampleFile('cmp')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#123047] border border-teal-300 rounded-lg text-xs font-semibold hover:bg-teal-100/60 transition-colors shadow-2xs"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#168C91]" />
                <span>Try Sample Metabolic Panel (CMP)</span>
              </button>
              <button
                type="button"
                onClick={() => createSampleFile('lipid')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#123047] border border-teal-300 rounded-lg text-xs font-semibold hover:bg-teal-100/60 transition-colors shadow-2xs"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#168C91]" />
                <span>Try Sample Lipid Cholesterol Panel</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#DCE5EC] p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all
                ${dragActive 
                  ? 'border-[#168C91] bg-teal-50/50' 
                  : file 
                    ? 'border-emerald-300 bg-emerald-50/30' 
                    : 'border-[#DCE5EC] hover:border-[#168C91] hover:bg-slate-50/60'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,image/png,image/jpeg,text/plain"
                onChange={handleFileInput}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-[#123047]">{file.name}</p>
                  <p className="text-xs text-[#697B89]">
                    {(file.size / 1024).toFixed(1)} KB · Ready to analyze
                  </p>
                  <p className="text-[11px] text-[#168C91] font-medium pt-1">
                    Click or drag another file to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-[#168C91] mx-auto flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#123047]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-[#697B89] mt-1">
                      Supported formats: PDF, PNG, JPEG (up to 15MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Document Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#263746]">Report Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC)"
                  className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-[#DCE5EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#168C91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263746]">Date of Examination</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2 text-sm bg-white border border-[#DCE5EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#168C91]"
                />
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="flex items-center gap-2.5 text-xs text-[#697B89] pt-2 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-[#168C91] shrink-0" />
              <span>Documents are stored in private directories and never indexed publicly.</span>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#168C91] hover:bg-[#127074] disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? (
                <span>Extracting laboratory parameters & analyzing...</span>
              ) : (
                <>
                  <span>Process & Analyze Document</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ShieldCheck, 
  FileSearch, 
  BookOpen, 
  ArrowRight, 
  UploadCloud, 
  CheckCircle2, 
  Lock,
  Stethoscope,
  Bot,
  User,
  MessageSquare,
  FileText
} from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

import heroClinicalBg from '../assets/images/hero_clinical_bg_1792398713752.jpg';
import clinicianReviewImg from '../assets/images/clinician_lab_review_1792399316770.jpg';
import extractionImg from '../assets/images/feature_report_extraction_1792341311309.jpg';
import consultationImg from '../assets/images/feature_clinical_consultation_1792341312282.jpg';
import vaultImg from '../assets/images/feature_secure_vault_1792341311417.jpg';

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const sampleConversations = [
    {
      q: 'What does a hemoglobin level of 11.8 g/dL indicate?',
      tag: 'Hematology / CBC',
      a: `A hemoglobin reading of **11.8 g/dL** is slightly below the standard adult reference interval (typically 12.0 – 16.0 g/dL for adult females or 13.8 – 17.2 g/dL for adult males).

### What This Means in Plain English
Hemoglobin is the iron-rich protein in red blood cells that transports oxygen throughout your tissues. A mild reduction can indicate mild anemia. Common factors include:
* **Nutritional levels:** Low dietary iron, ferritin, vitamin B12, or folate.
* **Transient fluid shifts:** Mild over-hydration can slightly dilute blood concentration.
* **Recent blood loss:** Minor internal or menstrual blood loss.

### Questions to Ask Your Doctor
1. Should we test my serum ferritin and iron saturation levels?
2. Do you recommend a dietary adjustment or targeted supplement?
3. Should we re-check this in 6–8 weeks to observe trends?`,
      sources: ['MedlinePlus Medical Tests', 'Mayo Clinic Clinical Pathology']
    },
    {
      q: 'How should I interpret a WBC count of 11.8 10^9/L?',
      tag: 'Immune Biomarkers',
      a: `Your White Blood Cell (WBC) count of **11.8 × 10^9/L** is mildly above the typical standard reference interval (4.0 – 11.0 × 10^9/L).

### What This Means in Plain English
White blood cells are your body's immune defense responders. A mild elevation (leukocytosis) is common and frequently reflects temporary, non-critical factors:
* **Recent infection or inflammation:** Recovering from a cold, dental work, or allergy flare-up.
* **Physical or emotional stress:** Heavy exertion or systemic stress triggers temporary release of stored white cells.
* **Medications:** Certain anti-inflammatory agents or inhalers.

### Questions to Ask Your Doctor
1. Does the WBC differential (neutrophils vs lymphocytes) show a specific pattern?
2. Does this align with any recent symptoms or minor ailments?`,
      sources: ['National Institutes of Health (NIH)', 'Lab Tests Online (AACC)']
    },
    {
      q: 'What does an eGFR of 78 mL/min/1.73m² mean for kidney health?',
      tag: 'Renal Function',
      a: `An estimated Glomerular Filtration Rate (**eGFR**) of **78 mL/min/1.73m²** indicates mild variation from the optimal benchmark (>90), but often represents stable, healthy kidney function.

### What This Means in Plain English
eGFR estimates how efficiently your kidneys filter metabolic byproducts from your bloodstream.
* Values between 60 and 89 in individuals without protein in urine or known kidney conditions are frequently considered age-appropriate and benign.
* Mild dehydration before blood draws or high muscle mass can naturally shift the calculation.

### Questions to Ask Your Doctor
1. What was my serum creatinine level alongside this eGFR?
2. Was there any protein or albumin detected in my urinalysis?`,
      sources: ['National Kidney Foundation (NKF)', 'MedlinePlus Kidney Tests']
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B192C] flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Dark Nav seamlessly matching the full-bleed Hero */}
      <Navbar dark={true} />

      {/* Hero Section with Large Medical Laboratory Visual & Seamless Navy Blending */}
      <section className="relative min-h-[90vh] lg:min-h-[94vh] flex items-center justify-center overflow-hidden bg-[#07111E]">
        {/* Full-bleed subtle laboratory background atmosphere */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <img
            src={heroClinicalBg}
            alt="Clinical medical laboratory and diagnostic research center"
            className="w-full h-full object-cover object-center select-none opacity-25 scale-105"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          {/* Subtle natural dark navy overlays for readability and depth */}
          <div className="absolute inset-0 bg-[#07111E]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07111E] via-[#07111E]/95 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07111E] via-transparent to-[#07111E]/80" />
        </div>

        {/* Hero Content Container - Two Column Balanced Layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headlines, Supporting Text, and Action Buttons */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6 sm:space-y-7">
              
              {/* Clinical Scope Tag */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-teal-500/30 text-xs font-semibold text-slate-200 shadow-md">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <Activity className="w-3.5 h-3.5 text-teal-300" />
                <span className="tracking-wide">Clinical Laboratory Analytics & Consultation Prep</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] text-balance">
                Understand Your Medical Reports. <br />
                <span className="bg-gradient-to-r from-teal-200 via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
                  With Absolute Clarity.
                </span>
              </h1>

              {/* Short Supporting Description */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                MedScan translates complex laboratory test results, biomarkers, and reference intervals into clear, structured insights and informed questions for your next doctor appointment.
              </p>

              {/* Three Primary CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to={user ? "/dashboard" : "/signup"}
                  className="inline-flex items-center gap-2.5 px-6.5 py-3.5 bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-950/50 hover:shadow-teal-500/25 hover:-translate-y-0.5 transition-all active:scale-[0.99] text-sm sm:text-base cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 text-teal-200" />
                </Link>
                
                <Link
                  to="/assistant"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-md transition-all hover:-translate-y-0.5 active:scale-[0.99] text-sm sm:text-base cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-300" />
                  <span>Explore Platform</span>
                </Link>

                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-4.5 py-3 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer rounded-xl hover:bg-white/5"
                >
                  <UploadCloud className="w-4 h-4 text-teal-400" />
                  <span>Upload Lab Report</span>
                </Link>
              </div>

              {/* Trust & Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-white/10 max-w-2xl">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 backdrop-blur-md border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Private Storage</p>
                    <p className="text-[11px] text-slate-400">Isolated server vault</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 backdrop-blur-md border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <FileSearch className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Precise Extraction</p>
                    <p className="text-[11px] text-slate-400">Preserves original numbers</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 backdrop-blur-md border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Clinical References</p>
                    <p className="text-[11px] text-slate-400">MedlinePlus & NIH backed</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Seamlessly Blended Medical Image & Clean Report Preview Card */}
            <div className="lg:col-span-6 xl:col-span-5 relative mt-8 lg:mt-0">
              
              {/* Outer Glassmorphic Framing */}
              <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#0B192C] shadow-2xl shadow-black/60">
                
                {/* Large Medical Diagnostic Image naturally blended into Dark Navy */}
                <div className="relative h-72 sm:h-84 md:h-96 w-full overflow-hidden">
                  <img
                    src={clinicianReviewImg}
                    alt="Clinician reviewing medical diagnostic laboratory report results"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle directional gradients for natural edge dissolution */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B192C]/50 via-transparent to-transparent" />
                </div>

                {/* Clean, Compact Medical Report Preview Card */}
                <div className="p-5 sm:p-6 bg-[#0B192C] border-t border-white/10 space-y-4">
                  
                  {/* Header: clearly states sample/illustrative nature */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-bold text-white tracking-wide">Standardized Panel Preview</span>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-md">
                      Illustrative Sample
                    </span>
                  </div>

                  {/* Biomarker Rows: clean, un-cramped, with high readability */}
                  <div className="space-y-2.5">
                    {/* Row 1: Fasting Glucose */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white">Fasting Glucose</div>
                        <div className="text-[11px] text-slate-400">Ref: 70 – 99 mg/dL</div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-100">
                          94 <span className="text-[10px] text-slate-400 font-normal">mg/dL</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          Normal
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Hemoglobin */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white">Hemoglobin (Hb)</div>
                        <div className="text-[11px] text-slate-400">Ref: 13.5 – 17.5 g/dL</div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-100">
                          14.2 <span className="text-[10px] text-slate-400 font-normal">g/dL</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/25">
                          In Range
                        </span>
                      </div>
                    </div>

                    {/* Row 3: eGFR */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white">eGFR (Kidney Filtration)</div>
                        <div className="text-[11px] text-slate-400">Ref: ≥ 60 mL/min/1.73m²</div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-100">
                          &gt; 90 <span className="text-[10px] text-slate-400 font-normal">mL/min</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                          Optimal
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer note: clear, non-overlapping info */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>Reference intervals preserved</span>
                    </span>
                    <Link to="/upload" className="text-teal-300 hover:text-white font-medium transition-colors">
                      Upload lab report →
                    </Link>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Bottom subtle transition fade */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#F8FAFC] to-transparent pointer-events-none" />
      </section>

      {/* Interactive Consultation Showcase */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Interactive Clinical Consultation Preview</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">
              Evidence-Grounded Patient Conversations
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              See how MedScan translates complex biomarkers into clear, patient-friendly guidance and prioritized questions for your doctor.
            </p>
          </div>

          {/* Interactive Chat Mockup Card */}
          <div className="max-w-4xl mx-auto bg-[#F8FAFC] border border-slate-200 rounded-2xl shadow-md overflow-hidden">
            {/* Header Tabs */}
            <div className="bg-[#0B192C] text-white p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <MessageSquare className="w-4 h-4 text-teal-100" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">MedScan Clinical Consultation Preview</h4>
                  <p className="text-[10px] text-slate-400">Evidence-Based Clinical Guidance</p>
                </div>
              </div>

              {/* Sample Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {sampleConversations.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === idx
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {item.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* User question */}
              <div className="flex items-start gap-3 max-w-2xl ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-xl bg-[#0B192C] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tr-xs bg-[#0B192C] text-white text-xs sm:text-sm font-medium shadow-xs">
                  {sampleConversations[activeTab].q}
                </div>
              </div>

              {/* Assistant Answer */}
              <div className="flex items-start gap-3 max-w-3xl mr-auto">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E3E62] to-[#0F766E] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-5 rounded-2xl rounded-tl-xs bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-3 leading-relaxed">
                  <div className="whitespace-pre-line">
                    {sampleConversations[activeTab].a}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Authoritative References:</span>
                    {sampleConversations[activeTab].sources.map((s, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-200/80">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Banner inside preview */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 via-indigo-50 to-purple-50 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-900 font-semibold">
                  <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Ready to explore questions about your personal laboratory metrics?</span>
                </div>
                <Link
                  to="/assistant"
                  className="px-4 py-2 bg-[#0B192C] text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all shadow-sm shrink-0 flex items-center gap-1.5"
                >
                  <span>Open Clinical Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Feature Showcase with Assets */}
      <section id="features" className="py-20 bg-slate-50/50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">
              Clinical Rigor Meets Patient Empowerment
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Every feature is engineered to provide peace of mind and informed clarity before your next doctor visit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col shadow-xs">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={extractionImg}
                  alt="High-precision laboratory analyzer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0B192C]/80 backdrop-blur-md text-white text-[11px] font-semibold">
                  Entity Extraction
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0B192C]">Structured Lab Analyte Parsing</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Extracts values, reference intervals, and measurement units without modifying original lab numbers.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-teal-700 font-semibold flex items-center gap-1">
                  <span>CBC, CMP, Lipids & Renal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col shadow-xs">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={consultationImg}
                  alt="Doctor and patient consultation"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0B192C]/80 backdrop-blur-md text-white text-[11px] font-semibold">
                  Clinician Preparation
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0B192C]">Personalized Doctor Questions</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Generates 3–5 tailored questions for your physician so you never leave an appointment feeling uninformed.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-teal-700 font-semibold flex items-center gap-1">
                  <span>Actionable Appointment Topics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col shadow-xs">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={vaultImg}
                  alt="Encrypted medical vault datacenter"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0B192C]/80 backdrop-blur-md text-white text-[11px] font-semibold">
                  Private Vault
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0B192C]">Isolated Document Security</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Documents are stored in authenticated server directories outside the public web root. We never share your data.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-teal-700 font-semibold flex items-center gap-1">
                  <span>Session Protected</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">How MedScan Works</h2>
          <p className="text-sm sm:text-base text-slate-600">
            From confusing PDF to clear understanding in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0B192C] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              01
            </div>
            <h3 className="text-lg font-bold text-[#0B192C]">Upload Lab Report</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upload a digital PDF, scan, or photo of your lab results. Our system validates file integrity and formats securely.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#1E3E62] to-[#0F766E] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              02
            </div>
            <h3 className="text-lg font-bold text-[#0B192C]">Explore Explanations</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Review structured tabular numbers, reference bounds, and plain-English summaries tailored to patient understanding.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0B192C] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              03
            </div>
            <h3 className="text-lg font-bold text-[#0B192C]">Engage Your Doctor</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Use generated questions and historical comparison charts to have confident, productive healthcare conversations.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Disclaimer Notice Strip */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="privacy" className="p-6 rounded-2xl bg-gradient-to-br from-teal-50/90 to-indigo-50/60 border border-teal-200/80 flex items-start gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#0B192C]">Patient Privacy Guarantee</h4>
              <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                All uploaded documents reside exclusively in isolated private disk directories. Personal health details are never shared or commercialized.
              </p>
            </div>
          </div>

          <div id="disclaimer" className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/50 border border-amber-200/80 flex items-start gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-amber-950">Important Clinical Disclaimer</h4>
              <p className="text-xs text-amber-900 mt-1.5 leading-relaxed">
                MedScan provides educational explanations and does not constitute a clinical diagnosis or treatment prescription. Always consult a licensed healthcare professional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-br from-[#07111E] via-[#0B192C] to-[#1E3E62] text-white mt-auto relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Take Control of Your Health Information Today.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Gain immediate clarity on your latest laboratory markers with patient-first clinical explanations.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all shadow-md"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4.5 h-4.5 text-teal-200" />
            </Link>
            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all backdrop-blur-md"
            >
              <span>Explore Platform</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#07111E] text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-white font-bold">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xs shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <span>MedScan</span>
            <span className="text-slate-500 text-xs ml-2 font-normal">© 2026 MedScan. Professional Medical Report Intelligence.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/assistant" className="hover:text-white transition-colors">Clinical Assistant</Link>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#disclaimer" className="hover:text-white transition-colors">Disclaimer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

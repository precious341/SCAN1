import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-center items-center p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#168C91] flex items-center justify-center mb-4">
        <Activity className="w-6 h-6" />
      </div>
      <h1 className="text-4xl font-bold text-[#123047] tracking-tight">404</h1>
      <h2 className="text-base font-semibold text-[#123047] mt-2">Clinical Resource Not Found</h2>
      <p className="text-xs text-[#697B89] mt-1 max-w-sm">
        The requested medical record, page, or consultation link could not be located.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#168C91] text-white text-xs font-semibold rounded-lg hover:bg-[#127074] transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

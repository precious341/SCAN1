import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function QuickActionCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  to, 
  badge,
  iconGradient = 'from-indigo-500 to-purple-600'
}) {
  return (
    <Link
      to={to}
      className="group relative block p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradient} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#0B192C] group-hover:text-indigo-600 transition-colors truncate">
              {title}
            </h3>
            {badge ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                {badge}
              </span>
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}

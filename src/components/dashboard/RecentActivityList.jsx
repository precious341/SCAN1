import React from 'react';
import { UploadCloud, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecentActivityList({ activities = [] }) {
  const defaultActivities = [
    {
      id: 'act_1',
      type: 'upload',
      title: 'Report processed & analyzed',
      target: 'Complete Blood Count (CBC)',
      timestamp: 'Oct 16, 2025 · 10:24 AM',
      icon: UploadCloud,
      color: 'text-indigo-600 bg-indigo-50',
      link: '/reports',
    },
    {
      id: 'act_2',
      type: 'analysis',
      title: 'Biomarker flags identified',
      target: 'Hemoglobin & Hematocrit (Mild Low)',
      timestamp: 'Oct 16, 2025 · 10:25 AM',
      icon: CheckCircle,
      color: 'text-amber-600 bg-amber-50',
      link: '/reports',
    },
    {
      id: 'act_3',
      type: 'question',
      title: 'AI Consultation performed',
      target: 'Questions prepared for doctor visit',
      timestamp: 'Oct 18, 2025 · 11:32 AM',
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-50',
      link: '/assistant',
    },
  ];

  const items = activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#0B192C]">Recent Activity</h3>
        <Link to="/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 leading-snug">
                  <span className="font-medium">{item.title}</span> —{' '}
                  <Link to={item.link} className="font-semibold text-indigo-700 hover:underline">
                    {item.target}
                  </Link>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                  {item.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Target, ArrowUpRight, PieChart, Users } from 'lucide-react';

export default function ReportsModule({ courses, leads, stats }) {
  // Course Revenue Analysis
  const coursePerformance = courses.map(c => {
    const revenue = c.activeStudents * c.fee;
    return {
      name: c.name,
      code: c.code,
      activeStudents: c.activeStudents,
      fee: c.fee,
      revenue,
      rating: c.rating
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Counselor Leaderboard
  const counselors = [
    { name: 'Admissions Desk 1', role: 'Senior Academic Counselor', leadsHandled: leads.length, converted: 0, convRate: '0%', revenue: '₹0', badge: 'Active' },
    { name: 'Admissions Desk 2', role: 'Admissions Counselor', leadsHandled: 0, converted: 0, convRate: '0%', revenue: '₹0', badge: 'Active' },
    { name: 'Front Desk Team', role: 'Direct Walk-in Registrations', leadsHandled: 0, converted: 0, convRate: '0%', revenue: '₹0', badge: 'Active' }
  ];

  // Lead Channel Performance
  const leadChannels = [
    { source: 'Website Organic', leads: 34, converted: 12, cost: '₹0 (SEO)', roi: 'Infinite' },
    { source: 'Google Search Ads', leads: 26, converted: 8, cost: '₹14,500', roi: '24.8x' },
    { source: 'Instagram Ads', leads: 22, converted: 5, cost: '₹9,800', roi: '18.2x' },
    { source: 'Student Referrals', leads: 14, converted: 9, cost: '₹4,500 (Rewards)', roi: '45.0x' },
    { source: 'Campus Walk-ins', leads: 12, converted: 7, cost: '₹0', roi: 'N/A' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Executive Analytics & Financial Intelligence
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Q4 FY 2026-27
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Program profitability, counselor admissions leaderboard, and marketing channel ROI.
          </p>
        </div>
      </div>

      {/* Grid 1: Course Revenue Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Program Profitability & Revenue Generated
            </h3>
            <p className="text-xs text-slate-400">Total lifetime billing based on enrolled students</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            ₹{coursePerformance.reduce((acc, c) => acc + c.revenue, 0).toLocaleString()} Total Value
          </span>
        </div>

        <div className="space-y-4">
          {coursePerformance.map((c, i) => {
            const maxRev = coursePerformance[0].revenue;
            const pct = Math.round((c.revenue / maxRev) * 100);
            return (
              <div key={c.code} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {i + 1}. {c.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium">{c.activeStudents} active students</span>
                    <strong className="text-slate-900 dark:text-white font-black text-sm">
                      ₹{c.revenue.toLocaleString()}
                    </strong>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid 2: Counselor Leaderboard + Lead Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Counselor Leaderboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Counselor Admissions Leaderboard
            </h3>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-3">
            {counselors.map((c, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{c.name}</h4>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.role}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">{c.revenue}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">{c.convRate} Conv Rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Channel ROI */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Lead Channel Acquisition & ROI
            </h3>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Channel</th>
                  <th className="pb-2">Leads</th>
                  <th className="pb-2">Converted</th>
                  <th className="pb-2 text-right">Ad Spend & ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {leadChannels.map((ch, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">{ch.source}</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-400">{ch.leads}</td>
                    <td className="py-2.5 font-semibold text-emerald-600">{ch.converted}</td>
                    <td className="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {ch.cost} ({ch.roi})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

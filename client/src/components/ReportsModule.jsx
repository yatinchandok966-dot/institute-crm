import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Target, ArrowUpRight, PieChart, Users } from 'lucide-react';

export default function ReportsModule({ courses = [], leads = [], stats = {} }) {
  // Course Revenue Analysis dynamically computed
  const coursePerformance = courses.map(c => {
    const revenue = (c.activeStudents || 0) * (c.fee || 0);
    return {
      name: c.name,
      code: c.code,
      activeStudents: c.activeStudents || 0,
      fee: c.fee || 0,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalCourseRevenue = coursePerformance.reduce((acc, c) => acc + c.revenue, 0);

  // Counselor Performance computed dynamically from recorded leads
  const counselorMap = {};
  leads.forEach(l => {
    const counselor = l.counselor || 'Admissions Desk';
    if (!counselorMap[counselor]) {
      counselorMap[counselor] = { name: counselor, leadsHandled: 0, converted: 0 };
    }
    counselorMap[counselor].leadsHandled += 1;
    if (l.status === 'Lead Confirmed (Admitted)' || l.status === 'Enrolled') {
      counselorMap[counselor].converted += 1;
    }
  });

  const counselors = Object.values(counselorMap);

  // Lead Channel Performance computed dynamically from recorded leads
  const channelSources = ['Website', 'Google Ad', 'Instagram', 'Campus Walk-in', 'QR Code / Reception', 'Referral'];
  const leadChannels = channelSources.map(source => {
    const matching = leads.filter(l => (l.source || '').toLowerCase().includes(source.toLowerCase()));
    const converted = matching.filter(l => l.status === 'Lead Confirmed (Admitted)' || l.status === 'Enrolled').length;
    return {
      source,
      leads: matching.length,
      converted,
      convRate: matching.length > 0 ? `${Math.round((converted / matching.length) * 100)}%` : '0%'
    };
  }).filter(c => c.leads > 0 || leads.length === 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Executive Analytics & Performance Intelligence
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Session
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Program profitability, counselor admissions leaderboard, and marketing channel conversion.
          </p>
        </div>
      </div>

      {/* Grid 1: Course Revenue Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Program Profitability & Revenue Generated
            </h3>
            <p className="text-xs text-slate-400">Total lifetime billing based on enrolled students</p>
          </div>
          <span className="text-xs font-bold text-indigo-600">
            ₹{totalCourseRevenue.toLocaleString()} Total Value
          </span>
        </div>

        <div className="space-y-4">
          {coursePerformance.map((c, i) => {
            const maxRev = coursePerformance[0]?.revenue || 1;
            const pct = maxRev > 0 ? Math.round((c.revenue / maxRev) * 100) : 0;
            return (
              <div key={c.code} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    {i + 1}. {c.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium">{c.activeStudents} active students</span>
                    <strong className="text-slate-900 font-bold text-sm">
                      ₹{c.revenue.toLocaleString()}
                    </strong>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
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
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Counselor Admissions Leaderboard
            </h3>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-3">
            {counselors.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No counselor assignments recorded yet. Inquiries will populate here as counselors manage leads.
              </div>
            ) : (
              counselors.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{c.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.leadsHandled} leads handled</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{c.converted} Converted</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      {c.leadsHandled > 0 ? Math.round((c.converted / c.leadsHandled) * 100) : 0}% Conv Rate
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lead Channel ROI */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Lead Channel Acquisition & Conversion
            </h3>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="overflow-x-auto">
            {leads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No marketing channel inquiries captured yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="pb-2">Channel</th>
                    <th className="pb-2">Leads</th>
                    <th className="pb-2">Converted</th>
                    <th className="pb-2 text-right">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {leadChannels.map((ch, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">{ch.source}</td>
                      <td className="py-2.5 text-slate-600">{ch.leads}</td>
                      <td className="py-2.5 font-semibold text-emerald-600">{ch.converted}</td>
                      <td className="py-2.5 text-right font-mono text-slate-700">
                        {ch.convRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

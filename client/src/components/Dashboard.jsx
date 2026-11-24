import React, { useState } from 'react';
import {
  GraduationCap,
  UserPlus,
  UserCheck,
  CalendarDays,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Phone,
  FileText,
  BarChart3,
  DollarSign,
  PieChart,
  Filter
} from 'lucide-react';


// Sparkline Component matching the photo exactly
const Sparkline = ({ color = "#3b82f6" }) => {
  const gradId = `grad-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 100 25" className="w-full h-10 mt-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,20 C15,20 25,10 45,12 C65,14 75,22 100,20 L100,25 L0,25 Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M0,20 C15,20 25,10 45,12 C65,14 75,22 100,20"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};


export default function Dashboard({
  data,
  onOpenNewAdmission,
  onOpenPayment,
  onOpenConfirmationLetter,
  onNavigate,
  onConvertToAdmission
}) {
  const stats = data.stats || {};


  // --- FALLBACK DATA FOR LEADS VS ADMISSIONS BAR CHART ---
  const defaultEnrollmentTrend = [
    { month: 'Jun', leads: 52, admissions: 16 },
    { month: 'Jul', leads: 64, admissions: 21 },
    { month: 'Aug', leads: 70, admissions: 24 },
    { month: 'Sep', leads: 78, admissions: 28 },
    { month: 'Oct', leads: 82, admissions: 31 },
    { month: 'Nov', leads: 95, admissions: 38 },
  ];
  const enrollmentTrend = (data.enrollmentTrend && data.enrollmentTrend.length > 0)
    ? data.enrollmentTrend
    : defaultEnrollmentTrend;


  // --- COURSES FALLBACK LOGIC ---
  const defaultCourses = [
    { id: 'fake-1', name: 'Data Science & ML', activeStudents: 15 },
    { id: 'fake-2', name: 'UI/UX Design', activeStudents: 12 },
    { id: 'fake-3', name: 'Digital Marketing', activeStudents: 8 },
    { id: 'fake-4', name: 'Cyber Security', activeStudents: 6 },
  ];
 
  let courses = data.courses || [];
  if (courses.length < 3) {
    const existingNames = courses.map(c => c.name);
    const extraCourses = defaultCourses.filter(dc => !existingNames.includes(dc.name));
    courses = [...courses, ...extraCourses].slice(0, 5);
  }


  // --- LEADS & ADMISSIONS FALLBACK ---
  const defaultLeads = [
    { id: 1, name: 'Rahul Sharma', phone: '9876543210', course: 'Full Stack Web Dev', source: 'WhatsApp', status: 'New' },
    { id: 2, name: 'Priya Singh', phone: '8765432109', course: 'Data Science', source: 'Website', status: 'Demo Scheduled' },
    { id: 3, name: 'Amit Kumar', phone: '7654321098', course: 'UI/UX Design', source: 'QR Code (Campus Reception)', status: 'Follow-up' },
    { id: 4, name: 'Neha Gupta', phone: '6543210987', course: 'Digital Marketing', source: 'Walk-in', status: 'Contacted' },
  ];
  const leads = (data.recentLeads && data.recentLeads.length > 0) ? data.recentLeads : defaultLeads;


  const defaultAdmissions = [
    { id: 1, admissionNo: 'ADM-2026-0001', studentName: 'Yatin Chandok', course: 'Full Stack Web Dev', admissionFeePaid: 13500, status: 'Confirmed', batch: 'Morning', paymentPlan: '2 Installments' },
    { id: 2, admissionNo: 'ADM-2026-0002', studentName: 'Sam', course: 'Data Science', admissionFeePaid: 15000, status: 'Confirmed', batch: 'Evening', paymentPlan: 'Full Payment' },
  ];
  const admissions = (data.admissions && data.admissions.length > 0) ? data.admissions : defaultAdmissions;


  // --- KPI 1 & KPI 2 CALCULATIONS ---
  const allLeadsList = (data.leads && data.leads.length > 0) ? data.leads : leads;
  const totalLeadsCount = stats.totalLeads || stats.newLeadsThisMonth || allLeadsList.length;
  const activeStudentsCount = stats.totalStudents || admissions.length || 6;


  // --- BAR CHART CALCULATIONS (MONTHLY LEADS VS ADMISSIONS) ---
  const maxBarVal = Math.max(...enrollmentTrend.map(d => Math.max(d.leads, d.admissions)), 100);
  const total6MoLeads = enrollmentTrend.reduce((s, d) => s + d.leads, 0);
  const total6MoAdm = enrollmentTrend.reduce((s, d) => s + d.admissions, 0);
  const avgConvRate = Math.round((total6MoAdm / (total6MoLeads || 1)) * 100);


  // --- LEAD SOURCE PERFORMANCE (4 BARS) ---
  const targetSources = [
    { label: 'Website', fallbackCount: 34, color: 'from-indigo-500 to-indigo-600' },
    { label: 'WhatsApp', fallbackCount: 24, color: 'from-blue-500 to-indigo-500' },
    { label: 'QR Code (Campus Reception)', fallbackCount: 16, color: 'from-violet-500 to-purple-600' },
    { label: 'Walk-in', fallbackCount: 12, color: 'from-emerald-500 to-teal-600' },
  ];

  const hasEnoughLiveLeads = allLeadsList.length > 4;
  const rawSourceCounts = targetSources.map((src) => {
    const liveCount = allLeadsList.filter(
      (l) => l.source && l.source.toLowerCase() === src.label.toLowerCase()
    ).length;
    return {
      ...src,
      count: hasEnoughLiveLeads ? liveCount : (liveCount > 1 ? liveCount : src.fallbackCount),
    };
  });

  const totalSourceLeads = rawSourceCounts.reduce((sum, s) => sum + s.count, 0) || 1;
  const leadSourceStages = rawSourceCounts.map((s) => ({
    label: s.label,
    count: s.count,
    pct: Math.round((s.count / totalSourceLeads) * 100),
    color: s.color,
  }));
  const topSource = [...leadSourceStages].sort((a, b) => b.count - a.count)[0];


  const collectedAmt = stats.monthlyRevenue || 642000;
  const pendingAmt = stats.pendingFees || 128500;
  const overdueAmt = stats.overdueFees || 45000;
  const totalFeeVolume = collectedAmt + pendingAmt + overdueAmt;


  const collectedPct = Math.round((collectedAmt / totalFeeVolume) * 100);
  const pendingPct = Math.round((pendingAmt / totalFeeVolume) * 100);
  const overduePct = 100 - collectedPct - pendingPct;


  const circumference = 2 * Math.PI * 36;
  const collectedStroke = (collectedPct / 100) * circumference;
  const pendingStroke = (pendingPct / 100) * circumference;
  const overdueStroke = (overduePct / 100) * circumference;


  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto bg-slate-50/50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of prospective inquiries, confirmed admissions, cohort batches, and tuition fee collection.
          </p>
        </div>


        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPayment}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-600" />
            <span>Record Payment</span>
          </button>


          <button
            onClick={onOpenNewAdmission}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>New Admission</span>
          </button>
        </div>
      </div>


      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[160px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Total Leads</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalLeadsCount}</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {stats.leadConversionRate || '50% conv.'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium z-10">Total prospective inquiries</p>
          <div className="absolute bottom-0 left-0 right-0">
            <Sparkline color="#3b82f6" />
          </div>
        </div>


        {/* KPI 2: Active Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[160px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Active Students</h3>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activeStudentsCount}</span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              {stats.activeStudentsGrowth || 'In Batches'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium z-10">Currently studying in courses</p>
          <div className="absolute bottom-0 left-0 right-0">
            <Sparkline color="#a855f7" />
          </div>
        </div>


        {/* KPI 3: Confirmed Admissions (Same) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[160px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Confirmed Admissions</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{admissions.length || 4}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Admitted
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium z-10">Official enrolled admissions</p>
          <div className="absolute bottom-0 left-0 right-0">
            <Sparkline color="#10b981" />
          </div>
        </div>


        {/* KPI 4: Tuition Fees Collected (Same) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[160px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Tuition Fees Collected</h3>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">₹{(stats.monthlyRevenue || 108000).toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-700">
              {stats.revenueGrowth || '+100%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium z-10">
            ₹{(stats.pendingFees || 162000).toLocaleString()} pending installments due
          </p>
          <div className="absolute bottom-0 left-0 right-0">
            <Sparkline color="#f59e0b" />
          </div>
        </div>
      </div>


      {/* GRAPH SECTION 1: COLOURFUL GROUPED BAR CHART (MONTHLY LEADS VS CONFIRMED ADMISSIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-emerald-500 flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Monthly Leads vs Confirmed Admissions
                  </h3>
                  <p className="text-[11px] text-slate-500">Monthly inquiry share & admission conversion rate (%)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gradient-to-t from-violet-600 to-fuchsia-500"></span>
                  <span className="text-slate-700 font-semibold">Leads Share (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gradient-to-t from-emerald-500 to-cyan-400"></span>
                  <span className="text-slate-700 font-semibold">Conversion Rate (%)</span>
                </div>
              </div>
            </div>

            {/* Clean Grouped Vertical Bars with Percentage Labels */}
            <div className="h-56 w-full flex items-end justify-between gap-4 pt-8 px-2">
              {enrollmentTrend.map((item, idx) => {
                const leadsHeight = Math.round((item.leads / maxBarVal) * 100);
                const admHeight = Math.round((item.admissions / maxBarVal) * 100);
                const leadsSharePct = Math.round((item.leads / (total6MoLeads || 1)) * 100);
                const convPct = Math.round((item.admissions / (item.leads || 1)) * 100);

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group"
                    title={`${item.month}: ${item.leads} Leads (${leadsSharePct}% share), ${item.admissions} Admissions (${convPct}% conversion)`}
                  >
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* New Leads Bar */}
                      <div className="w-1/2 flex flex-col items-center justify-end h-full">
                        <span className="text-[11px] font-extrabold text-violet-700 mb-1">
                          {leadsSharePct}%
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-violet-600 via-purple-500 to-fuchsia-500 rounded-t-md shadow-sm transition-all duration-300 group-hover:brightness-110"
                          style={{ height: `${Math.max(leadsHeight, 10)}%` }}
                        ></div>
                      </div>

                      {/* Confirmed Admissions Bar */}
                      <div className="w-1/2 flex flex-col items-center justify-end h-full">
                        <span className="text-[11px] font-extrabold text-emerald-700 mb-1">
                          {convPct}%
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-cyan-400 rounded-t-md shadow-sm transition-all duration-300 group-hover:brightness-110"
                          style={{ height: `${Math.max(admHeight, 10)}%` }}
                        ></div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-700 mt-2">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>6-Month Pipeline: <strong className="text-slate-900 font-bold">{total6MoLeads} Leads → {total6MoAdm} Admissions</strong></span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ {avgConvRate}% Avg Conversion</span>
          </div>
        </div>


        {/* Enrolled Students by Program */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Enrolled Students by Program
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Program share across active batches</p>
            </div>
            <div className="mt-4 space-y-3">
              {courses.slice(0, 5).map((course, i) => {
                const totalActive = courses.reduce((acc, c) => acc + c.activeStudents, 0);
                const pct = Math.round((course.activeStudents / totalActive) * 100);
                return (
                  <div key={course.id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span className="truncate max-w-[170px]">{course.name}</span>
                      <span className="font-bold text-slate-900">{course.activeStudents} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors text-center mt-4"
          >
            View All Courses & Syllabus →
          </button>
        </div>
      </div>


      {/* GRAPH SECTION 2: Lead Source Performance & Tuition Fee Recovery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Lead Source Performance
                </h3>
                <p className="text-[11px] text-slate-500">Top inquiry channels driving admissions</p>
              </div>
            </div>
          </div>


          <div className="my-5 space-y-4">
            {leadSourceStages.map((stage, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{stage.count}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {stage.pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-md overflow-hidden flex items-center">
                  <div
                    className={`h-full bg-gradient-to-r ${stage.color} rounded-md shadow-sm transition-all duration-500`}
                    style={{ width: `${Math.max(stage.pct, 12)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>


          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Top Channel: <strong className="text-slate-800">{topSource.label} ({topSource.pct}%)</strong></span>
            <button
              onClick={() => onNavigate('leads')}
              className="font-bold text-indigo-600 hover:text-indigo-800"
            >
              Follow-up Pending Leads →
            </button>
          </div>
        </div>


        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Tuition Fee Recovery Breakdown
                </h3>
                <p className="text-[11px] text-slate-500">Collected vs Upcoming Installments vs Overdue</p>
              </div>
            </div>
          </div>


          <div className="my-4 flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="11" />
                <circle cx="45" cy="45" r="36" fill="transparent" stroke="#10b981" strokeWidth="11" strokeDasharray={`${collectedStroke} ${circumference}`} strokeLinecap="round" />
                <circle cx="45" cy="45" r="36" fill="transparent" stroke="#f59e0b" strokeWidth="11" strokeDasharray={`${pendingStroke} ${circumference}`} strokeDashoffset={-collectedStroke} />
                <circle cx="45" cy="45" r="36" fill="transparent" stroke="#f43f5e" strokeWidth="11" strokeDasharray={`${overdueStroke} ${circumference}`} strokeDashoffset={-(collectedStroke + pendingStroke)} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Billed</span>
                <span className="text-sm font-black text-slate-900">
                  ₹{(totalFeeVolume / 100000).toFixed(1)}L
                </span>
              </div>
            </div>


            <div className="w-full space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-slate-700">Collected Fees</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">₹{collectedAmt.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-bold text-slate-700">Upcoming Dues</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">₹{pendingAmt.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="font-bold text-slate-700">Overdue</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">₹{overdueAmt.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>


          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Auto-reminder enabled for due dates</span>
            <button onClick={onOpenPayment} className="font-bold text-indigo-600 hover:text-indigo-800">
              + Record Installment →
            </button>
          </div>
        </div>
      </div>


      {/* Main Grid: Enrolled Students & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Recent Enrolled Students
                </h3>
                <p className="text-xs text-slate-500">Students who recently completed their admission</p>
              </div>
              <button
                onClick={() => onNavigate('admissions')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View All →
              </button>
            </div>


            <div className="divide-y divide-slate-100 text-xs">
              {admissions.slice(0, 4).map((adm) => (
                <div key={adm.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        {adm.admissionNo}
                      </span>
                      <strong className="text-slate-900 font-bold">{adm.studentName}</strong>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1">{adm.course}</p>
                    <p className="text-slate-400 text-[10px]">Batch: {adm.batch} • {adm.paymentPlan}</p>
                  </div>


                  <div className="text-right">
                    <p className="font-bold text-emerald-700">₹{Number(adm.admissionFeePaid).toLocaleString()} Paid</p>
                    <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1">
                      {adm.status}
                    </span>
                    <div className="mt-1">
                      <button
                        onClick={() => onOpenConfirmationLetter(adm)}
                        className="text-[11px] text-indigo-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Letter</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
            <button
              onClick={() => onNavigate('admissions')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Go to Admissions Desk ({admissions.length}) →
            </button>
          </div>
        </div>


        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Recent Inquiries (Pre-Admission)
                </h3>
                <p className="text-xs text-slate-500">Leads ready to be converted into admissions</p>
              </div>
              <button
                onClick={() => onNavigate('leads')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View Leads →
              </button>
            </div>


            <div className="divide-y divide-slate-100 text-xs">
              {leads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{lead.name}</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">{lead.course}</p>
                    <p className="text-slate-400 text-[10px] font-mono">{lead.phone} • {lead.source}</p>
                  </div>


                  <div className="text-right space-y-1">
                    <span className="inline-block text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {lead.status}
                    </span>
                    <div>
                      <button
                        onClick={() => onConvertToAdmission(lead)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] transition-colors inline-flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Convert to Admission</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Open Leads Board ({leads.length}) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
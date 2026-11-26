import React from 'react';
import {
  GraduationCap,
  UserPlus,
  UserCheck,
  CreditCard,
  FileText,
  BarChart3,
  PieChart,
  Filter,
  BookOpen
} from 'lucide-react';

// Crisp angular sparkline component
const Sparkline = ({ color = "#3b82f6" }) => {
  const gradId = `grad-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 100 25" className="w-full h-10 mt-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,21 L18,17 L36,19 L54,11 L74,15 L100,8 L100,25 L0,25 Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M0,21 L18,17 L36,19 L54,11 L74,15 L100,8"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
};

export default function Dashboard({
  data = {},
  onOpenNewAdmission,
  onOpenPayment,
  onOpenConfirmationLetter,
  onNavigate,
  onConvertToAdmission,
  onOpenStudentProfile
}) {
  const safeData = data || {};
  const stats = safeData.stats || {};

  // 1. REAL-TIME ARRAYS FROM App.jsx (supports both camelCase & snake_case DB fields)
  const leadsList = Array.isArray(safeData.recentLeads)
    ? safeData.recentLeads
    : (Array.isArray(safeData.leads) ? safeData.leads : []);

  const admissionsList = Array.isArray(safeData.admissions) ? safeData.admissions : [];
  const studentsList = Array.isArray(safeData.students) ? safeData.students : [];
  const coursesList = Array.isArray(safeData.courses) ? safeData.courses : [];
  const feeTransactions = Array.isArray(safeData.feeTransactions) ? safeData.feeTransactions : [];

  // 2. REAL-TIME KPI CALCULATIONS
  const totalLeadsCount = leadsList.length > 0
    ? leadsList.length
    : Number(stats.newLeadsThisMonth || stats.totalLeads || 0);

  const totalCoursesCount = coursesList.length > 0
    ? coursesList.length
    : Number(stats.totalCourses || 0);

  const activeStudentsCount = studentsList.length > 0
    ? studentsList.filter(s => (s.status || 'Active').toLowerCase() !== 'dropped').length
    : Number(stats.totalStudents || admissionsList.length || 0);

  const confirmedAdmissionsCount = admissionsList.length > 0
    ? admissionsList.length
    : Number(stats.confirmedAdmissions || 0);

  const conversionPct = (totalLeadsCount + confirmedAdmissionsCount) > 0
    ? `${Math.round((confirmedAdmissionsCount / (totalLeadsCount + confirmedAdmissionsCount)) * 100)}% conv.`
    : '0% conv.';

  // Real-time Fee Calculations from transactions & students
  const liveCollected = feeTransactions.length > 0
    ? feeTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
    : Number(stats.monthlyRevenue || 0);

  const livePending = studentsList.length > 0
    ? studentsList.reduce((sum, st) => sum + Number(st.feeDue ?? st.fee_due ?? 0), 0)
    : Number(stats.pendingFees || 0);

  const liveOverdue = studentsList.length > 0
    ? studentsList
        .filter(st => (st.feeStatus || st.fee_status || '').toLowerCase() === 'overdue')
        .reduce((sum, st) => sum + Number(st.feeDue ?? st.fee_due ?? 0), 0)
    : Number(stats.overdueFees || 0);

  const upcomingPending = Math.max(0, livePending - liveOverdue);
  const totalFeeVolume = liveCollected + upcomingPending + liveOverdue;

  const collectedPct = totalFeeVolume > 0 ? Math.round((liveCollected / totalFeeVolume) * 100) : 0;
  const pendingPct = totalFeeVolume > 0 ? Math.round((upcomingPending / totalFeeVolume) * 100) : 0;
  const overduePct = totalFeeVolume > 0 ? Math.max(0, 100 - collectedPct - pendingPct) : 0;

  const circumference = 2 * Math.PI * 36;
  const collectedStroke = (collectedPct / 100) * circumference;
  const pendingStroke = (pendingPct / 100) * circumference;
  const overdueStroke = (overduePct / 100) * circumference;

  // 3. REAL-TIME MONTHLY LEADS VS CONFIRMED ADMISSIONS (LAST 6 MONTHS)
  const buildLast6MonthsTrend = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        month: monthNames[d.getMonth()],
        leads: 0,
        admissions: 0,
      });
    }

    leadsList.forEach((lead) => {
      const rawDate = lead.createdAt || lead.created_at || lead.date || lead.inquiryDate;
      const dt = rawDate ? new Date(rawDate) : now;
      if (!isNaN(dt.getTime())) {
        const slot = months.find(m => m.year === dt.getFullYear() && m.monthIdx === dt.getMonth());
        if (slot) slot.leads += 1;
      }
    });

    admissionsList.forEach((adm) => {
      const rawDate = adm.admissionDate || adm.admission_date || adm.createdAt || adm.created_at;
      const dt = rawDate ? new Date(rawDate) : now;
      if (!isNaN(dt.getTime())) {
        const slot = months.find(m => m.year === dt.getFullYear() && m.monthIdx === dt.getMonth());
        if (slot) slot.admissions += 1;
      }
    });

    return months;
  };

  const enrollmentTrend = buildLast6MonthsTrend();
  const maxBarVal = Math.max(...enrollmentTrend.map(d => Math.max(d.leads, d.admissions)), 1);
  const total6MoLeads = enrollmentTrend.reduce((s, d) => s + d.leads, 0);
  const total6MoAdm = enrollmentTrend.reduce((s, d) => s + d.admissions, 0);
  const avgConvRate = (total6MoLeads + total6MoAdm) > 0
    ? Math.round((total6MoAdm / (total6MoLeads + total6MoAdm)) * 100)
    : 0;

  // 4. REAL-TIME ENROLLED STUDENTS BY PROGRAM
  const programCounts = coursesList.map((course, index) => {
    const cName = course.name || course.title || `Course ${index + 1}`;
    const studentCount = studentsList.length > 0
      ? studentsList.filter(s => (s.course || '').trim().toLowerCase() === cName.trim().toLowerCase()).length
      : admissionsList.filter(a => (a.course || '').trim().toLowerCase() === cName.trim().toLowerCase()).length;

    return {
      id: course.id || course._id || cName,
      name: cName,
      activeStudents: studentCount,
    };
  }).sort((a, b) => b.activeStudents - a.activeStudents);

  const totalEnrolledAcrossPrograms = programCounts.reduce((acc, c) => acc + c.activeStudents, 0);

  // 5. REAL-TIME LEAD SOURCE PERFORMANCE (4 BARS)
  const targetSources = [
    { label: 'Website', color: 'from-indigo-500 to-indigo-600' },
    { label: 'WhatsApp', color: 'from-blue-500 to-indigo-500' },
    { label: 'QR Code (Campus Reception)', color: 'from-violet-500 to-purple-600' },
    { label: 'Walk-in', color: 'from-emerald-500 to-teal-600' },
  ];

  const rawSourceCounts = targetSources.map((src) => {
    const count = leadsList.filter(
      (l) => (l.source || '').trim().toLowerCase() === src.label.toLowerCase()
    ).length;
    return { ...src, count };
  });

  const totalMatchedSourceLeads = rawSourceCounts.reduce((sum, s) => sum + s.count, 0);
  const leadSourceStages = rawSourceCounts.map((s) => ({
    label: s.label,
    count: s.count,
    pct: totalMatchedSourceLeads > 0 ? Math.round((s.count / totalMatchedSourceLeads) * 100) : 0,
    color: s.color,
  }));
  const topSource = [...leadSourceStages].sort((a, b) => b.count - a.count)[0];

  // Avatar helpers
  const avatarGradients = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-fuchsia-600',
    'from-amber-500 to-orange-600',
  ];

  const getInitials = (name = '') =>
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'S';

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
            type="button"
            onClick={() => onOpenPayment && onOpenPayment()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-600" />
            <span>Record Payment</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewAdmission && onOpenNewAdmission()}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Leads */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/50 p-5 rounded-2xl border border-slate-200/80 shadow-[0_8px_24px_-6px_rgba(37,99,235,0.14)] hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col min-h-[168px] relative overflow-hidden">
          <div className="flex justify-between items-center mb-2.5 z-10">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Total Leads</h3>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-sm">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 z-10">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalLeadsCount}</span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 border border-blue-200/70 px-2 py-0.5 rounded-full">
              {conversionPct}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100/90 z-10">
            <p className="text-[11px] text-slate-500 font-semibold">Total prospective inquiries</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 opacity-95">
            <Sparkline color="#2563eb" />
          </div>
        </div>

        {/* KPI 2: Total Courses */}
        <div
          onClick={() => onNavigate && onNavigate('courses')}
          className="bg-gradient-to-br from-white via-white to-purple-50/50 p-5 rounded-2xl border border-slate-200/80 shadow-[0_8px_24px_-6px_rgba(147,51,234,0.14)] hover:shadow-[0_12px_28px_-6px_rgba(147,51,234,0.22)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col min-h-[168px] relative overflow-hidden cursor-pointer"
          title="Click to view all courses & syllabus"
        >
          <div className="flex justify-between items-center mb-2.5 z-10">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Total Courses</h3>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 z-10">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalCoursesCount}</span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-100/80 border border-purple-200/70 px-2 py-0.5 rounded-full">
              Active Programs
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100/90 z-10">
            <p className="text-[11px] text-slate-500 font-semibold">Academic courses & syllabus</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 opacity-95">
            <Sparkline color="#9333ea" />
          </div>
        </div>

        {/* KPI 3: Confirmed Admissions */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 p-5 rounded-2xl border border-slate-200/80 shadow-[0_8px_24px_-6px_rgba(5,150,105,0.14)] hover:shadow-[0_12px_28px_-6px_rgba(5,150,105,0.22)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col min-h-[168px] relative overflow-hidden">
          <div className="flex justify-between items-center mb-2.5 z-10">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Confirmed Admissions</h3>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 z-10">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{confirmedAdmissionsCount}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              Admitted
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100/90 z-10">
            <p className="text-[11px] text-slate-500 font-semibold">Official enrolled admissions</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 opacity-95">
            <Sparkline color="#059669" />
          </div>
        </div>

        {/* KPI 4: Tuition Fees Collected */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/50 p-5 rounded-2xl border border-slate-200/80 shadow-[0_8px_24px_-6px_rgba(217,119,6,0.14)] hover:shadow-[0_12px_28px_-6px_rgba(217,119,6,0.22)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col min-h-[168px] relative overflow-hidden">
          <div className="flex justify-between items-center mb-2.5 z-10">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Fees Collected</h3>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 z-10">
            <span className="text-2xl font-black text-slate-900 tracking-tight">₹{liveCollected.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              {collectedPct}%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100/90 z-10">
            <p className="text-[11px] text-slate-500 font-semibold">
              ₹{livePending.toLocaleString()} pending installments due
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 opacity-95">
            <Sparkline color="#d97706" />
          </div>
        </div>
      </div>

      {/* GRAPH SECTION 1: Monthly Leads vs Confirmed Admissions & Program Share */}
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

            <div className="h-56 w-full flex items-end justify-between gap-4 pt-8 px-2">
              {enrollmentTrend.map((item, idx) => {
                const leadsHeight = item.leads > 0 ? Math.round((item.leads / maxBarVal) * 100) : 6;
                const admHeight = item.admissions > 0 ? Math.round((item.admissions / maxBarVal) * 100) : 6;
                const leadsSharePct = total6MoLeads > 0 ? Math.round((item.leads / total6MoLeads) * 100) : 0;
                const convPct = (item.leads + item.admissions) > 0
                  ? Math.round((item.admissions / (item.leads + item.admissions)) * 100)
                  : 0;

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
                          style={{ height: `${leadsHeight}%` }}
                        ></div>
                      </div>

                      {/* Confirmed Admissions Bar */}
                      <div className="w-1/2 flex flex-col items-center justify-end h-full">
                        <span className="text-[11px] font-extrabold text-emerald-700 mb-1">
                          {convPct}%
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-cyan-400 rounded-t-md shadow-sm transition-all duration-300 group-hover:brightness-110"
                          style={{ height: `${admHeight}%` }}
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
              {programCounts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No courses available yet.</p>
              ) : (
                programCounts.slice(0, 5).map((course) => {
                  const pct = totalEnrolledAcrossPrograms > 0
                    ? Math.round((course.activeStudents / totalEnrolledAcrossPrograms) * 100)
                    : 0;
                  return (
                    <div key={course.id} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span className="truncate max-w-[170px]">{course.name}</span>
                        <span className="font-bold text-slate-900">{course.activeStudents} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('courses')}
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
                    style={{ width: `${stage.count > 0 ? Math.max(stage.pct, 8) : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Top Channel:{' '}
              <strong className="text-slate-800">
                {topSource && topSource.count > 0 ? `${topSource.label} (${topSource.pct}%)` : 'No leads yet'}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('leads')}
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
                {totalFeeVolume > 0 && (
                  <>
                    <circle cx="45" cy="45" r="36" fill="transparent" stroke="#10b981" strokeWidth="11" strokeDasharray={`${collectedStroke} ${circumference}`} strokeLinecap="round" />
                    <circle cx="45" cy="45" r="36" fill="transparent" stroke="#f59e0b" strokeWidth="11" strokeDasharray={`${pendingStroke} ${circumference}`} strokeDashoffset={-collectedStroke} />
                    <circle cx="45" cy="45" r="36" fill="transparent" stroke="#f43f5e" strokeWidth="11" strokeDasharray={`${overdueStroke} ${circumference}`} strokeDashoffset={-(collectedStroke + pendingStroke)} />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Billed</span>
                <span className="text-sm font-black text-slate-900">
                  {totalFeeVolume >= 100000
                    ? `₹${(totalFeeVolume / 100000).toFixed(1)}L`
                    : `₹${totalFeeVolume.toLocaleString()}`}
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
                  <span className="font-bold text-slate-900">₹{liveCollected.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-bold text-slate-700">Upcoming Dues</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">₹{upcomingPending.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="font-bold text-slate-700">Overdue</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">₹{liveOverdue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Auto-reminder enabled for due dates</span>
            <button
              type="button"
              onClick={() => onOpenPayment && onOpenPayment()}
              className="font-bold text-indigo-600 hover:text-indigo-800"
            >
              + Record Installment →
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Colourful Enrolled Students & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Recent Enrolled Students */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white border-b border-emerald-100/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Recent Enrolled Students
                  </h3>
                  <p className="text-xs text-slate-500">Students who recently completed their admission</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('admissions')}
                className="text-xs font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                View All →
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {admissionsList.length === 0 ? (
                <p className="p-6 text-center text-slate-400">No admissions recorded yet.</p>
              ) : (
                admissionsList.slice(0, 4).map((adm, idx) => {
                  const studentName = adm.studentName || adm.student_name || adm.name || 'Student';
                  const admNo = adm.admissionNo || adm.admission_no || `ADM-${idx + 1}`;
                  const paidAmt = Number(adm.admissionFeePaid ?? adm.admission_fee_paid ?? 0);
                  const payPlan = adm.paymentPlan || adm.payment_plan || 'Standard Plan';

                  return (
                    <div
                      key={adm.id || adm._id || admNo}
                      className="p-4 hover:bg-emerald-50/30 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5`}>
                          {getInitials(studentName)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80">
                              {admNo}
                            </span>
                            <button
                              type="button"
                              onClick={() => onOpenStudentProfile && onOpenStudentProfile(adm)}
                              className="text-slate-900 hover:text-indigo-700 font-bold text-[13px] text-left"
                            >
                              {studentName}
                            </button>
                          </div>
                          <p className="text-slate-700 font-medium text-[11px] mt-1">{adm.course || 'General Course'}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">Batch: {adm.batch || 'General Cohort'} • {payPlan}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md inline-block">
                          ₹{paidAmt.toLocaleString()} Paid
                        </p>
                        <div className="mt-1">
                          <span className="inline-block text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded-full">
                            ✓ {adm.status || 'Confirmed'}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenConfirmationLetter && onOpenConfirmationLetter(adm)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Letter</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-t border-slate-200/80 text-right">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('admissions')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
            >
              Go to Admissions Desk ({admissionsList.length}) →
            </button>
          </div>
        </div>

        {/* Card 2: Recent Inquiries (Pre-Admission) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-white border-b border-indigo-100/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Recent Inquiries (Pre-Admission)
                  </h3>
                  <p className="text-xs text-slate-500">Leads ready to be converted into admissions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('leads')}
                className="text-xs font-bold text-indigo-700 bg-indigo-100/70 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                View Leads →
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {leadsList.length === 0 ? (
                <p className="p-6 text-center text-slate-400">No leads found.</p>
              ) : (
                leadsList.slice(0, 4).map((lead, idx) => (
                  <div key={lead.id || lead._id || idx} className="p-4 hover:bg-indigo-50/30 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[(idx + 1) % avatarGradients.length]} text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5`}>
                        {getInitials(lead.name)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-[13px]">{lead.name || 'Unnamed Lead'}</h4>
                        <p className="text-slate-700 font-medium text-[11px] mt-0.5">{lead.course || 'Course Inquiry'}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-slate-500 text-[10px] font-mono">{lead.phone || 'N/A'}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-1.5 py-0.2 rounded">
                            {lead.source || 'Direct'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1.5 shrink-0">
                      <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/80">
                        {lead.status || 'New'}
                      </span>
                      <div>
                        <button
                          type="button"
                          onClick={() => onConvertToAdmission && onConvertToAdmission(lead)}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-lg text-[10px] shadow-sm transition-all inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Convert to Admission</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-t border-slate-200/80 text-right">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('leads')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-bold hover:underline"
            >
              Open Leads Board ({leadsList.length}) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import {
  GraduationCap,
  UserPlus,
  UserCheck,
  CreditCard,
  Phone,
  FileText,
  BarChart3,
  Users,
  AlertCircle,
  MessageCircle,
  Clock,
  PieChart
} from 'lucide-react';

export default function Dashboard({
  data,
  onOpenNewAdmission,
  onOpenPayment,
  onOpenConfirmationLetter,
  onNavigate,
  onConvertToAdmission
}) {
  const stats = data.stats || {};
  const courses = data.courses || [];
  const batches = data.batches || [];
  const leads = data.recentLeads || [];
  const admissions = data.admissions || [];
  const students = data.students || [];
  const revenueTimeline = data.revenueTimeline || [];

  // --- CALCULATIONS ---
  const dynamicPendingFees = students.reduce((total, student) => total + (Number(student.feeDue) || 0), 0);
  const todayFollowUps = leads.filter(lead => lead.followUp && lead.followUp.includes('20 Nov'));
  const defaulterStudents = students.filter(s => s.feeStatus === 'Overdue' || s.feeDue > 0);
  const upcomingBatches = batches.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing');

  // Calculate Course-wise Admissions for Donut Chart
  const courseAdmissionsData = courses.slice(0, 4).map((course, index) => {
    const actualCount = admissions.filter(a => a.course === course.name).length;
    return { 
      name: course.name, 
      count: actualCount,
      color: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'][index % 4] 
    };
  });
  
  const totalAdmissionsChart = courseAdmissionsData.reduce((acc, curr) => acc + curr.count, 0);
  let cumulativePercent = 0;
  
  // Create the CSS gradient for the Donut Chart
  const gradientString = totalAdmissionsChart > 0
    ? courseAdmissionsData.map(item => {
        const percent = (item.count / totalAdmissionsChart) * 100;
        const start = cumulativePercent;
        cumulativePercent += percent;
        return `${item.color} ${start}% ${cumulativePercent}%`;
      }).join(', ')
    : '#e2e8f0 0% 100%';

  const maxCollected = Math.max(...revenueTimeline.map(r => Math.max(r.collected, r.target)), 700000);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-slate-50/50 min-h-screen font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Monitor inquiries, admissions, batches, and fee collections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPayment}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-sm transition-all duration-200"
          >
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={onOpenNewAdmission}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* 4 KPI CARDS (Modern Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm shadow-slate-200/50 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.totalStudents || 342}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{stats.activeStudentsGrowth || '+14.5%'}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Active enrolled student count</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm shadow-slate-200/50 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inquiries This Month</span>
              <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.newLeadsThisMonth || 86}</span>
              <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-md">{stats.leadConversionRate || '28.4%'} conv.</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Prospective leads in pipeline</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm shadow-slate-200/50 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed Admissions</span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{admissions.length}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Admitted</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Official enrolled admissions</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm shadow-slate-200/50 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tuition Fees</span>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">₹{(stats.monthlyRevenue || 642000).toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-600">{stats.revenueGrowth || '+18.2%'}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">₹{(stats.pendingFees || 128500).toLocaleString()} pending installments</p>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm shadow-slate-200/50 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900">Monthly Fee Collection vs Target</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm"></span><span className="text-slate-600">Collected</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200"></span><span className="text-slate-600">Target</span></div>
              </div>
            </div>
            
            <div className="h-64 w-full flex items-end justify-between gap-4 pt-6 px-2">
              {revenueTimeline.map((item, idx) => {
                const collectedHeight = Math.round((item.collected / maxCollected) * 100);
                const targetHeight = Math.round((item.target / maxCollected) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                      <div className="w-1/2 bg-slate-100 rounded-t-md transition-all group-hover:bg-slate-200" style={{ height: `${targetHeight}%` }}></div>
                      <div className="w-1/2 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md shadow-sm transition-all group-hover:from-indigo-700 group-hover:to-indigo-500" style={{ height: `${collectedHeight}%` }}>
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap transition-opacity">
                            ₹{(item.collected / 1000).toFixed(0)}k
                         </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">6-Month Collection: <strong className="text-slate-900 font-bold">₹3,177,000</strong></span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">✓ +8.4% above Q4 Target</span>
          </div>
        </div>

        {/* Enrolled by Program */}
        <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4">
              <h3 className="font-bold text-slate-900">Enrolled by Program</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Share across active batches</p>
            </div>
            <div className="mt-2 space-y-4">
              {courses.slice(0, 5).map((course) => {
                const totalActive = courses.reduce((acc, c) => acc + c.activeStudents, 0);
                const pct = Math.round((course.activeStudents / totalActive) * 100);
                return (
                  <div key={course.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 truncate max-w-[170px]">{course.name}</span>
                      <span className="text-slate-900">{course.activeStudents} <span className="text-slate-400 font-medium">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button onClick={() => onNavigate('courses')} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors text-center mt-6">
            View All Courses →
          </button>
        </div>
      </div>

      {/* ACTIONABLE WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colorful Donut Chart - Course-wise Admissions */}
        <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 p-6 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Course-wise Admissions</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Distribution of enrolled students</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <PieChart className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* The Donut Chart */}
            <div 
              className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner" 
              style={{ background: `conic-gradient(${gradientString})` }}
            >
              {/* Inner white circle for Donut effect */}
              <div className="absolute w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="text-2xl font-black text-slate-800">{admissions.length}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 flex-1 w-full">
              {courseAdmissionsData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></span>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{item.count}</span>
                </div>
              ))}
              {courseAdmissionsData.length === 0 && (
                <p className="text-xs text-slate-400 font-medium italic">No courses added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Today's Follow-ups */}
        <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 overflow-hidden border border-indigo-100">
          <div className="p-5 border-b border-indigo-100/50 bg-indigo-50/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                 <Phone className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900">Today's Follow-ups</h3>
            </div>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Schedule</span>
          </div>
          <div className="divide-y divide-slate-100">
            {todayFollowUps.map((lead) => (
              <div key={lead.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
                    {lead.name ? lead.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{lead.name}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate max-w-[150px]">{lead.course}</p>
                    <p className="text-indigo-600 font-bold text-[10px] mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/>{lead.followUp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <button onClick={() => onConvertToAdmission(lead)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm">
                    Convert
                  </button>
                </div>
              </div>
            ))}
            {todayFollowUps.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">
                No follow-ups scheduled for today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UPCOMING BATCHES */}
      <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 p-6">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
               <Clock className="w-4 h-4 text-slate-700" />
            </div>
            <h3 className="font-bold text-slate-900">Upcoming Batch Starts</h3>
          </div>
          <button onClick={() => onNavigate('batches')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View All Batches →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {upcomingBatches.slice(0, 3).map((batch) => {
            const fillPct = Math.round((batch.enrolled / batch.capacity) * 100);
            return (
              <div key={batch.id} className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{batch.name}</h4>
                  <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md shadow-sm">
                    {new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3 font-medium">{batch.timing}</p>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Seats Filled</span>
                  <span className={fillPct > 80 ? 'text-rose-600' : 'text-indigo-600'}>{batch.enrolled} / {batch.capacity}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${fillPct > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${fillPct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT LISTS (Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confirmed Admissions */}
        <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Recent Admissions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enrolled students in pipeline</p>
              </div>
              <button onClick={() => onNavigate('admissions')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg">View Pipeline</button>
            </div>
            <div className="divide-y divide-slate-100">
              {admissions.slice(0, 4).map((adm) => (
                <div key={adm.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{adm.admissionNo}</span>
                      <strong className="text-slate-900 text-sm">{adm.studentName}</strong>
                    </div>
                    <p className="text-slate-600 text-xs font-medium">{adm.course}</p>
                    <p className="text-slate-400 text-[10px] mt-1">Batch: {adm.batch} • {adm.paymentPlan}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 text-sm">₹{Number(adm.admissionFeePaid).toLocaleString()}</p>
                    <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1">{adm.status}</span>
                    <div className="mt-1.5">
                      <button onClick={() => onOpenConfirmationLetter(adm)} className="text-[11px] text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /><span>Letter</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
            <button onClick={() => onNavigate('admissions')} className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Open Full Pipeline ({admissions.length}) →</button>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Recent Inquiries</h3>
                <p className="text-xs text-slate-500 mt-0.5">Leads ready for conversion</p>
              </div>
              <button onClick={() => onNavigate('leads')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg">View Leads</button>
            </div>
            <div className="divide-y divide-slate-100">
              {leads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{lead.name}</h4>
                    <p className="text-slate-600 text-xs font-medium mt-0.5">{lead.course}</p>
                    <p className="text-slate-400 text-[10px] font-mono mt-1">{lead.phone} • {lead.source}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-1 rounded mb-2 border border-violet-100">{lead.status}</span>
                    <div>
                      <button onClick={() => onConvertToAdmission(lead)} className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg text-[10px] shadow-sm hover:shadow-md transition-all inline-flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /><span>Convert</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
            <button onClick={() => onNavigate('leads')} className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Open Leads Board ({leads.length}) →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import {
  GraduationCap,
  UserPlus,
  UserCheck,
  CreditCard,
  BarChart3,
  FileText
} from 'lucide-react';

export default function Dashboard({
  data,
  onOpenNewLead,
  onOpenNewAdmission,
  onOpenPayment,
  onOpenConfirmationLetter,
  onNavigate,
  onConvertToAdmission
}) {
  const courses = data.courses || [];
  const batches = data.batches || [];
  const leads = data.recentLeads || [];
  const admissions = data.admissions || [];
  const students = data.students || [];
  const feeTransactions = data.feeTransactions || [];

  // Dynamic real calculations
  const totalStudents = students.length;
  const totalLeads = leads.length;
  const totalAdmissions = admissions.length;
  const totalRevenue = feeTransactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalPending = students.reduce((acc, s) => acc + Number(s.feeDue || 0), 0);
  const leadConvRate = totalLeads > 0 ? `${Math.round((totalAdmissions / totalLeads) * 100)}%` : '0%';

  // Dynamic revenue timeline (from actual data or empty)
  const revenueTimeline = data.revenueTimeline && data.revenueTimeline.length > 0
    ? data.revenueTimeline
    : [];

  const maxCollected = Math.max(
    ...revenueTimeline.map(r => Math.max(Number(r.collected || 0), Number(r.target || 0))),
    100000
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time enrollment metrics, confirmed admissions, cohort schedules, and tuition collections.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPayment}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
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
        {/* Metric 1: Total Enrolled */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Students</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {totalStudents}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {totalStudents > 0 ? `+${totalStudents} active` : '0 active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Active enrolled student count</p>
          </div>
        </div>

        {/* Metric 2: Inquiries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inquiries This Month</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {totalLeads}
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                {leadConvRate} conv.
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Prospective leads in pipeline</p>
          </div>
        </div>

        {/* Metric 3: Confirmed Admissions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed Admissions</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {totalAdmissions}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Admitted
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Official enrolled admissions</p>
          </div>
        </div>

        {/* Metric 4: Tuition Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tuition Fees Collected</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ₹{totalRevenue.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {feeTransactions.length} receipts
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              ₹{totalPending.toLocaleString()} pending installments due
            </p>
          </div>
        </div>
      </div>

      {/* GRAPH SECTION: Monthly Tuition Fee Revenue Collection vs Target */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar/Trend Chart (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Monthly Tuition Fee Revenue Collection vs Target
                </h3>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-600"></span>
                  <span className="text-slate-600 font-medium">Collected Fee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-200"></span>
                  <span className="text-slate-600 font-medium">Target</span>
                </div>
              </div>
            </div>

            {/* Visual SVG Bar Graph or Empty State */}
            {revenueTimeline.length === 0 ? (
              <div className="h-56 w-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center p-6 my-4">
                <CreditCard className="w-8 h-8 text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-700 text-xs">No Payment History Recorded Yet</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  Revenue collections will chart automatically as tuition fees are recorded.
                </p>
              </div>
            ) : (
              <div className="h-56 w-full flex items-end justify-between gap-4 pt-6 px-2">
                {revenueTimeline.map((item, idx) => {
                  const collectedHeight = Math.round((Number(item.collected || 0) / maxCollected) * 100);
                  const targetHeight = Math.round((Number(item.target || 0) / maxCollected) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(Number(item.collected || 0) / 1000).toFixed(0)}k
                      </div>

                      <div className="w-full flex items-end justify-center gap-1.5 h-full">
                        <div
                          className="w-1/2 bg-slate-200 rounded-t transition-all group-hover:bg-slate-300"
                          style={{ height: `${targetHeight}%` }}
                          title={`Target: ₹${Number(item.target || 0).toLocaleString()}`}
                        ></div>
                        <div
                          className="w-1/2 bg-indigo-600 rounded-t transition-all group-hover:bg-indigo-700 shadow-2xs"
                          style={{ height: `${collectedHeight}%` }}
                          title={`Collected: ₹${Number(item.collected || 0).toLocaleString()}`}
                        ></div>
                      </div>

                      <span className="text-xs font-bold text-slate-700 mt-1">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Recorded Collections: <strong className="text-slate-900 font-bold">₹{totalRevenue.toLocaleString()}</strong></span>
            <span className="font-semibold text-indigo-700">{totalAdmissions} Admitted Students</span>
          </div>
        </div>

        {/* Course Revenue & Enrollment Breakdown (Takes 1 column) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Enrolled Students by Program
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Program share across active batches</p>
            </div>

            <div className="mt-4 space-y-3">
              {totalStudents === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs font-semibold text-slate-600">0 enrolled students</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Enrollment shares will calculate as admissions are confirmed</p>
                </div>
              ) : (
                courses.slice(0, 5).map((course) => {
                  const enrolledInCourse = students.filter(s => s.course === course.name).length;
                  const pct = totalStudents > 0 ? Math.round((enrolledInCourse / totalStudents) * 100) : 0;
                  return (
                    <div key={course.id} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span className="truncate max-w-[170px]">{course.name}</span>
                        <span className="font-bold text-slate-900">{enrolledInCourse} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
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
            onClick={() => onNavigate('courses')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors text-center mt-4"
          >
            View All Courses & Syllabus →
          </button>
        </div>
      </div>

      {/* Main Grid: Confirmed Admissions & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confirmed Admissions Box */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Recent Confirmed Admissions
                </h3>
                <p className="text-xs text-slate-500">Enrolled students in the Admissions Pipeline</p>
              </div>
              <button
                onClick={() => onNavigate('admissions')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View Pipeline →
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {admissions.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-400">
                  <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No confirmed admissions yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Students admitted will appear here with confirmation letters</p>
                </div>
              ) : (
                admissions.slice(0, 4).map((adm) => (
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
                      <p className="font-bold text-emerald-700">₹{Number(adm.admissionFeePaid || 0).toLocaleString()} Paid</p>
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
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
            <button
              onClick={() => onNavigate('admissions')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Open Full Admissions Pipeline ({admissions.length}) →
            </button>
          </div>
        </div>

        {/* Recent Inquiries & Lead Conversion */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
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
              {leads.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-400">
                  <UserPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No student inquiries yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Scan reception QR or click Add Lead to record inquiries</p>
                </div>
              ) : (
                leads.slice(0, 4).map((lead) => (
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
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 font-bold rounded text-[10px] transition-all inline-flex items-center gap-1 group shadow-2xs"
                        >
                          <UserCheck className="w-3 h-3 text-emerald-600 group-hover:text-white transition-colors" />
                          <span>Convert to Admission</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
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

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
  DollarSign
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
  const revenueTimeline = data.revenueTimeline || [];

  const maxCollected = Math.max(...revenueTimeline.map(r => Math.max(r.collected, r.target)), 700000);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
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

        {/* Action Buttons (Only one set of primary actions, no duplicates) */}
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
                {stats.totalStudents || 342}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {stats.activeStudentsGrowth || '+14.5%'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Active enrolled student count</p>
          </div>
        </div>

        {/* Metric 2: Inquiries This Month */}
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
                {stats.newLeadsThisMonth || 86}
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                {stats.leadConversionRate || '28.4%'} conv.
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
                {admissions.length}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Admitted
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Official enrolled admissions</p>
          </div>
        </div>

        {/* Metric 4: Monthly Revenue */}
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
                ₹{(stats.monthlyRevenue || 642000).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {stats.revenueGrowth || '+18.2%'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              ₹{(stats.pendingFees || 128500).toLocaleString()} pending installments due
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

            {/* Visual SVG Bar Graph */}
            <div className="h-56 w-full flex items-end justify-between gap-4 pt-6 px-2">
              {revenueTimeline.map((item, idx) => {
                const collectedHeight = Math.round((item.collected / maxCollected) * 100);
                const targetHeight = Math.round((item.target / maxCollected) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Tooltip on Hover */}
                    <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{(item.collected / 1000).toFixed(0)}k
                    </div>

                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Target Bar */}
                      <div
                        className="w-1/2 bg-slate-200 rounded-t transition-all group-hover:bg-slate-300"
                        style={{ height: `${targetHeight}%` }}
                        title={`Target: ₹${item.target.toLocaleString()}`}
                      ></div>
                      {/* Collected Bar */}
                      <div
                        className="w-1/2 bg-indigo-600 rounded-t transition-all group-hover:bg-indigo-700 shadow-2xs"
                        style={{ height: `${collectedHeight}%` }}
                        title={`Collected: ₹${item.collected.toLocaleString()}`}
                      ></div>
                    </div>

                    <span className="text-xs font-bold text-slate-700 mt-1">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>6-Month Collection Total: <strong className="text-slate-900 font-bold">₹3,177,000</strong></span>
            <span className="font-semibold text-emerald-700">✓ Exceeding Q4 Target by 8.4%</span>
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

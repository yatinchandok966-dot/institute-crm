import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  FileText,
  MessageSquare,
  Printer,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  Phone
} from 'lucide-react';

export default function AdmissionsModule({
  admissions,
  courses,
  batches,
  trainers = [],
  onOpenNewAdmission,
  onOpenConfirmationLetter,
  onUpdateAdmissionStatus
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const pipelineStages = [
    { id: 'Application Submitted', label: 'Application Submitted', border: 'border-blue-500', bg: 'bg-blue-50 text-blue-800' },
    { id: 'Fee Pending', label: 'Fee Pending / Part-Paid', border: 'border-amber-500', bg: 'bg-amber-50 text-amber-800' },
    { id: 'Admission Confirmed', label: 'Admission Confirmed', border: 'border-emerald-500', bg: 'bg-emerald-50 text-emerald-800' }
  ];

  const filtered = admissions.filter(adm => {
    const matchesSearch = adm.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.phone.includes(searchQuery) ||
      adm.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'All' || adm.course === courseFilter;
    const matchesStatus = statusFilter === 'All' || adm.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const openWhatsApp = (adm) => {
    const cleanPhone = adm.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hello ${adm.studentName}! Your admission for ${adm.course} (${adm.batch}) at EduPulse Academy is confirmed under Admission No: ${adm.admissionNo}. Please contact counselor ${adm.counselor} for any queries.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Admissions Pipeline
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {admissions.length} Registered Admissions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage confirmed student admissions, application numbers, payment plans, and verification workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
        
          <button
            onClick={onOpenNewAdmission}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Direct Admission</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, admission #, phone, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Course:</span>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium max-w-[200px] truncate focus:outline-none"
            >
              <option value="All">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none"
            >
              <option value="All">All Stages</option>
              {pipelineStages.map(s => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      { /* Register Table View */ }
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Admission #</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Course Program</th>
                  {/* <th className="px-4 py-3">Allotted Batch</th> */}
                  <th className="px-4 py-3">Total Fee</th>
                  <th className="px-4 py-3">Registration Fee</th>
                  {/* <th className="px-4 py-3">Balance Due</th> */}
                  <th className="px-4 py-3">Stage Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">No admissions in pipeline yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Confirmed inquiries converted to admissions will appear here</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(adm => (
                    <tr key={adm.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-700">
                        {adm.admissionNo}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{adm.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{adm.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {adm.course}
                      </td>
                      {/* <td className="px-4 py-3 text-slate-600">
                        <div>{adm.batch}</div>
                        {adm.trainer && adm.trainer !== 'Unassigned' && (
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold border border-indigo-200 inline-block mt-0.5">
                            Trainer: {adm.trainer}
                          </span>
                        )}
                      </td> */}
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        ₹{Number(adm.totalCourseFee).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        ₹{Number(adm.admissionFeePaid).toLocaleString()}
                      </td>
                      {/* <td className="px-4 py-3 font-bold text-slate-800">
                        ₹{Number(adm.feeDue).toLocaleString()}
                      </td> */}
                      <td className="px-4 py-3">
                        <select
                          value={adm.status}
                          onChange={(e) => onUpdateAdmissionStatus(adm.id, e.target.value)}
                          className="text-[11px] font-semibold bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none"
                        >
                          {pipelineStages.map(s => (
                            <option key={s.id} value={s.id}>{s.id}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenConfirmationLetter(adm)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px]"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Letter</span>
                          </button>
                          <button
                            onClick={() => openWhatsApp(adm)}
                            className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                            title="WhatsApp Confirmation"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}

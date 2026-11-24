import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  BookOpen,
  Eye,
  FileText,
  MessageSquare,
  Printer,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  Phone,
  Trash2
} from 'lucide-react';

export default function AdmissionsModule({
  admissions = [],
  courses = [],
  batches = [],
  trainers = [],
  onOpenNewAdmission,
  onOpenConfirmationLetter,
  onUpdateAdmissionStatus,
  onDeleteAdmission
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [admissionToDelete, setAdmissionToDelete] = useState(null);

  const pipelineStages = [
    { id: 'Application Submitted', label: 'Application Submitted', border: 'border-blue-500', bg: 'bg-blue-50 text-blue-800' },
    { id: 'Fee Pending', label: 'Fee Pending / Part-Paid', border: 'border-amber-500', bg: 'bg-amber-50 text-amber-800' },
    { id: 'Admission Confirmed', label: 'Admission Confirmed', border: 'border-emerald-500', bg: 'bg-emerald-50 text-emerald-800' }
  ];

  const filtered = (Array.isArray(admissions) ? admissions : []).filter(adm => {
    if (!adm) return false;
    const sName = String(adm.studentName || adm.student_name || adm.name || '').toLowerCase();
    const admNo = String(adm.admissionNo || adm.admission_no || '').toLowerCase();
    const appNo = String(adm.applicationNo || adm.application_no || '').toLowerCase();
    const phone = String(adm.phone || '');
    const course = String(adm.course || '').toLowerCase();
    const q = (searchQuery || '').trim().toLowerCase();

    const matchesSearch = !q || (
      sName.includes(q) ||
      admNo.includes(q) ||
      appNo.includes(q) ||
      phone.includes(q) ||
      course.includes(q)
    );
    const matchesCourse = courseFilter === 'All' || adm.course === courseFilter;
    const matchesStatus = statusFilter === 'All' || (adm.status || 'Admission Confirmed') === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const openWhatsApp = (adm) => {
    if (!adm) return;
    const cleanPhone = String(adm.phone || '').replace(/[^0-9]/g, '');
    const sName = adm.studentName || adm.student_name || 'Student';
    const aNo = adm.admissionNo || adm.admission_no || 'ADM';
    const cName = adm.course || 'Course';
    const bName = adm.batch || 'Batch';
    const counselorName = adm.counselor || 'Admissions Desk';
    const msg = encodeURIComponent(`Hello ${sName}! Your admission for ${cName} (${bName}) at EduPulse Academy is confirmed under Admission No: ${aNo}. Please contact counselor ${counselorName} for any queries.`);
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Admissions Register
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
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Course:</span>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium max-w-[200px] truncate focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Courses</option>
              {courses.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Stages</option>
              {pipelineStages.map(s => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Register Table View (Only View - Pipeline View Removed) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs border-collapse table-fixed">
            <colgroup>
              <col className="w-[12%]" /> {/* Admission # */}
              <col className="w-[15%]" /> {/* Student Name */}
              <col className="w-[15%]" /> {/* Course Program */}
              <col className="w-[13%]" /> {/* Allotted Batch */}
              <col className="w-[9%]" />  {/* Total Fee */}
              <col className="w-[10%]" /> {/* Registration Fee */}
              <col className="w-[12%]" /> {/* Stage Status */}
              <col className="w-[14%]" /> {/* Actions */}
            </colgroup>
            <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 select-none">
              <tr>
                <th className="px-3.5 py-3 text-left whitespace-nowrap">Admission #</th>
                <th className="px-3.5 py-3 text-left whitespace-nowrap">Student Name</th>
                <th className="px-3.5 py-3 text-left whitespace-nowrap">Course Program</th>
                <th className="px-3.5 py-3 text-left whitespace-nowrap">Allotted Batch</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Total Fee</th>
                {/* <th className="px-3 py-3 text-left whitespace-nowrap">Paid Fee</th> */}
                <th className="px-3 py-3 text-left whitespace-nowrap">Registration Fee</th>
                {/* <th className="px-3 py-3 text-left whitespace-nowrap">Balance Due</th> */}
                <th className="px-3 py-3 text-left whitespace-nowrap">Stage Status</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No admissions recorded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Confirmed inquiries converted to admissions or direct admissions will appear here</p>
                  </td>
                </tr>
              ) : (
                filtered.map(adm => (
                  <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. Admission # & Date */}
                    <td className="px-3.5 py-3 align-middle whitespace-nowrap overflow-hidden">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-200 shadow-2xs">
                        {adm.admissionNo || adm.admission_no || 'ADM-2026'}
                      </span>
                      {(adm.admissionDate || adm.admission_date) && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {adm.admissionDate || adm.admission_date}
                        </div>
                      )}
                    </td>

                    {/* 2. Student Name & Phone */}
                    <td className="px-3.5 py-3 align-middle overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {(adm.studentName || adm.student_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-xs truncate" title={adm.studentName || adm.student_name}>
                            {adm.studentName || adm.student_name || 'Student'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {adm.phone || '-'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Course Program */}
                    <td className="px-3.5 py-3 align-middle whitespace-nowrap overflow-hidden">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50/80 text-indigo-900 border border-indigo-100 max-w-full truncate shadow-2xs" title={adm.course}>
                        <BookOpen className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="truncate">{adm.course || '-'}</span>
                      </span>
                    </td>

                    {/* 4. Allotted Batch & Trainer */}
                    <td className="px-3.5 py-3 align-middle whitespace-nowrap overflow-hidden">
                      <div className="font-semibold text-slate-800 text-xs truncate" title={adm.batch || 'General Cohort'}>
                        {adm.batch || 'General Cohort'}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                        {adm.trainer && adm.trainer !== 'Unassigned' && (
                          <span className="text-[9px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold border border-indigo-200 inline-block truncate max-w-full">
                            Trainer: {adm.trainer}
                          </span>
                        )}
                        {adm.duration && (
                          <span className="text-[10px] text-slate-400">
                            • {adm.duration}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Total Fee */}
                    <td className="px-3 py-3 align-middle whitespace-nowrap overflow-hidden font-semibold text-slate-900 text-xs">
                      ₹{Number(adm.totalCourseFee ?? adm.total_course_fee ?? 0).toLocaleString()}
                    </td>

                    {/* 6. Paid Fee */}
                    <td className="px-3 py-3 align-middle whitespace-nowrap overflow-hidden font-bold text-emerald-700 text-xs">
                      ₹{Number(adm.admissionFeePaid ?? adm.admission_fee_paid ?? 0).toLocaleString()}
                    </td>

                    {/* 7. Balance Due */}
                    {/* <td className="px-3 py-3 align-middle whitespace-nowrap overflow-hidden font-bold text-xs">
                      <span className={Number(adm.feeDue ?? adm.fee_due ?? 0) > 0 ? 'text-amber-700' : 'text-slate-600'}>
                        ₹{Number(adm.feeDue ?? adm.fee_due ?? 0).toLocaleString()}
                      </span>
                    </td> */}

                    {/* 8. Stage Status */}
                    <td className="px-3 py-3 align-middle whitespace-nowrap overflow-hidden">
                      <select
                        value={adm.status || 'Admission Confirmed'}
                        onChange={(e) => onUpdateAdmissionStatus(adm.id, e.target.value)}
                        className="text-[10px] font-semibold bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 shadow-2xs hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer w-full max-w-[130px] truncate"
                      >
                        {pipelineStages.map(s => (
                          <option key={s.id} value={s.id}>{s.id}</option>
                        ))}
                      </select>
                    </td>

                    {/* 9. Actions */}
                    <td className="px-3.5 py-3 align-middle text-right whitespace-nowrap overflow-hidden">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => onOpenConfirmationLetter(adm)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                          title="View Official Admission Letter & Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Letter</span>
                        </button>
                        <button
                          onClick={() => openWhatsApp(adm)}
                          className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                          title="Send WhatsApp Confirmation"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAdmissionToDelete(adm)}
                          className="p-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                          title="Delete Admission Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {admissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Admission Record</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to delete the admission record for{' '}
                <strong className="text-slate-800">{admissionToDelete.studentName || admissionToDelete.student_name}</strong>{' '}
                (<span className="font-mono text-indigo-600 font-semibold">{admissionToDelete.admissionNo || admissionToDelete.admission_no}</span>)?
                This will remove the admission record from the CRM.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAdmissionToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteAdmission) {
                      onDeleteAdmission(admissionToDelete.id || admissionToDelete.admissionNo || admissionToDelete.admission_no);
                    }
                    setAdmissionToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

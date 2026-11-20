import React, { useState } from 'react';
import { GraduationCap, Search, Phone, Mail, CreditCard, ShieldCheck, QrCode } from 'lucide-react';

export default function StudentsModule({ students, onOpenStudentID, onOpenPayment }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [feeFilter, setFeeFilter] = useState('All');

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.admissionNo && s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          s.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.phone.includes(searchQuery);
    const matchesFee = feeFilter === 'All' || s.feeStatus === feeFilter;
    return matchesSearch && matchesFee;
  });

  const getFeeBadge = (status, due) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Paid in Full</span>;
      case 'Partial':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Due: ₹{due.toLocaleString()}</span>;
      case 'Overdue':
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Overdue: ₹{due.toLocaleString()}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Students Directory
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {students.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official student directory with admission numbers, roll IDs, batch allocations, guardian contacts, and fee status.
          </p>
        </div>

        <button
          onClick={onOpenPayment}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <CreditCard className="w-4 h-4" />
          <span>Record Fee Payment</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll ID, admission #, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Fee status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-semibold">Fee Status:</span>
          {['All', 'Paid', 'Partial', 'Overdue'].map(st => (
            <button
              key={st}
              onClick={() => setFeeFilter(st)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                feeFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student Name & ID</th>
                <th className="px-4 py-3">Admission #</th>
                <th className="px-4 py-3">Course & Batch</th>
                <th className="px-4 py-3">Guardian Contact</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Fee Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                    <div className="text-[11px] text-indigo-700 font-mono font-semibold">
                      {student.studentId}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                    {student.admissionNo || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{student.course}</div>
                    <div className="text-[11px] text-slate-500">{student.batch}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700">{student.guardian}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {student.guardianPhone}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900">
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getFeeBadge(student.feeStatus, student.feeDue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onOpenStudentID(student)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold transition-colors"
                    >
                      <QrCode className="w-3 h-3 text-slate-600" />
                      <span>ID Pass</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

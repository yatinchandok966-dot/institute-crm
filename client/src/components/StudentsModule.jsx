import React, { useState } from 'react';
import { GraduationCap, Search, Mail, CreditCard, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';


export default function StudentsModule({
  students = [],
  onOpenPayment,
  onOpenStudentProfile, // Change By Deepak 
  onEditStudent,
  onDeleteStudent,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [feeFilter, setFeeFilter] = useState("All");
  const [studentToDelete, setStudentToDelete] = useState(null);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.studentId &&
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.admissionNo &&
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.course &&
        s.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.phone && s.phone.includes(searchQuery));
    const matchesFee = feeFilter === "All" || s.feeStatus === feeFilter;
    return matchesSearch && matchesFee;
  });

  const getFeeBadge = (status, due = 0) => {
    switch (status) {
      case "Paid":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Paid in Full
          </span>
        );
      case "Partial":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            Due: ₹{Number(due).toLocaleString()}
          </span>
        );
      case "Overdue":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
            Overdue: ₹{Number(due).toLocaleString()}
          </span>
        );
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
            Official student directory with admission numbers, roll IDs, batch
            allocations, guardian contacts, and fee status.
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
          {["All", "Paid", "Partial", "Overdue"].map((st) => (
            <button
              key={st}
              onClick={() => setFeeFilter(st)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                feeFilter === st ?
                  "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
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
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Total Fee</th>
                <th className="px-4 py-3">Fee Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>


            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ?
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">
                      No students enrolled yet
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Students will appear here once admitted from the
                      Admissions Pipeline
                    </p>
                  </td>
                </tr>
              : filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onOpenStudentProfile && onOpenStudentProfile(student)}
                        className="font-bold text-slate-900 text-sm hover:text-indigo-600 hover:underline text-left transition-colors cursor-pointer"
                      >
                        {student.name}
                      </button>
                      <div className="text-[11px] text-indigo-700 font-mono font-semibold">
                        {student.studentId}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {student.admissionNo || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">
                        {student.course}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {student.batch}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={student.email || ''}>
                          {student.email || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">
                        ₹{Number(student.feeTotal || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getFeeBadge(student.feeStatus, student.feeDue)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditStudent ? onEditStudent(student) : (onOpenStudentProfile && onOpenStudentProfile(student))}
                          className="p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-colors cursor-pointer"
                          title="Edit Student Details"
                          aria-label="Edit Student Details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title="Delete Student"
                          aria-label="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>

            
          </table>


        </div>
      </div>

      {/* Delete Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Delete Student Record</h3>
              </div>
              <button
                onClick={() => setStudentToDelete(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-slate-700">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-slate-900">{studentToDelete.name}</span>{' '}
                <span className="font-mono text-xs text-slate-500">({studentToDelete.studentId})</span>?
              </p>
              <p className="text-xs text-slate-500">
                This will remove the student and their enrollment records from the database. This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteStudent) onDeleteStudent(studentToDelete);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

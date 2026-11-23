// FeesModule.jsx

import React, { useState } from 'react';
import { CreditCard, Search, Plus, Printer, AlertCircle } from 'lucide-react';

export default function FeesModule({ feeTransactions, stats, students, onOpenPayment, onOpenReceipt }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Overdue Students Logic
  const overdueStudents = students.filter(s => {
    const hasOverdueInstallment = s.installments && s.installments.some(
      i => i.status === 'Pending' && new Date(i.dueDate) < new Date()
    );
    return (s.feeStatus === 'Overdue' || hasOverdueInstallment) && s.feeDue > 0;
  });

  // Remove duplicates (just in case)
  const uniqueOverdueStudents = Array.from(new Map(overdueStudents.map(s => [s.studentId, s])).values());

  // FIX: Added (tx.studentName || '') to prevent crash if undefined
  // Student-wise fee records with complete payment history
const studentFeeRows = students
  .map(student => {
    const payments = feeTransactions.filter(tx =>
      (student.studentId && tx.studentId &&
        student.studentId.toLowerCase() === tx.studentId.toLowerCase()) ||
      (student.name && tx.studentName &&
        student.name.toLowerCase() === tx.studentName.toLowerCase())
    );

    return {
      student,
      payments,
      totalPaid: Number(student.feePaid ?? 0),
      remaining: Number(student.feeDue ?? 0),
      totalFees: Number(student.feeTotal ?? 0)
    };
  })
  .filter(row => row.payments.length > 0)
  .filter(row =>
    row.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.student.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Fees & Invoicing
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border">₹{stats.monthlyRevenue.toLocaleString()} Collected</span>
          </h1>
        </div>
        <button onClick={onOpenPayment} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {/* Overdue Alerts Section */}
      {uniqueOverdueStudents.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="w-full">
            <h4 className="font-bold text-rose-800 text-sm">Overdue Fee Alerts ({uniqueOverdueStudents.length} Students)</h4>
            <p className="text-xs text-rose-600 mt-1 mb-3">
              Some students have pending installments past their due date. Please follow up.
            </p>
            <div className="flex flex-wrap gap-2">
              {uniqueOverdueStudents.map(s => (
                 <div key={s.id} className="text-[11px] bg-white border border-rose-200 px-3 py-1.5 rounded-md text-rose-700 font-bold flex items-center gap-3 shadow-xs">
                   <span className="text-slate-800">{s.name}</span>
                   <span className="text-slate-500 font-medium border-l border-slate-200 pl-3">Total: ₹{s.feeTotal?.toLocaleString() || 0}</span>
                   <span className="text-emerald-600 font-medium border-l border-slate-200 pl-3">Paid: ₹{s.feePaid?.toLocaleString() || 0}</span>
                   <span className="text-rose-600 border-l border-slate-200 pl-3">Due: ₹{s.feeDue?.toLocaleString() || 0}</span>
                 </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Collected Revenue</span>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{stats.monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Pending Installments</span>
          <p className="text-2xl font-black text-amber-600 mt-1">₹{stats.pendingFees.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Collection Efficiency</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">{stats.feeCollectionRate}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-xs overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
           <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search receipts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs" />
          </div>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b">
            <tr>
              {/* <th className="px-4 py-3">Receipt #</th> */}
              {/* <th className="px-4 py-3">Student</th> */}
              {/* <th className="px-4 py-3">Amount Details</th> */}
              {/* <th className="px-4 py-3">Mode & TXN ID</th> */}
              {/* <th className="px-4 py-3">Mode</th> */}
              {/* <th className="px-4 py-3">Date</th> */}
              {/* <th className="px-4 py-3 text-right">Action</th> */}
            </tr>
            <tr>
  <th className="px-4 py-3">Student</th>
  <th className="px-4 py-3">Total Paid Fees</th>
  <th className="px-4 py-3">Remaining Amount</th>
  <th className="px-4 py-3">Total Fees</th>
  <th className="px-4 py-3 text-right">Action</th>
</tr>
          </thead>
          <tbody className="divide-y">
  {studentFeeRows.map(({ student, payments, totalPaid, remaining, totalFees }) => (
    <tr key={student.studentId || student.id} className="hover:bg-slate-50">

      {/* Student */}
      <td className="px-4 py-4 font-bold text-slate-800">
        {student.name}
        <div className="text-[10px] text-slate-400 font-medium mt-1">
          {student.studentId}
        </div>
      </td>

      {/* Total Paid Fees */}
      <td className="px-4 py-4 font-bold text-emerald-600">
        ₹{totalPaid.toLocaleString('en-IN')}
      </td>

      {/* Remaining Amount */}
      <td className="px-4 py-4 font-bold text-rose-600">
        ₹{remaining.toLocaleString('en-IN')}
      </td>

      {/* Total Fees */}
      <td className="px-4 py-4 font-bold text-slate-800">
        ₹{totalFees.toLocaleString('en-IN')}
      </td>

      {/* Action */}
      <td className="px-4 py-4 text-right">
        <button
          onClick={() => onOpenReceipt({ student, transactions: payments })}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Statement
        </button>
      </td>

    </tr>
  ))}

  {studentFeeRows.length === 0 && (
    <tr>
      <td colSpan="5" className="text-center py-8 text-slate-400">
        No fee records found.
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
    </div>
  );
}
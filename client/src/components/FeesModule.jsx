// FeesModule.jsx

import React, { useState } from 'react';
import { CreditCard, Search, Plus, Printer, AlertCircle, Eye, X, FileText, CheckCircle2 } from 'lucide-react';

export default function FeesModule({ feeTransactions, stats, students, onOpenPayment, onOpenReceipt }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState(null);

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

    // Calculate fallback if database fee values are missing
    const calculatedPaid = Number(student.feePaid ?? 0) || payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const calculatedTotal = Number(student.feeTotal ?? 0);
    const calculatedDue = Math.max(0, calculatedTotal - calculatedPaid);

    return {
      student,
      payments,
      totalPaid: calculatedPaid,
      remaining: Number(student.feeDue ?? calculatedDue),
      totalFees: calculatedTotal
    };
  })
  
  .filter(row => row.totalFees > 0 || row.totalPaid > 0 || row.payments.length > 0)
  .filter(row =>
    (row.student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {studentFeeRows.map(({ student, payments, totalPaid, remaining, totalFees }) => (
              <tr key={student.studentId || student.id} className="hover:bg-slate-50 transition-colors">

                {/* Student */}
                <td className="px-4 py-4 font-bold text-slate-800">
                  {student.name}
                  <div className="text-[10px] text-slate-400 font-medium mt-1 font-mono">
                    {student.studentId}
                  </div>
                </td>

                {/* Total Paid Fees */}
                <td className="px-4 py-4 font-bold text-emerald-600 font-mono">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </td>

                {/* Remaining Amount */}
                <td className="px-4 py-4 font-bold font-mono">
                  <span className={remaining > 0 ? 'text-rose-600' : 'text-slate-500'}>
                    ₹{remaining.toLocaleString('en-IN')}
                  </span>
                </td>

                {/* Total Fees */}
                <td className="px-4 py-4 font-bold text-slate-800 font-mono">
                  ₹{totalFees.toLocaleString('en-IN')}
                </td>

                {/* Action */}
                <td className="px-4 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5 justify-end">
                    <button
                      type="button"
                      // onClick={() => setSelectedStudentForDetails({ student, payments, totalPaid, remaining, totalFees })}
                      onClick={() => onOpenReceipt({ student, transactions: payments })}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                      title="View Complete Fee Breakdown & Payment Details"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View</span>
                    </button>
                    {/* <button
                      type="button"
                      onClick={() => onOpenReceipt({ student, transactions: payments })}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                      title="Print Official Statement / Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Statement</span>
                    </button> */}
                  </div>
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

      {/* Student Fee Details Modal */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-2xs">
                  {(selectedStudentForDetails.student.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base leading-tight">
                      {selectedStudentForDetails.student.name}
                    </h3>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedStudentForDetails.student.studentId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedStudentForDetails.student.course || 'Academic Program'} • Batch: {selectedStudentForDetails.student.batch || 'General Cohort'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
              {/* Fee Financial Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Tuition Fee</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block font-mono">
                    ₹{selectedStudentForDetails.totalFees.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Total Paid Fee</span>
                  <span className="text-base font-black text-emerald-700 mt-0.5 block font-mono">
                    ₹{selectedStudentForDetails.totalPaid.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Remaining Due</span>
                  <span className="text-base font-black text-rose-700 mt-0.5 block font-mono">
                    ₹{selectedStudentForDetails.remaining.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Contact & Student Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">Contact Number</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedStudentForDetails.student.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Email Address</span>
                  <span className="font-semibold text-slate-800 truncate block">{selectedStudentForDetails.student.email || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Fee Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                    selectedStudentForDetails.remaining === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedStudentForDetails.remaining === 0 ? 'Fully Paid' : 'Installment Due'}
                  </span>
                </div>
              </div>

              {/* Transactions History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Payment Transactions ({selectedStudentForDetails.payments.length})
                  </h4>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5">Receipt #</th>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">Mode</th>
                        <th className="px-3.5 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                        {selectedStudentForDetails.payments.length === 0 ? (
                        selectedStudentForDetails.totalPaid > 0 ? (
                          <tr className="hover:bg-slate-50/80">
                            <td className="px-3.5 py-2.5 font-mono font-bold text-indigo-700">
                              RCP-ADM-01
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">
                              {new Date().toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-3 py-2.5 text-slate-700 font-medium">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                                Admission Payment
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-black text-emerald-700 font-mono">
                              ₹{selectedStudentForDetails.totalPaid.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-6 text-center text-slate-400">
                              No payment transactions recorded for this student.
                            </td>
                          </tr>
                        )
                      ) : (
                        selectedStudentForDetails.payments.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-slate-50/80">
                            <td className="px-3.5 py-2.5 font-mono font-bold text-indigo-700">
                              {p.receiptNo || `RCP-${idx + 1}`}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">
                              {p.date ? new Date(p.date).toLocaleDateString('en-IN') : '-'}
                            </td>
                            <td className="px-3 py-2.5 text-slate-700 font-medium">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                                {p.mode || 'UPI / Bank'}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-black text-emerald-700 font-mono">
                              ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStudentForDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const details = selectedStudentForDetails;
                  setSelectedStudentForDetails(null);
                  onOpenReceipt({ student: details.student, transactions: details.payments });
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
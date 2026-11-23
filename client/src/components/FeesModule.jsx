//FeesModule.jsx

import React, { useState } from 'react';
import { CreditCard, Search, Plus, Printer, AlertCircle } from 'lucide-react';

export default function FeesModule({ feeTransactions, stats, students, onOpenPayment, onOpenReceipt }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Overdue Students Logic
  const overdueStudents = students.filter(s => s.feeStatus === 'Overdue' || (s.installments && s.installments.some(i => i.status === 'Pending' && new Date(i.dueDate) < new Date())));

  const filteredTransactions = feeTransactions.filter(tx => 
    tx.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tx.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Overdue Alerts (NEW) */}
      {overdueStudents.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-800 text-sm">Overdue Fee Alerts ({overdueStudents.length} Students)</h4>
            <p className="text-xs text-rose-600 mt-1">
              Some students have pending installments past their due date. Please follow up.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {overdueStudents.map(s => (
                 <span key={s.id} className="text-[10px] bg-white border border-rose-200 px-2 py-1 rounded text-rose-700 font-bold">{s.name} (₹{s.feeDue})</span>
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
              <th className="px-4 py-3">Receipt #</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Mode & TXN ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTransactions.map(tx => (
              <tr key={tx.receiptNo} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-bold text-indigo-700">{tx.receiptNo}</td>
                <td className="px-4 py-3 font-bold">{tx.studentName}<br/><span className="text-[10px] text-slate-400 font-mono">{tx.studentId}</span></td>
                <td className="px-4 py-3 font-black text-sm">₹{Number(tx.amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold block w-max">{tx.mode}</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">TXN: {tx.transactionId || 'N/A'}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{tx.date}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onOpenReceipt(tx)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 ml-auto">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
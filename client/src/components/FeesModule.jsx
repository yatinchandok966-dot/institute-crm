import React, { useState } from 'react';
import { CreditCard, Search, Plus, Printer, CheckCircle2 } from 'lucide-react';

export default function FeesModule({ feeTransactions, stats, onOpenPayment, onOpenReceipt }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = feeTransactions.filter(tx => {
    return tx.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           tx.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
           tx.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
           tx.mode.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Fees & Invoicing
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              ₹{(stats.monthlyRevenue || 642000).toLocaleString()} Collected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track student tuition installments, record payments, and print official fee payment receipts.
          </p>
        </div>

        <button
          onClick={onOpenPayment}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Fee Payment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Revenue Collected</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              ₹{(stats.monthlyRevenue || 642000).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tuition fee installments & admissions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Pending Installments Due</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              ₹{(stats.pendingFees || 128500).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Outstanding installment balance</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Collection Efficiency</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700">
              {stats.feeCollectionRate || '83.3%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">On target for the billing cycle</p>
        </div>
      </div>

      {/* Transactions Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by receipt #, student name, mode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="text-slate-500 font-medium text-[11px]">
          {filteredTransactions.length} Payment Receipts
        </span>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Amount Paid</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.map(tx => (
                <tr key={tx.receiptNo} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">
                    {tx.receiptNo}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{tx.studentName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{tx.studentId}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {tx.course}
                  </td>
                  <td className="px-4 py-3 font-black text-slate-900 text-sm">
                    ₹{Number(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {tx.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {tx.date}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onOpenReceipt(tx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
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

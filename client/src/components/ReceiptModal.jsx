import React from 'react';
import { X, Printer, CheckCircle2, School } from 'lucide-react';

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm text-white">Fee Payment Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Body */}
        <div className="p-6 md:p-8 space-y-6 text-slate-800 bg-white printable-area text-xs">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-indigo-700">EduPulse</span>
                <span className="text-xl font-bold text-slate-900">Academy</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Institute for Professional Engineering & Technology
              </p>
              <p className="text-slate-400 text-[10px] mt-1">
                Central Campus • GSTIN: 27AABCE1234F1Z8 • contact@edupulse.org
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAID
              </span>
              <p className="font-mono font-bold text-slate-900 text-xs mt-2">
                {receipt.receiptNo}
              </p>
              <p className="text-slate-500 text-[11px]">
                {receipt.date}
              </p>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Student Name</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{receipt.studentName}</p>
              <p className="text-slate-500 font-mono text-[11px]">ID: {receipt.studentId}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Course Program</span>
              <p className="font-semibold text-slate-800 mt-0.5 leading-snug">{receipt.course}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-center">Payment Mode</th>
                <th className="py-2 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 text-slate-900">
                  Tuition Fee / Installment Receipt
                </td>
                <td className="py-3 text-center text-slate-600">
                  {receipt.mode}
                </td>
                <td className="py-3 text-right font-bold text-slate-900">
                  ₹{Number(receipt.amount).toLocaleString()}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300">
                <td colSpan="2" className="py-3 font-bold text-slate-900 text-right pr-4">
                  Total Received:
                </td>
                <td className="py-3 text-right font-black text-indigo-700 text-base">
                  ₹{Number(receipt.amount).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer & Signature */}
          <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
            <div>
              <p>Authorized by: <strong>{receipt.collectedBy || 'Finance Desk'}</strong></p>
              <p className="text-[10px] text-slate-400 mt-0.5">Computer generated receipt • Official record</p>
            </div>
            <div className="text-right">
              <div className="w-24 border-b border-slate-400 mb-1"></div>
              <span className="text-[10px] text-slate-400">Accounts Office</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

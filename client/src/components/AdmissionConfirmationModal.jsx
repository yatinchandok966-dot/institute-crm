import React, { useState } from 'react';
import { X, CheckCircle2, Printer, MessageSquare, Copy, School, Download, ShieldCheck } from 'lucide-react';

export default function AdmissionConfirmationModal({ admission, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!admission) return null;

  const confirmationMessage = `🎉 Admission Confirmed! Welcome to EduPulse Academy, ${admission.studentName}.

Your Admission Details:
• Admission No: ${admission.admissionNo}
• Application No: ${admission.applicationNo}
• Course: ${admission.course}
• Allotted Batch: ${admission.batch}
• Duration: ${admission.duration}
• Admission Fee Paid: ₹${Number(admission.admissionFeePaid).toLocaleString()}
• Remaining Balance: ₹${Number(admission.feeDue).toLocaleString()}
• Payment Plan: ${admission.paymentPlan}

Your seat is officially reserved. Please bring your ID documents on Day 1.
Counselor: ${admission.counselor}

Welcome to EduPulse Academy!`;

  const handleWhatsApp = () => {
    const cleanPhone = admission.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(confirmationMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(confirmationMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">Admission Confirmation & Student Letter</h3>
              <p className="text-[11px] text-emerald-100">Official proof of admission and student enrollment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-emerald-100 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Letter Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-slate-800 printable-area">
          {/* Header of Letter */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-indigo-700">EduPulse</span>
                <span className="text-xl font-bold text-slate-900">Academy</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">Institute for Professional Engineering & Technology</p>
              <p className="text-slate-400 text-[10px] mt-1">Main Campus HQ • contact@edupulse.org • +91 98223 11445</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" /> CONFIRMED
              </span>
              <p className="font-mono font-bold text-slate-900 text-xs mt-1.5">
                {admission.admissionNo}
              </p>
              <p className="text-slate-500 text-[10px]">
                Date: {admission.admissionDate ? String(admission.admissionDate).split('T')[0] : 'N/A'}
              </p>
            </div>
          </div>

          {/* Student & Course Details Table */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500">Student Information</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{admission.studentName}</p>
              <p className="text-slate-600 mt-0.5">Phone: {admission.phone}</p>
              <p className="text-slate-600">Email: {admission.email || 'N/A'}</p>
              {admission.guardianName && (
                <p className="text-slate-500 text-[11px] mt-1">Guardian: {admission.guardianName}</p>
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500">Program & Cohort</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{admission.course}</p>
              <p className="text-slate-600 mt-0.5">Batch: {admission.batch}</p>
              <p className="text-slate-600">Duration: {admission.duration}</p>
              {admission.trainer && admission.trainer !== 'Unassigned' && (
                <p className="text-emerald-700 font-semibold mt-0.5">Faculty Trainer: {admission.trainer}</p>
              )}
              <p className="text-indigo-700 font-semibold mt-1">Application #: {admission.applicationNo}</p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Fee & Payment Plan Summary
            </h4>
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 text-left">Fee Head</th>
                  <th className="py-2 px-3 text-center">Payment Plan</th>
                  <th className="py-2 px-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="py-2.5 px-3">Total Program Tuition Fee</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{admission.paymentPlan}</td>
                  <td className="py-2.5 px-3 text-right font-bold">₹{Number(admission.totalCourseFee).toLocaleString()}</td>
                </tr>
                {admission.discount > 0 && (
                  <tr className="text-emerald-700 bg-emerald-50/50">
                    <td className="py-2 px-3">Scholarship / Fee Concession</td>
                    <td className="py-2 px-3 text-center text-xs">{admission.discountReason || 'Merit / Early Bird'}</td>
                    <td className="py-2 px-3 text-right font-bold">-₹{Number(admission.discount).toLocaleString()}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Net Course Fee Payable</td>
                  <td className="py-2.5 px-3 text-center">—</td>
                  <td className="py-2.5 px-3 text-right font-bold">₹{Number(admission.netFee || admission.totalCourseFee).toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-emerald-800">Admission Fee Paid</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-emerald-800">Seat Confirmed</td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-800 text-sm">₹{Number(admission.admissionFeePaid).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-600">Pending Installment Due</td>
                  <td className="py-2 px-3 text-center text-slate-500">Per Payment Schedule</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800">₹{Number(admission.feeDue).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Admission Confirmation Message Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Admission Confirmation Message (Ready to Send)
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 font-mono bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
              {confirmationMessage}
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
            <div>
              <p>Admissions Counselor: <strong>{admission.counselor}</strong></p>
              <p className="text-[10px] text-slate-400 mt-0.5">EduPulse Academy Central Admissions Office</p>
            </div>
            <div className="text-right">
              <div className="w-24 border-b border-slate-400 mb-1"></div>
              <span className="text-[10px] text-slate-400">Authorized Signatory</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Letter</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Confirmation on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

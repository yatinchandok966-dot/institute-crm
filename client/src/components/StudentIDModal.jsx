import React from 'react';
import { X, Printer, ShieldCheck, School, QrCode } from 'lucide-react';

export default function StudentIDModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-xs text-white">Student Identity Card</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Professional ID Pass */}
        <div className="p-6 flex flex-col items-center bg-slate-50">
          <div className="w-full bg-white text-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 relative overflow-hidden">
            {/* Top Stripe */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">
                  EP
                </div>
                <div>
                  <h4 className="font-bold text-xs tracking-tight">EduPulse Academy</h4>
                  <p className="text-[9px] text-slate-500">Official Student Pass</p>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            {/* Student Name & Roll */}
            <div className="mt-4 text-center">
              <h3 className="font-black text-base text-slate-900">{student.name}</h3>
              <p className="text-[11px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded inline-block mt-1 border border-indigo-200">
                {student.studentId}
              </p>
              {student.admissionNo && (
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Admission: {student.admissionNo}
                </p>
              )}
            </div>

            {/* Program Details */}
            <div className="mt-4 space-y-2 text-left bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Course:</span>
                <p className="font-semibold text-slate-800 truncate">{student.course}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Batch:</span>
                <p className="font-medium text-slate-700 truncate">{student.batch}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Enrolled:</span>
                  <p className="font-medium text-slate-700">{student.enrollmentDate}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Status:</span>
                  <p className="font-bold text-emerald-700">{student.status}</p>
                </div>
              </div>
            </div>

            {/* QR Barcode Section */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
              <p className="font-mono">VALID SESSION: 2026-2027</p>
              <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center border border-slate-200">
                <QrCode className="w-5 h-5 text-slate-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
}

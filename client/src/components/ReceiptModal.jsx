
import React from 'react';
import { X, Printer, CheckCircle2, School } from 'lucide-react';

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  // Student and payment history
  const student = receipt.student || receipt;
  const payments = receipt.transactions || [receipt];

  const totalFees = Number(student.feeTotal || 0);

  const totalPaid = Number(
    student.feePaid ??
    payments.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  );

  const remainingAmount = Number(
    student.feeDue ?? Math.max(0, totalFees - totalPaid)
  );

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">

      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm">
              Student Fee Statement
            </span>
          </div>

          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-6 md:p-8 space-y-6 text-slate-800 bg-white printable-area text-xs overflow-y-auto">

          {/* Institute Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-indigo-700">
                  EduPulse
                </span>
                <span className="text-xl font-bold text-slate-900">
                  Academy
                </span>
              </div>

              <p className="text-slate-500 text-[11px] mt-1">
                Institute for Professional Engineering & Technology
              </p>

              <p className="text-slate-400 text-[10px] mt-1">
                Central Campus • Official Fee Statement
              </p>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                FEE LEDGER
              </span>

              <p className="font-semibold text-slate-800 mt-2">
                Statement Date
              </p>

              <p className="text-slate-500">
                {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>

          </div>

          {/* Student Information */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">

            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Student Name
              </span>

              <p className="font-bold text-slate-900 text-sm mt-1">
                {student.name || student.studentName}
              </p>

              <p className="text-slate-500 font-mono mt-1">
                ID: {student.studentId || 'N/A'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Course Program
              </span>

              <p className="font-semibold text-slate-800 mt-1">
                {student.course || payments[0]?.course || 'N/A'}
              </p>
            </div>

          </div>

          {/* Fee Summary */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">
              Fee Summary
            </h3>

            <div className="grid grid-cols-3 gap-3">

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <p className="text-[10px] text-slate-500 font-semibold">
                  TOTAL FEES
                </p>

                <p className="text-base font-black text-slate-900 mt-1">
                  ₹{formatAmount(totalFees)}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                <p className="text-[10px] text-emerald-700 font-semibold">
                  TOTAL PAID
                </p>

                <p className="text-base font-black text-emerald-700 mt-1">
                  ₹{formatAmount(totalPaid)}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50">
                <p className="text-[10px] text-rose-700 font-semibold">
                  REMAINING
                </p>

                <p className="text-base font-black text-rose-700 mt-1">
                  ₹{formatAmount(remainingAmount)}
                </p>
              </div>

            </div>
          </div>

          {/* Payment History */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">
              Complete Payment History
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">

              <table className="w-full text-xs">

                <thead className="bg-slate-50">
                  <tr className="text-slate-500 uppercase text-[10px] border-b">
                    <th className="px-3 py-3 text-left">Date</th>
                    <th className="px-3 py-3 text-left">Receipt No.</th>
                    <th className="px-3 py-3 text-left">Payment Mode</th>
                    <th className="px-3 py-3 text-left">Transaction ID</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {payments.map((tx, index) => (
                    <tr key={tx.id || tx.receiptNo || index}>

                      <td className="px-3 py-3 text-slate-600">
                        {tx.date
                          ? new Date(tx.date).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </td>

                      <td className="px-3 py-3 font-mono text-slate-600">
                        {tx.receiptNo || 'N/A'}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {tx.mode || 'N/A'}
                      </td>

                      <td className="px-3 py-3 font-mono text-slate-500">
                        {tx.transactionId || 'N/A'}
                      </td>

                      <td className="px-3 py-3 text-right font-bold text-slate-900">
                        ₹{formatAmount(tx.amount)}
                      </td>

                    </tr>
                  ))}

                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-3 py-6 text-center text-slate-400">
                        No payment history available.
                      </td>
                    </tr>
                  )}

                </tbody>

                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-slate-50">
                    <td colSpan="4" className="px-3 py-3 text-right font-bold">
                      Total Received:
                    </td>

                    <td className="px-3 py-3 text-right font-black text-emerald-700">
                      ₹{formatAmount(totalPaid)}
                    </td>
                  </tr>
                </tfoot>

              </table>
            </div>
          </div>

          {/* Outstanding Amount */}
          {/* <div className="p-4 border border-rose-200 bg-rose-50 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold text-rose-800">
                Outstanding Fee Balance
              </p>

              <p className="text-[10px] text-rose-600 mt-1">
                Amount remaining to be paid by the student
              </p>
            </div>

            <p className="text-xl font-black text-rose-700">
              ₹{formatAmount(remainingAmount)}
            </p>
          </div> */}

          {/* Footer */}
          <div className="pt-5 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">

            <div>
              <p>
                Authorized by: <strong>Finance Desk</strong>
              </p>

              <p className="text-[10px] text-slate-400 mt-1">
                Computer generated fee statement
              </p>
            </div>

            <div className="text-right">
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span className="text-[10px] text-slate-400">
                Accounts Office
              </span>
            </div>

          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            Close
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
          >
            <Printer className="w-4 h-4" />
            Print Statement
          </button>

        </div>

      </div>
    </div>
  );
}

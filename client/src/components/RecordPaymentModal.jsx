//RecordPaymentModal

import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';

export default function RecordPaymentModal({ isOpen, onClose, onPaymentRecorded, students }) {
  const [studentId, setStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI (Google Pay / PhonePe)');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStudentSelect = (e) => {
    const sId = e.target.value;
    setStudentId(sId);
    const found = students.find(s => s.studentId === sId);
    if (found) {
      setSelectedStudent(found);
      // Auto-fill next installment amount if exists
      if (found.installments) {
        const nextPending = found.installments.find(inst => inst.status === 'Pending');
        setAmount(nextPending ? nextPending.amount : found.feeDue);
      } else {
        setAmount(found.feeDue);
      }
    } else {
      setSelectedStudent(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setIsSubmitting(true);
    const paymentData = {
      studentName: selectedStudent.name,
      studentId: selectedStudent.studentId,
      course: selectedStudent.course,
      amount: Number(amount),
      mode: paymentMode,
      transactionId: transactionId || `TXN-${Date.now()}`
    };

    // API call logic (same as yours)
    onPaymentRecorded({
      receiptNo: `RCP-2026-0${Math.floor(100 + Math.random() * 900)}`,
      ...paymentData,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      collectedBy: 'Finance Desk',
      status: 'Success'
    });
    
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full border shadow-2xl">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center rounded-t-xl">
          <h3 className="font-bold text-sm flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-400"/> Record Fee Payment</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Student *</label>
            <select required value={studentId} onChange={handleStudentSelect} className="w-full px-3 py-2 border rounded-lg font-medium">
              <option value="">-- Choose Student --</option>
              {students.map(s => <option key={s.id} value={s.studentId}>{s.name} ({s.studentId}) — Due: ₹{s.feeDue}</option>)}
            </select>
          </div>

          {selectedStudent && selectedStudent.installments && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <h4 className="font-bold text-indigo-800 mb-2">Installment Plan Status:</h4>
              {selectedStudent.installments.map((inst, i) => (
                <div key={i} className="flex justify-between text-[11px] mb-1">
                  <span>Inst {i+1} (Due: {inst.dueDate})</span>
                  <span className={inst.status === 'Paid' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>₹{inst.amount} - {inst.status}</span>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1">Amount Received (INR) *</label>
            <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg font-bold text-sm" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Payment Method *</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="UPI (Google Pay / PhonePe)">UPI (GPay/PhonePe)</option>
              <option value="Netbanking (NEFT / IMPS)">Netbanking</option>
              <option value="Credit / Debit Card">Card</option>
              <option value="Cash Receipt">Cash</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Transaction ID / UTR *</label>
            <input type="text" required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter UTR or TXN ID" className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div className="pt-3 border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Save & Issue Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
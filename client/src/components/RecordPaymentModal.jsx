//RecordPaymentModal

import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, Search } from 'lucide-react';

export default function RecordPaymentModal({ isOpen, onClose, onPaymentRecorded, students }) {
  const [studentId, setStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI (Google Pay / PhonePe)');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStudentSelect = (student) => {
  setStudentId(student.studentId);
  setSelectedStudent(student);

  setStudentSearch(
    `${student.name} (${student.studentId})`
  );

  setIsStudentDropdownOpen(false);

  // Auto-fill pending amount
  if (student.installments) {
    const nextPending = student.installments.find(
      inst => inst.status === 'Pending'
    );

    setAmount(nextPending ? nextPending.amount : student.feeDue);
  } else {
    setAmount(student.feeDue);
  }
};

const filteredStudents = students.filter(student => {
  const query = studentSearch.toLowerCase().trim();

  return (
    (student.name || '').toLowerCase().includes(query) ||
    (student.studentId || '').toLowerCase().includes(query) ||
    (student.phone || '').toLowerCase().includes(query)
  );
});

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
          
<div className="relative">

  <label className="block font-semibold mb-1">
    Search & Select Student *
  </label>

  {/* Search Input */}
  <div className="relative">

    <input
      type="text"
      required
      value={studentSearch}
      placeholder="Search by student name, ID or phone..."
      onFocus={() => {
        if (selectedStudent) {
          setStudentSearch('');
          setStudentId('');
          setSelectedStudent(null);
          setAmount('');
        }
        setIsStudentDropdownOpen(true);
      }}
      onChange={(e) => {
        setStudentSearch(e.target.value);
        setStudentId('');
        setSelectedStudent(null);
        setAmount('');
        setIsStudentDropdownOpen(true);
      }}
      className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />

    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
      <Search className="w-4 h-4" />
    </span>

  </div>

  {/* Search Results Dropdown */}
  {isStudentDropdownOpen && (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">

      {filteredStudents.length > 0 ? (

        filteredStudents.map(student => (
          <button
            type="button"
            key={student.id}
            onClick={() => handleStudentSelect(student)}
            className="w-full px-3 py-3 text-left hover:bg-indigo-50 border-b border-slate-100 last:border-0 transition-colors"
          >

            <div className="flex justify-between items-center gap-2">

              <div>
                <p className="font-bold text-slate-800 text-xs">
                  {student.name}
                </p>

                <p className="text-[10px] text-slate-500 mt-1">
                  ID: {student.studentId}
                </p>

                <p className="text-[10px] text-slate-500">
                  {student.phone || 'No phone number'}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] text-slate-400">
                  Remaining Fee
                </p>

                <p className="font-bold text-rose-600 text-xs">
                  ₹{Number(student.feeDue || 0).toLocaleString('en-IN')}
                </p>
              </div>

            </div>

          </button>
        ))

      ) : (

        <div className="p-4 text-center text-xs text-slate-400">
          No students found.
        </div>

      )}

    </div>
  )}

  {/* Selected Student Confirmation */}
  {selectedStudent && !isStudentDropdownOpen && (
    <p className="text-[10px] text-emerald-600 font-semibold mt-2">
      ✓ Student selected successfully
    </p>
  )}

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
            <label className="block font-semibold mb-1">Transaction ID / UTR </label>
            <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter UTR or TXN ID" className="w-full px-3 py-2 border rounded-lg" />
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
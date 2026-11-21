import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, UserCheck, Calculator, ShieldCheck } from 'lucide-react';

export default function AdmissionModal({
  isOpen,
  onClose,
  leadToConvert,
  courses,
  batches,
  onAdmissionCreated
}) {
  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    email: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    course: '',
    batch: '',
    duration: '16 Weeks',
    admissionDate: new Date().toISOString().split('T')[0],
    totalCourseFee: 45000,
    discount: 0,
    discountReason: '',
    admissionFeePaid: 15000,
    paymentPlan: '2 Installments (50/50)',
    status: 'Admission Confirmed',
    counselor: 'Admissions Desk',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // When a lead is passed for conversion, pre-fill all student details
  useEffect(() => {
    if (leadToConvert) {
      const matchedCourse = courses.find(c => c.name === leadToConvert.course) || courses[0];
      const matchedBatch = batches.find(b => b.course === matchedCourse?.name) || batches[0];
      const fee = matchedCourse ? matchedCourse.fee : 45000;

      setFormData(prev => ({
        ...prev,
        leadId: leadToConvert.id,
        studentName: leadToConvert.name || '',
        phone: leadToConvert.phone || '',
        email: leadToConvert.email || '',
        course: matchedCourse ? matchedCourse.name : leadToConvert.course || '',
        batch: matchedBatch ? matchedBatch.name : '',
        duration: matchedCourse ? `${matchedCourse.durationWeeks} Weeks` : '16 Weeks',
        totalCourseFee: fee,
        discount: 0,
        admissionFeePaid: Math.round(fee * 0.3), // default 30% registration
        counselor: leadToConvert.counselor || 'Admissions Desk',
        notes: `Converted from lead. ${leadToConvert.notes || ''}`
      }));
    } else if (courses.length > 0) {
      const defaultCourse = courses[0];
      const defaultBatch = batches.find(b => b.course === defaultCourse.name) || batches[0];
      setFormData(prev => ({
        ...prev,
        course: defaultCourse.name,
        batch: defaultBatch ? defaultBatch.name : '',
        duration: `${defaultCourse.durationWeeks} Weeks`,
        totalCourseFee: defaultCourse.fee,
        admissionFeePaid: Math.round(defaultCourse.fee * 0.3)
      }));
    }
  }, [leadToConvert, courses, batches, isOpen]);

  if (!isOpen) return null;

  const handleCourseChange = (e) => {
    const courseName = e.target.value;
    const selectedCourse = courses.find(c => c.name === courseName);
    const matchedBatch = batches.find(b => b.course === courseName) || batches[0];
    const fee = selectedCourse ? selectedCourse.fee : 45000;

    setFormData(prev => ({
      ...prev,
      course: courseName,
      batch: matchedBatch ? matchedBatch.name : prev.batch,
      duration: selectedCourse ? `${selectedCourse.durationWeeks} Weeks` : prev.duration,
      totalCourseFee: fee,
      admissionFeePaid: Math.round(fee * 0.3)
    }));
  };

  const netPayable = Math.max(0, (Number(formData.totalCourseFee) || 0) - (Number(formData.discount) || 0));
  const remainingDue = Math.max(0, netPayable - (Number(formData.admissionFeePaid) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      netFee: netPayable,
      feeDue: remainingDue
    };

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.admission) {
        onAdmissionCreated(data.admission, data.student);
      } else {
        // Local fallback
        const nextSeq = Math.floor(100 + Math.random() * 900);
        const fallbackAdm = {
          id: Date.now(),
          admissionNo: `ADM-2026-0${nextSeq}`,
          applicationNo: `APP-2026-0${nextSeq + 20}`,
          ...payload
        };
        onAdmissionCreated(fallbackAdm, {
          id: Date.now() + 1,
          studentId: `STU-2026-0${nextSeq}`,
          admissionNo: fallbackAdm.admissionNo,
          name: payload.studentName,
          email: payload.email,
          phone: payload.phone,
          guardian: payload.guardianName,
          guardianPhone: payload.guardianPhone,
          course: payload.course,
          batch: payload.batch,
          enrollmentDate: payload.admissionDate,
          feeTotal: netPayable,
          feePaid: Number(payload.admissionFeePaid),
          feeDue: remainingDue,
          feeStatus: remainingDue === 0 ? 'Paid' : 'Partial',
          attendance: 100,
          status: 'Active'
        });
      }
      onClose();
    } catch {
      const nextSeq = Math.floor(100 + Math.random() * 900);
      const fallbackAdm = {
        id: Date.now(),
        admissionNo: `ADM-2026-0${nextSeq}`,
        applicationNo: `APP-2026-0${nextSeq + 20}`,
        ...payload
      };
      onAdmissionCreated(fallbackAdm, {
        id: Date.now() + 1,
        studentId: `STU-2026-0${nextSeq}`,
        admissionNo: fallbackAdm.admissionNo,
        name: payload.studentName,
        email: payload.email,
        phone: payload.phone,
        guardian: payload.guardianName,
        guardianPhone: payload.guardianPhone,
        course: payload.course,
        batch: payload.batch,
        enrollmentDate: payload.admissionDate,
        feeTotal: netPayable,
        feePaid: Number(payload.admissionFeePaid),
        feeDue: remainingDue,
        feeStatus: remainingDue === 0 ? 'Paid' : 'Partial',
        attendance: 100,
        status: 'Active'
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                {leadToConvert ? 'Convert Lead to Student Admission' : 'Register New Student Admission'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Auto-generates admission number and enrolls student without re-entering details
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section 1: Student Information */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>1. Student Personal Information</span>
              {leadToConvert && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  ✓ Pre-filled from Lead Pipeline
                </span>
              )}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / City / Pin Code"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  placeholder="e.g. Rajesh Sharma (Father)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guardian Phone Contact</label>
                <input
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Program & Batch Selection */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-200">
              2. Academic Program & Batch Allotment
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Selected Course Program *</label>
                <select
                  value={formData.course}
                  onChange={handleCourseChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allotted Batch / Cohort *</label>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.name}>{b.name} ({b.timing})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Date</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Fee Breakdown & Payment Plan */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-200">
              3. Tuition Fee, Scholarship & Payment Plan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Course Fee (INR) *</label>
                <input
                  type="number"
                  value={formData.totalCourseFee}
                  onChange={(e) => setFormData({ ...formData, totalCourseFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scholarship / Discount (INR)</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Net Course Fee</label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-black text-indigo-700 text-sm">
                  ₹{netPayable.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission / Seat Booking Fee Paid Now *</label>
                <input
                  type="number"
                  required
                  value={formData.admissionFeePaid}
                  onChange={(e) => setFormData({ ...formData, admissionFeePaid: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-emerald-700 font-black text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Plan Agreement *</label>
                <select
                  value={formData.paymentPlan}
                  onChange={(e) => setFormData({ ...formData, paymentPlan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="One-Time Full Payment">One-Time Full Payment (100% Cleared)</option>
                  <option value="2 Installments (50/50)">2 Installments (50% now, 50% in 30 days)</option>
                  <option value="3 Installments (40/30/30)">3 Installments (40% now, 30%, 30%)</option>
                  <option value="Monthly EMI Plan">Monthly EMI Installment Plan</option>
                </select>
              </div>
            </div>

            {/* Balance Due Notice */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Pending Tuition Balance Due:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                ₹{remainingDue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Section 4: Counselor & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Counselor</label>
              <input
                type="text"
                value={formData.counselor}
                onChange={(e) => setFormData({ ...formData, counselor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admission Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
              >
                <option value="Admission Confirmed">Admission Confirmed</option>
                <option value="Document Verification">Document Verification</option>
                <option value="Fee Pending">Fee Pending</option>
                <option value="Application Submitted">Application Submitted</option>
              </select>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming...' : 'Confirm Admission & Auto-Generate ID'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

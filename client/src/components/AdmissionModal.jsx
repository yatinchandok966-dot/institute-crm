import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, UserCheck, Calculator, ShieldCheck, Clock, Calendar } from 'lucide-react';

export default function AdmissionModal({
  isOpen,
  onClose,
  leadToConvert,
  courses = [],
  batches = [],
  trainers = [],
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
    trainer: '',
    duration: '16 Weeks',
    admissionDate: new Date().toISOString().split('T')[0],
    totalCourseFee: 45000,
    discount: '', // Scholarship/discount: blank by default or when erased (no sticky zero!)
    discountReason: '',
    admissionFeePaid: 13500,
    paymentPlan: '2 Installments (50% now, 50% in 30 days)',
    status: 'Admission Confirmed',
    counselor: 'Admissions Desk',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // When modal opens or lead is passed for conversion, pre-fill all student details
  useEffect(() => {
    if (!isOpen) return;

    try {
      const safeCourses = Array.isArray(courses) ? courses : [];
      const safeBatches = Array.isArray(batches) ? batches : [];
      const safeTrainers = Array.isArray(trainers) ? trainers : [];

      if (leadToConvert) {
        const leadCourseStr = typeof leadToConvert.course === 'string'
          ? leadToConvert.course
          : (leadToConvert.course?.name || '');

        const matchedCourse = safeCourses.find(c => {
          if (!c) return false;
          const cName = typeof c === 'string' ? c : (c.name || '');
          if (!cName) return false;
          return (
            cName.toLowerCase() === leadCourseStr.toLowerCase() ||
            cName.toLowerCase().includes(leadCourseStr.toLowerCase()) ||
            (leadCourseStr && leadCourseStr.toLowerCase().includes(cName.toLowerCase())) ||
            (leadCourseStr && cName.toLowerCase().startsWith(leadCourseStr.slice(0, 4).toLowerCase()))
          );
        }) || safeCourses[0];

        const courseName = typeof matchedCourse === 'string'
          ? matchedCourse
          : (matchedCourse?.name || leadCourseStr || '');

        // 1. Pick trainer first: find trainer assigned to this course or first available trainer
        const matchedTrainerObj = safeTrainers.find(t => {
          if (!t) return false;
          const assigned = Array.isArray(t.assignedCourses) ? t.assignedCourses : [];
          return assigned.includes(courseName);
        }) || safeTrainers[0];

        const trainerName = typeof matchedTrainerObj === 'string'
          ? matchedTrainerObj
          : (matchedTrainerObj?.name || '');

        // 2. Pick batch availability of that trainer for this course
        let matchedBatchObj = null;
        if (matchedTrainerObj) {
          const assignedBatches = Array.isArray(matchedTrainerObj.assignedBatches) ? matchedTrainerObj.assignedBatches : [];
          if (assignedBatches.length > 0) {
            matchedBatchObj = safeBatches.find(b => assignedBatches.includes(b.name)) || null;
          }
          if (!matchedBatchObj && Array.isArray(matchedTrainerObj.schedule) && matchedTrainerObj.schedule.length > 0) {
            const schedBatch = matchedTrainerObj.schedule.find(s => s && s.batch)?.batch;
            if (schedBatch) {
              matchedBatchObj = safeBatches.find(b => b.name === schedBatch) || null;
            }
          }
        }
        if (!matchedBatchObj) {
          const matchedBatches = safeBatches.filter(b => b && b.course === courseName);
          matchedBatchObj = matchedBatches[0] || safeBatches[0];
        }

        const batchName = typeof matchedBatchObj === 'string'
          ? matchedBatchObj
          : (matchedBatchObj?.name || '');

        const fee = (matchedCourse && typeof matchedCourse === 'object' && matchedCourse.fee)
          ? matchedCourse.fee
          : 45000;

        const durationWeeks = (matchedCourse && typeof matchedCourse === 'object' && matchedCourse.durationWeeks)
          ? `${matchedCourse.durationWeeks} Weeks`
          : '16 Weeks';

        setFormData(prev => ({
          ...prev,
          leadId: leadToConvert.id,
          studentName: leadToConvert.name || '',
          phone: leadToConvert.phone || '',
          email: leadToConvert.email || '',
          trainer: trainerName,
          batch: batchName,
          course: courseName,
          duration: durationWeeks,
          totalCourseFee: fee,
          discount: '',
          admissionFeePaid: Math.round(fee * 0.3),
          counselor: leadToConvert.counselor || 'Admissions Desk',
          notes: `Converted from prospective lead. ${leadToConvert.notes || ''}`
        }));
      } else if (safeCourses.length > 0 || safeTrainers.length > 0) {
        // Pick first trainer if available
        const defaultTrainer = safeTrainers[0];
        const trainerName = typeof defaultTrainer === 'string' ? defaultTrainer : (defaultTrainer?.name || '');

        let courseName = '';
        if (defaultTrainer && Array.isArray(defaultTrainer.assignedCourses) && defaultTrainer.assignedCourses.length > 0) {
          courseName = defaultTrainer.assignedCourses[0];
        } else {
          const defaultCourse = safeCourses[0];
          courseName = typeof defaultCourse === 'string' ? defaultCourse : (defaultCourse?.name || '');
        }

        let batchName = '';
        if (defaultTrainer && Array.isArray(defaultTrainer.assignedBatches) && defaultTrainer.assignedBatches.length > 0) {
          batchName = defaultTrainer.assignedBatches[0];
        } else {
          const matchedBatches = safeBatches.filter(b => b && b.course === courseName);
          const defaultBatch = matchedBatches[0] || safeBatches[0];
          batchName = typeof defaultBatch === 'string' ? defaultBatch : (defaultBatch?.name || '');
        }

        const courseObj = safeCourses.find(c => (typeof c === 'string' ? c : c?.name) === courseName);
        const fee = (courseObj && typeof courseObj === 'object' && courseObj.fee) ? courseObj.fee : 45000;
        const durationWeeks = (courseObj && typeof courseObj === 'object' && courseObj.durationWeeks) ? `${courseObj.durationWeeks} Weeks` : '16 Weeks';

        setFormData(prev => ({
          ...prev,
          trainer: trainerName,
          batch: batchName,
          course: courseName,
          duration: durationWeeks,
          totalCourseFee: fee,
          discount: '',
          admissionFeePaid: Math.round(fee * 0.3)
        }));
      }
    } catch (err) {
      console.error('Error pre-filling admission modal:', err);
    }
  }, [leadToConvert, courses, batches, trainers, isOpen]);

  // Selected trainer object
  const selectedTrainerObj = useMemo(() => {
    return (trainers || []).find(
      t => t && (t.name === formData.trainer || t.employeeId === formData.trainer)
    );
  }, [trainers, formData.trainer]);

  // Dynamic available batches for selected trainer (shows all batch availability of that trainer)
  const trainerAvailableBatches = useMemo(() => {
    const safeBatches = Array.isArray(batches) ? batches : [];
    if (safeBatches.length === 0) return [];

    // If no trainer selected, return batches filtered by course or all institute batches
    if (!selectedTrainerObj) {
      if (formData.course) {
        const filtered = safeBatches.filter(b => b && b.course === formData.course);
        if (filtered.length > 0) return filtered;
      }
      return safeBatches;
    }

    // 1. Check explicit assignedBatches
    const assignedBatchNames = Array.isArray(selectedTrainerObj.assignedBatches)
      ? selectedTrainerObj.assignedBatches
      : [];

    // 2. Check schedule batch items
    const scheduleBatchNames = Array.isArray(selectedTrainerObj.schedule)
      ? selectedTrainerObj.schedule.map(s => s && s.batch).filter(Boolean)
      : [];

    // 3. Check assigned courses
    const assignedCourses = Array.isArray(selectedTrainerObj.assignedCourses)
      ? selectedTrainerObj.assignedCourses
      : [];

    // Directly assigned or scheduled
    const matchedDirect = safeBatches.filter(b =>
      b && (assignedBatchNames.includes(b.name) || scheduleBatchNames.includes(b.name))
    );
    if (matchedDirect.length > 0) {
      return matchedDirect;
    }

    // By trainer's assigned courses: ONLY return batches of courses this trainer teaches!
    if (assignedCourses.length > 0) {
      const courseBatches = safeBatches.filter(b => b && assignedCourses.includes(b.course));
      if (courseBatches.length > 0) {
        return courseBatches;
      }
    }

    // By instructor name or role match
    const instructorBatches = safeBatches.filter(b =>
      b && b.instructor && (
        b.instructor.toLowerCase() === (selectedTrainerObj.name || '').toLowerCase() ||
        b.instructor.toLowerCase() === (selectedTrainerObj.role || '').toLowerCase()
      )
    );
    if (instructorBatches.length > 0) {
      return instructorBatches;
    }

    // Fallback: strictly batches for current course
    if (formData.course) {
      const courseBatches = safeBatches.filter(b => b && b.course === formData.course);
      if (courseBatches.length > 0) return courseBatches;
    }
    return [];
  }, [selectedTrainerObj, formData.course, batches]);

  // Dynamic counselors list
  const availableCounselors = useMemo(() => {
    const set = new Set();
    set.add('Admissions Desk');
    (trainers || []).forEach(t => {
      if (t && t.name) set.add(t.name);
    });
    if (leadToConvert?.counselor) set.add(leadToConvert.counselor);
    return Array.from(set).sort();
  }, [trainers, leadToConvert]);

  // Handler when user selects a Trainer: shows available batches of this trainer and auto-syncs batch + course
  const handleTrainerChange = (e) => {
    const trainerName = e.target.value;
    const safeTrainers = Array.isArray(trainers) ? trainers : [];
    const selectedTrainerObj = safeTrainers.find(t => t && t.name === trainerName);
    const safeBatches = Array.isArray(batches) ? batches : [];
    const safeCourses = Array.isArray(courses) ? courses : [];

    let newBatch = '';
    let newCourse = formData.course;

    if (selectedTrainerObj) {
      // Find batches available for this trainer
      const assignedBatches = Array.isArray(selectedTrainerObj.assignedBatches) ? selectedTrainerObj.assignedBatches : [];
      const assignedCourses = Array.isArray(selectedTrainerObj.assignedCourses) ? selectedTrainerObj.assignedCourses : [];

      if (assignedBatches.length > 0) {
        newBatch = assignedBatches[0];
        const bObj = safeBatches.find(b => b.name === newBatch);
        if (bObj && bObj.course) newCourse = bObj.course;
      } else if (Array.isArray(selectedTrainerObj.schedule) && selectedTrainerObj.schedule.length > 0) {
        const schedBatch = selectedTrainerObj.schedule.find(s => s && s.batch)?.batch;
        if (schedBatch) {
          newBatch = schedBatch;
          const bObj = safeBatches.find(b => b.name === newBatch);
          if (bObj && bObj.course) newCourse = bObj.course;
        }
      } else if (assignedCourses.length > 0) {
        newCourse = assignedCourses[0];
        const courseBatches = safeBatches.filter(b => b.course === newCourse);
        if (courseBatches.length > 0) newBatch = courseBatches[0].name;
      } else {
        // Fallback to first available batch
        const firstBatch = safeBatches[0];
        if (firstBatch) {
          newBatch = firstBatch.name;
          if (firstBatch.course) newCourse = firstBatch.course;
        }
      }
    }

    const courseObj = safeCourses.find(c => (typeof c === 'string' ? c : c?.name) === newCourse);
    const fee = (courseObj && typeof courseObj === 'object' && courseObj.fee) ? courseObj.fee : (formData.totalCourseFee || 45000);
    const duration = (courseObj && typeof courseObj === 'object' && courseObj.durationWeeks) ? `${courseObj.durationWeeks} Weeks` : formData.duration;

    setFormData(prev => ({
      ...prev,
      trainer: trainerName,
      batch: newBatch || prev.batch,
      course: newCourse,
      duration: duration,
      totalCourseFee: fee,
      admissionFeePaid: Math.round(fee * 0.3)
    }));
  };

  // Handler when user selects a Batch: auto-syncs associated course, fee, and duration
  const handleBatchChange = (e) => {
    const batchName = e.target.value;
    const safeBatches = Array.isArray(batches) ? batches : [];
    const selectedBatch = safeBatches.find(b => b.name === batchName);

    if (selectedBatch && selectedBatch.course) {
      const courseName = selectedBatch.course;
      const safeCourses = Array.isArray(courses) ? courses : [];
      const courseObj = safeCourses.find(c => (typeof c === 'string' ? c : c?.name) === courseName);
      const fee = (courseObj && typeof courseObj === 'object' && courseObj.fee) ? courseObj.fee : 45000;
      const duration = (courseObj && typeof courseObj === 'object' && courseObj.durationWeeks) ? `${courseObj.durationWeeks} Weeks` : formData.duration;

      setFormData(prev => ({
        ...prev,
        batch: batchName,
        course: courseName,
        duration: duration,
        totalCourseFee: fee,
        admissionFeePaid: Math.round(fee * 0.3)
      }));
    } else {
      setFormData(prev => ({ ...prev, batch: batchName }));
    }
  };

  // Handler when user selects Course: auto-syncs duration, fee, and filters
  const handleCourseChange = (e) => {
    const courseName = e.target.value;
    const safeCourses = Array.isArray(courses) ? courses : [];
    const selectedCourse = safeCourses.find(c => c && (typeof c === 'string' ? c === courseName : c.name === courseName));
    const safeBatches = Array.isArray(batches) ? batches : [];
    const matchedBatches = safeBatches.filter(b => b && b.course === courseName);
    const matchedBatch = matchedBatches[0] || safeBatches[0];
    const fee = (selectedCourse && typeof selectedCourse === 'object' && selectedCourse.fee) ? selectedCourse.fee : 45000;
    const safeTrainers = Array.isArray(trainers) ? trainers : [];
    const matchedTrainer = safeTrainers.find(t => t && Array.isArray(t.assignedCourses) && t.assignedCourses.includes(courseName)) || safeTrainers[0];

    setFormData(prev => ({
      ...prev,
      course: courseName,
      batch: typeof matchedBatch === 'string' ? matchedBatch : (matchedBatch?.name || ''),
      trainer: typeof matchedTrainer === 'string' ? matchedTrainer : (matchedTrainer?.name || prev.trainer),
      duration: (selectedCourse && typeof selectedCourse === 'object' && selectedCourse.durationWeeks) ? `${selectedCourse.durationWeeks} Weeks` : prev.duration,
      totalCourseFee: fee,
      admissionFeePaid: Math.round(fee * 0.3)
    }));
  };

  // Safe numerical calculations
  const totalFeeNum = Math.max(0, Number(formData.totalCourseFee) || 0);
  const scholarshipNum = Math.max(0, Number(formData.discount) || 0);

  // Net payable with scholarship real deduction
  const netPayable = Math.max(0, totalFeeNum - scholarshipNum);
  const paidNowNum = Math.max(0, Number(formData.admissionFeePaid) || 0);
  const remainingDue = Math.max(0, netPayable - paidNowNum);

  // Real month-by-month installment breakdown
  const installmentSchedule = useMemo(() => {
    try {
      const total = totalFeeNum;
      const scholarship = scholarshipNum;
      const net = netPayable;
      const paid = Math.min(net, paidNowNum);
      const balance = Math.max(0, net - paid);

      let baseDate = new Date();
      if (formData.admissionDate) {
        const parsed = new Date(formData.admissionDate);
        if (!isNaN(parsed.getTime())) {
          baseDate = parsed;
        }
      }

      const getMonthStr = (monthsAhead) => {
        try {
          const d = new Date(baseDate.getTime());
          d.setMonth(d.getMonth() + monthsAhead);
          return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
          return `Month +${monthsAhead}`;
        }
      };

      const plan = String(formData.paymentPlan || '');

      if (plan.includes('Full') || plan.includes('One-Time')) {
        return {
          title: 'Full One-Time Payment',
          installments: [
            {
              number: '1 / 1',
              name: 'Full Tuition Payment',
              dueMonth: `Today (${getMonthStr(0)})`,
              amount: net,
              status: paid >= net ? 'Paid in Full' : `₹${paid.toLocaleString('en-IN')} Paid Now`
            }
          ]
        };
      }

      if (plan.includes('2 Installments')) {
        return {
          title: '2 Installments Plan (Monthly Schedule)',
          installments: [
            {
              number: '1 of 2',
              name: 'Downpayment & Seat Booking',
              dueMonth: `Today (${getMonthStr(0)})`,
              amount: paid,
              status: 'Paid Today upon Admission'
            },
            {
              number: '2 of 2',
              name: 'Month 1 Final Due',
              dueMonth: `Month 1 (${getMonthStr(1)})`,
              amount: balance,
              status: 'Payable in Month 1'
            }
          ]
        };
      }

      if (plan.includes('3 Installments')) {
        const inst2 = Math.round(balance / 2);
        const inst3 = Math.max(0, balance - inst2);
        return {
          title: '3 Installments Plan (Monthly Schedule)',
          installments: [
            {
              number: '1 of 3',
              name: 'Downpayment / Registration',
              dueMonth: `Today (${getMonthStr(0)})`,
              amount: paid,
              status: 'Paid Today upon Admission'
            },
            {
              number: '2 of 3',
              name: 'Month 1 Installment',
              dueMonth: `Month 1 (${getMonthStr(1)})`,
              amount: inst2,
              status: 'Payable in Month 1'
            },
            {
              number: '3 of 3',
              name: 'Month 2 Final Clearance',
              dueMonth: `Month 2 (${getMonthStr(2)})`,
              amount: inst3,
              status: 'Payable in Month 2'
            }
          ]
        };
      }

      // Default Monthly EMI (4 Installments)
      const emiPerMonth = balance > 0 ? Math.round(balance / 3) : 0;
      const lastMonth = Math.max(0, balance - (emiPerMonth * 2));
      return {
        title: 'Monthly EMI Plan (4 Installments)',
        installments: [
          {
            number: '1 of 4',
            name: 'Admission Downpayment',
            dueMonth: `Today (${getMonthStr(0)})`,
            amount: paid,
            status: 'Paid Today upon Admission'
          },
          {
            number: '2 of 4',
            name: 'Month 1 EMI',
            dueMonth: `Month 1 (${getMonthStr(1)})`,
            amount: emiPerMonth,
            status: 'Payable in Month 1'
          },
          {
            number: '3 of 4',
            name: 'Month 2 EMI',
            dueMonth: `Month 2 (${getMonthStr(2)})`,
            amount: emiPerMonth,
            status: 'Payable in Month 2'
          },
          {
            number: '4 of 4',
            name: 'Month 3 Final EMI',
            dueMonth: `Month 3 (${getMonthStr(3)})`,
            amount: lastMonth,
            status: 'Payable in Month 3'
          }
        ]
      };
    } catch (err) {
      console.error('Error calculating installment schedule:', err);
      return {
        title: 'Tuition Payment Plan',
        installments: [
          {
            number: '1 of 1',
            name: 'Tuition Payment',
            dueMonth: 'Current Term',
            amount: Math.max(0, totalFeeNum - scholarshipNum),
            status: 'Payable'
          }
        ]
      };
    }
  }, [totalFeeNum, scholarshipNum, netPayable, paidNowNum, formData.paymentPlan, formData.admissionDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      alert('Student Contact Phone must be exactly 10 digits (digits only, no letters).');
      return;
    }

    const cleanEmail = (formData.email || '').trim().toLowerCase();
    if (cleanEmail) {
      const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailPattern.test(cleanEmail)) {
        alert('Please enter a valid lowercase email address (e.g. name@gmail.com).');
        return;
      }
    }

    const cleanGuardianPhone = (formData.guardianPhone || '').replace(/\D/g, '');
    if (formData.guardianPhone && cleanGuardianPhone.length !== 10) {
      alert('Guardian Phone Contact must be exactly 10 digits (digits only).');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      discount: scholarshipNum,
      phone: cleanPhone,
      email: cleanEmail,
      guardianPhone: cleanGuardianPhone,
      trainer: formData.trainer || 'Unassigned',
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
          trainer: payload.trainer,
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
        trainer: payload.trainer,
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

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {leadToConvert ? 'Convert Lead to Student Admission' : 'New Student Admission'}
              </h3>
              <p className="text-xs text-slate-500">
                Auto-generates admission number and enrolls student without re-entering details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Section 1: Student Personal Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                1. Student Personal Information
              </h4>
              {leadToConvert && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Pre-filled from Lead Pipeline
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Contact Phone (WhatsApp) *</label>
                  <span className={`text-[10px] font-mono font-bold ${(formData.phone || '').replace(/\D/g, '').length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {(formData.phone || '').replace(/\D/g, '').length}/10 digits
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit number"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Email Address</label>
                  <span className="text-[10px] text-slate-400">lowercase only</span>
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Guardian Phone Contact</label>
                  <span className={`text-[10px] font-mono font-bold ${(formData.guardianPhone || '').replace(/\D/g, '').length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {(formData.guardianPhone || '').replace(/\D/g, '').length}/10 digits
                  </span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit number"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trainer, Batch Availability & Course Program Allotment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                2. Academic Program, Batch & Trainer Allotment
              </h4>
              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                1. Select Trainer → 2. Select Batch Availability
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Trainer Selection (FIRST) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Assigned Trainer / Faculty <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">All registered instructors</span>
                </div>
                <select
                  value={formData.trainer}
                  onChange={handleTrainerChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Trainer / Faculty</option>
                  {(trainers || []).map((t, i) => {
                    const tName = typeof t === 'string' ? t : (t?.name || `Trainer ${i + 1}`);
                    const tEmp = t?.employeeId ? ` (${t.employeeId})` : '';
                    const rawRole = (tName === 'Deepika') ? 'Technical Trainer' : (t?.role || 'Technical Trainer');
                    const tRole = ` • ${rawRole}`;
                    return (
                      <option key={t?.id || t?.employeeId || tName || i} value={tName}>
                        {tName}{tEmp}{tRole}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 2. Trainer Availability Schedule & Allotted Batch (SECOND) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Trainer Availability Schedule & Batch <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {trainerAvailableBatches.length} {trainerAvailableBatches.length === 1 ? 'Slot' : 'Slots'} Available
                  </span>
                </div>
                <select
                  value={formData.batch}
                  onChange={handleBatchChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(trainerAvailableBatches && trainerAvailableBatches.length > 0) ? (
                    trainerAvailableBatches.map((b, i) => {
                      const bName = typeof b === 'string' ? b : (b?.name || `Batch ${i + 1}`);
                      const bTiming = b?.timing || 'Mon-Fri 09:00 AM - 11:30 AM';
                      const bRoom = b?.room ? ` [${b.room}]` : '';
                      const bMode = b?.mode ? ` (${b.mode})` : '';
                      return (
                        <option key={b?.id || bName || i} value={bName}>
                          📅 {bTiming} — {bName}{bMode}{bRoom}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">No batches available for this trainer</option>
                  )}
                </select>

                {/* Trainer Schedule & Class Timetable Details */}
                {selectedTrainerObj && (
                  <div className="mt-2 p-2.5 bg-slate-50 border border-indigo-100 rounded-xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{selectedTrainerObj.name}&apos;s Availability Timetable</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active Schedule
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {Array.isArray(selectedTrainerObj.schedule) && selectedTrainerObj.schedule.length > 0 ? (
                        selectedTrainerObj.schedule.map((slot, idx) => (
                          <div
                            key={slot.id || idx}
                            className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-700 shadow-2xs flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <strong className="text-slate-900">{slot.day || 'Mon-Fri'}:</strong>
                            <span>{slot.time}</span>
                            {slot.batch && <span className="text-indigo-600 font-semibold">({slot.batch})</span>}
                            {slot.room && <span className="text-slate-400 font-mono">[{slot.room}]</span>}
                          </div>
                        ))
                      ) : (
                        trainerAvailableBatches.map((b, idx) => (
                          <div
                            key={b.id || idx}
                            className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-700 shadow-2xs flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <strong className="text-slate-900">{b.name}:</strong>
                            <span>{b.timing || 'Mon-Fri 09:00 AM - 11:30 AM'}</span>
                            {b.room && <span className="text-slate-400 font-mono">[{b.room}]</span>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 3. Selected Course Program */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Selected Course Program <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.course}
                  onChange={handleCourseChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(courses && courses.length > 0) ? (
                    courses.map((c, i) => {
                      const cName = typeof c === 'string' ? c : (c?.name || `Course ${i + 1}`);
                      return <option key={c?.id || cName || i} value={cName}>{cName}</option>;
                    })
                  ) : (
                    <option value="">No courses yet (Add Course first)</option>
                  )}
                </select>
              </div>

              {/* 4. Course Duration */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium"
                />
              </div>

              {/* 5. Admission Date */}
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

          {/* Section 3: Tuition Fee, Scholarship & Payment Plan */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-200">
              3. Tuition Fee, Scholarship & Payment Plan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Course Fee (INR) *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalCourseFee}
                  onChange={(e) => setFormData({ ...formData, totalCourseFee: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Scholarship / Discount (INR)</label>
                  <span className="text-[10px] text-slate-400">Non-negative</span>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.discount === '' ? '' : formData.discount}
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      setFormData({ ...formData, discount: '' });
                      return;
                    }
                    const num = Math.max(0, parseInt(raw, 10));
                    if (isNaN(num)) {
                      setFormData({ ...formData, discount: '' });
                    } else {
                      const clamped = Math.min(totalFeeNum, num);
                      setFormData({ ...formData, discount: clamped });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Net Course Fee</label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-black text-indigo-700 text-sm">
                  ₹{netPayable.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission / Seat Booking Fee Paid Now *</label>
                <input
                  type="number"
                  min="0"
                  max={netPayable}
                  required
                  value={formData.admissionFeePaid === '' ? '' : formData.admissionFeePaid}
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setFormData({ ...formData, admissionFeePaid: '' });
                      return;
                    }
                    const num = Math.max(0, parseInt(val, 10));
                    setFormData({ ...formData, admissionFeePaid: isNaN(num) ? '' : num });
                  }}
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
                  <option value="Full One-Time Payment">Full One-Time Payment (100% Upfront)</option>
                  <option value="2 Installments (50% now, 50% in 30 days)">2 Installments (50% now, 50% in 30 days)</option>
                  <option value="3 Installments (40% now, 30% in 30 days, 30% in 60 days)">3 Installments (40% now, 30%, 30%)</option>
                  <option value="Monthly EMI (4 Equal Installments)">Monthly EMI (4 Equal Monthly Installments)</option>
                </select>
              </div>
            </div>

            {/* REAL INSTALLMENT MONTHLY BREAKDOWN SCHEDULE CARD */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800 text-xs">
                    {installmentSchedule.title}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600">
                  <span>Tuition: <strong>₹{totalFeeNum.toLocaleString('en-IN')}</strong></span>
                  {scholarshipNum > 0 && (
                    <span className="text-emerald-700 font-bold ml-1.5">
                      − Scholarship: ₹{scholarshipNum.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-indigo-700 font-black ml-1.5">
                    = Total: ₹{netPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Installment breakdown items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                {(installmentSchedule?.installments || []).map((inst, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-indigo-700 uppercase">{inst.number || `${idx + 1}`}</span>
                      <span className="text-slate-500 font-medium">{inst.dueMonth || 'Scheduled'}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      ₹{(Number(inst.amount) || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 truncate" title={inst.name || 'Installment'}>
                      {inst.name || 'Installment'}
                    </div>
                    <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block ${
                      idx === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {inst.status || 'Scheduled'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pending Tuition Balance Notice */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Pending Tuition Balance Due after Today:</span>
                <span className="font-black text-rose-600 text-sm">
                  ₹{remainingDue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Counselor & Admission Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Counselor</label>
              <select
                value={formData.counselor}
                onChange={(e) => setFormData({ ...formData, counselor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableCounselors.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admission Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
              >
                <option value="Admission Confirmed">Admission Confirmed</option>
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
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Admission...' : 'Confirm Admission & Auto-Generate ID'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' && document.body
    ? createPortal(modalContent, document.body)
    : modalContent;
}

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Building2,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  BookOpen
} from 'lucide-react';

export default function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSave,
  courses = [],
  batches = []
}) {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'academic' | 'enrolment'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    guardian: '',
    guardianPhone: '',
    qualification: '',
    college: '',
    passingYear: '',
    admissionNo: '',
    status: 'Active',
    course: '',
    batch: ''
  });

  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Populate data when student changes or modal opens
  useEffect(() => {
    if (student && isOpen) {
      // Format Date of Birth for input date format (YYYY-MM-DD)
      let formattedDob = '';
      const rawDob = student.dob || student.dateOfBirth;
      if (rawDob) {
        try {
          const d = new Date(rawDob);
          if (!isNaN(d.getTime())) {
            formattedDob = d.toISOString().split('T')[0];
          }
        } catch {
          formattedDob = String(rawDob).split('T')[0] || '';
        }
      }

      setFormData({
        name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || '',
        email: student.email || '',
        phone: student.phone || '',
        dob: formattedDob,
        gender: student.gender || 'Male',
        address: student.address || '',
        guardian: student.guardian || student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        qualification: student.qualification || '',
        college: student.college || student.collegeUniversity || '',
        passingYear: student.passingYear ? String(student.passingYear) : '',
        admissionNo: student.admissionNo || '',
        status: student.enrollmentStatus || student.status || 'Active',
        course: student.course || (student.enrollments?.[0]?.course) || '',
        batch: student.batch || (student.enrollments?.[0]?.batch) || ''
      });

      setErrors({});
      setTouched({});
      setSubmitError(null);
      setActiveTab('personal');
    }
  }, [student, isOpen]);

  // Validation Logic
  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'name': {
        const val = (value || '').trim();
        if (!val) {
          error = 'Student name is required.';
        } else if (val.length < 2) {
          error = 'Name must be at least 2 characters.';
        } else if (!/^[a-zA-Z\s.'-]+$/.test(val)) {
          error = 'Name should only contain letters, spaces, and hyphens.';
        }
        break;
      }
      case 'phone': {
        const digits = String(value || '').replace(/\D/g, '');
        if (!digits) {
          error = 'Mobile phone number is required.';
        } else if (digits.length < 10) {
          error = 'Phone number must be at least 10 digits.';
        } else if (digits.length > 12) {
          error = 'Phone number cannot exceed 12 digits.';
        }
        break;
      }
      case 'email': {
        const val = (value || '').trim();
        if (!val) {
          error = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          error = 'Please enter a valid email address (e.g., student@domain.com).';
        }
        break;
      }
      case 'guardianPhone': {
        const digits = String(value || '').replace(/\D/g, '');
        if (value && value.trim()) {
          if (digits.length < 10) {
            error = 'Guardian phone must be at least 10 digits.';
          } else if (digits.length > 12) {
            error = 'Guardian phone cannot exceed 12 digits.';
          }
        }
        break;
      }
      case 'passingYear': {
        const val = String(value || '').trim();
        if (val) {
          const yearNum = Number(val);
          if (!/^\d{4}$/.test(val) || yearNum < 1980 || yearNum > 2035) {
            error = 'Enter a valid 4-digit year between 1980 and 2035.';
          }
        }
        break;
      }
      case 'dob': {
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          if (isNaN(selectedDate.getTime())) {
            error = 'Please enter a valid date.';
          } else if (selectedDate > today) {
            error = 'Date of birth cannot be in the future.';
          }
        }
        break;
      }
      default:
        break;
    }

    return error;
  };

  const validateAll = (data) => {
    const newErrors = {};
    const fieldsToValidate = ['name', 'phone', 'email', 'guardianPhone', 'passingYear', 'dob'];

    fieldsToValidate.forEach((field) => {
      const err = validateField(field, data[field]);
      if (err) {
        newErrors[field] = err;
      }
    });

    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation if field was touched
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => {
        const updated = { ...prev };
        if (err) {
          updated[field] = err;
        } else {
          delete updated[field];
        }
        return updated;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => {
      const updated = { ...prev };
      if (err) {
        updated[field] = err;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Mark all required fields as touched
    const allTouched = {
      name: true,
      phone: true,
      email: true,
      guardianPhone: true,
      passingYear: true,
      dob: true
    };
    setTouched(allTouched);

    const validationErrors = validateAll(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Find which tab has the first error
      if (validationErrors.name || validationErrors.phone || validationErrors.email || validationErrors.dob) {
        setActiveTab('personal');
      } else if (validationErrors.guardianPhone || validationErrors.passingYear) {
        setActiveTab('academic');
      }
      setSubmitError('Please correct the highlighted validation errors before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedStudentData = {
        ...student,
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        passingYear: formData.passingYear ? Number(formData.passingYear) : null,
        enrollmentStatus: formData.status
      };

      await onSave(updatedStudentData);
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to update student profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex justify-between items-center rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Edit Student Details</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                  {student.studentId || 'ID: ' + student.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Update personal, academic, guardian and enrolment information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal Info</span>
            {(errors.name || errors.phone || errors.email || errors.dob) && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'academic'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic & Guardian</span>
            {(errors.guardianPhone || errors.passingYear) && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('enrolment')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'enrolment'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Enrolment & Status</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g. Yatin Chandok"
                    className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                      errors.name && touched.name
                        ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.name && touched.name && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      placeholder="10-digit mobile number"
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                        errors.phone && touched.phone
                          ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="e.g. student@email.com"
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                        errors.email && touched.email
                          ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* DOB & Gender Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.dob}
                      onChange={(e) => handleChange('dob', e.target.value)}
                      onBlur={() => handleBlur('dob')}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                        errors.dob && touched.dob
                          ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.dob && touched.dob && (
                    <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.dob}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter permanent address, city, state and pincode"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC & GUARDIAN */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Educational Background
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Highest Qualification
                    </label>
                    <select
                      value={formData.qualification}
                      onChange={(e) => handleChange('qualification', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Qualification --</option>
                      <option value="10th Standard">10th Standard</option>
                      <option value="12th Standard / Intermediate">12th Standard / Intermediate</option>
                      <option value="Diploma">Diploma / Polytechnic</option>
                      <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                      <option value="BCA">BCA</option>
                      <option value="B.Sc Computer Science / IT">B.Sc Computer Science / IT</option>
                      <option value="B.Sc (Other)">B.Sc (Other)</option>
                      <option value="B.Com / BBA">B.Com / BBA</option>
                      <option value="MCA / M.Tech">MCA / M.Tech</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="Working Professional">Working Professional</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Passing / Graduation Year
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2024"
                      min="1980"
                      max="2035"
                      value={formData.passingYear}
                      onChange={(e) => handleChange('passingYear', e.target.value)}
                      onBlur={() => handleBlur('passingYear')}
                      className={`w-full px-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                        errors.passingYear && touched.passingYear
                          ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 focus:ring-indigo-500'
                      }`}
                    />
                    {errors.passingYear && touched.passingYear && (
                      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> {errors.passingYear}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    College / School / University
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Delhi University / AKTU"
                      value={formData.college}
                      onChange={(e) => handleChange('college', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Guardian Info Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Parent / Guardian Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Guardian Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Chandok"
                      value={formData.guardian}
                      onChange={(e) => handleChange('guardian', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Guardian Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={formData.guardianPhone}
                        onChange={(e) => handleChange('guardianPhone', e.target.value)}
                        onBlur={() => handleBlur('guardianPhone')}
                        className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                          errors.guardianPhone && touched.guardianPhone
                            ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:ring-rose-400'
                            : 'border-slate-300 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.guardianPhone && touched.guardianPhone && (
                      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> {errors.guardianPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ENROLMENT & STATUS */}
          {activeTab === 'enrolment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student Roll ID (Code)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={student.studentId || 'Auto Generated'}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Permanent student registration identifier
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Admission Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ADM-2026-0001"
                    value={formData.admissionNo}
                    onChange={(e) => handleChange('admissionNo', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Enrollment Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Enrolled Course
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => handleChange('course', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => {
                      const courseName = typeof c === 'string' ? c : c.name;
                      return (
                        <option key={courseName} value={courseName}>
                          {courseName}
                        </option>
                      );
                    })}
                    {formData.course && !courses.some((c) => (typeof c === 'string' ? c : c.name) === formData.course) && (
                      <option value={formData.course}>{formData.course}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Batch
                </label>
                <select
                  value={formData.batch}
                  onChange={(e) => handleChange('batch', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map((b) => {
                    const batchName = typeof b === 'string' ? b : (b.name || b.batch_name);
                    return (
                      <option key={batchName} value={batchName}>
                        {batchName}
                      </option>
                    );
                  })}
                  {formData.batch && !batches.some((b) => (typeof b === 'string' ? b : (b.name || b.batch_name)) === formData.batch) && (
                    <option value={formData.batch}>{formData.batch}</option>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-5 mt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
              {activeTab !== 'personal' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'enrolment' ? 'academic' : 'personal')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Previous
                </button>
              )}

              {activeTab !== 'enrolment' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'personal' ? 'academic' : 'enrolment')}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Next Step
                </button>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Student Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

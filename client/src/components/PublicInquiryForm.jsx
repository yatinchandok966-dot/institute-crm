import React, { useState, useEffect, useRef } from 'react';
import { School, CheckCircle2, Send, Check, ChevronDown } from 'lucide-react';
import { COUNTRY_CODES, formatPhoneWithCountryCode } from '../utils/phone';

const TIMING_OPTIONS = [
  { value: 'Morning (09:00 AM - 11:30 AM)', label: 'Morning (09:00 AM - 11:30 AM)' },
  { value: 'Evening (06:30 PM - 08:30 PM)', label: 'Evening (06:30 PM - 08:30 PM)' },
  { value: 'Weekend (Sat-Sun 10:00 AM - 02:00 PM)', label: 'Weekend (Sat-Sun 10:00 AM - 02:00 PM)' }
];

const QUALIFICATION_OPTIONS = [
  { value: 'College Student (Final Year / Pre-final)', label: 'College Student (Final Year / Pre-final)' },
  { value: 'Working Professional (Looking to Upskill)', label: 'Working Professional (Looking to Upskill)' },
  { value: 'Recent Graduate / Fresher Seeking Job', label: 'Recent Graduate / Fresher Seeking Job' },
  { value: 'Career Switcher / Non-IT Transition', label: 'Career Switcher / Non-IT Transition' }
];

function CustomSelect({ id, value, options, placeholder = 'Select an option', isOpen, onToggle, onSelect, className = '', menuClassName = '' }) {
  const selected = options.find((opt) => opt.value === value);
  return (
    <div className={`relative ${className}`} data-custom-select={id}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-medium flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-left"
      >
        <span className={`truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 ${menuClassName}`}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelect(opt.value)}
                className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between gap-2 whitespace-normal break-words ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="leading-snug flex-1 min-w-0">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PublicInquiryForm({ courses, onLeadSubmitted, onBackToCRM }) {
  const initialCourse = (courses && courses.length > 0 && (courses[0]?.name || courses[0])) || '';
  const [formData, setFormData] = useState({
    name: '',
    countryCode: '+91',
    phone: '',
    email: '',
    course: initialCourse,
    timing: 'Morning (09:00 AM - 11:30 AM)',
    qualification: 'College Student (Final Year)',
    notes: ''
  });

  // Ensure course is defaulted when courses load
  useEffect(() => {
    if (!formData.course && courses && courses.length > 0) {
      const first = courses[0]?.name || courses[0];
      if (first) {
        setFormData(prev => ({ ...prev, course: prev.course || first }));
      }
    }
  }, [courses]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const formContainerRef = useRef(null);

  useEffect(() => {
    if (!openDropdown) return;
    const handleOutside = (e) => {
      const target = e.target;
      if (target && !target.closest(`[data-custom-select="${openDropdown}"]`)) {
        setOpenDropdown(null);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openDropdown]);

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please provide your name.');
      return;
    }

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      alert('Please provide your phone number.');
      return;
    }
    if (cleanPhone.length !== 10) {
      alert('Phone Number must be exactly 10 digits (digits only, no letters allowed).');
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

    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      name: formData.name.trim(),
      phone: formatPhoneWithCountryCode(formData.countryCode, cleanPhone),
      email: cleanEmail,
      course: formData.course,
      source: 'QR Code (Campus Reception)',
      status: 'New Inquiry',
      counselor: 'Admissions Desk',
      followUp: 'Pending Counselor Call',
      notes: `Timing: ${formData.timing} | Background: ${formData.qualification} ${formData.notes ? '| Message: ' + formData.notes : ''}`
    };

    const apiUrl = `${window.location.origin}/api/leads`;
    const postLead = () =>
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify(payload)
      });

    try {
      let res;
      try {
        res = await postLead();
      } catch (firstErr) {
        // iOS Safari can fail with "TypeError: Load failed" on a stale HTTP/2 keep-alive socket after form idle time; retry once on a fresh connection.
        await new Promise((r) => setTimeout(r, 400));
        res = await postLead();
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success) {
        setSubmitError(
          data?.message ||
            `Could not submit inquiry (status ${res.status}). Please check your connection and try again.`
        );
        return;
      }

      if (data.lead && onLeadSubmitted) {
        try {
          onLeadSubmitted({
            ...data.lead,
            source: data.lead.source || 'QR Code (Campus Reception)'
          });
        } catch (cbErr) {
          console.warn('onLeadSubmitted callback warning:', cbErr);
        }
      }
      setIsSubmitted(true);
    } catch (err) {
      const detail = err?.message ? ` (${err.message})` : '';
      setSubmitError(`Network error while submitting inquiry. Please try again.${detail}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-8 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Inquiry Submitted!
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Thank you, <strong className="text-slate-800">{formData.name}</strong>. Your inquiry{formData.course ? <> for <strong className="text-slate-800">{formData.course}</strong></> : ''} has been received by the EduPulse Academy admissions desk.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Contact Number:</span>
              <strong className="text-slate-800 font-mono">{formData.phone}</strong>
            </div>
            {formData.course && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Course Selected:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{formData.course}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 pt-1 border-t border-slate-200/60">
              <span className="text-slate-400 shrink-0">Preferred Timing:</span>
              <span className="font-semibold text-slate-800 whitespace-nowrap">{formData.timing}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-400">Assigned Counselor:</span>
              <span className="font-semibold text-indigo-700">Admissions Desk</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Our counselor will get in touch with you shortly on WhatsApp / Phone to share the syllabus PDF and book your demo seat.
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setFormData({
                  name: '',
                  countryCode: '+91',
                  phone: '',
                  email: '',
                  course: '',
                  timing: 'Morning (09:00 AM - 11:30 AM)',
                  qualification: 'College Student (Final Year)',
                  notes: ''
                });
                setIsSubmitted(false);
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans flex flex-col items-center justify-center">
      {/* Main Google-Forms Style Card */}
      <div ref={formContainerRef} className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full">
        {/* Top Header Card */}
        <div className="p-6 md:p-8 rounded-t-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">EduPulse Academy</h1>
              <p className="text-xs text-indigo-200">Premier Center for Technology, Design & AI</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10">
            <h2 className="text-lg font-bold text-white">Student Course Inquiry & Demo Class Registration</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Please fill in your details below to receive the detailed syllabus, course fee breakdown, and schedule your free trial session.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 text-xs text-slate-800">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Aditi Deshmukh"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Contact (Phone & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 text-xs">
                  WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-mono font-bold ${
                  (formData.phone || '').length === 10 ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {(formData.phone || '').length}/10 digits
                </span>
              </div>
              <div className="flex gap-2">
                <CustomSelect
                  id="countryCode"
                  value={formData.countryCode || '+91'}
                  options={COUNTRY_CODES.map((c) => ({ value: c.code, label: c.label }))}
                  isOpen={openDropdown === 'countryCode'}
                  onToggle={toggleDropdown}
                  onSelect={(val) => {
                    setFormData({ ...formData, countryCode: val });
                    setOpenDropdown(null);
                  }}
                  className="w-28 shrink-0"
                  menuClassName="min-w-[130px]"
                />
                <div className="relative flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(-10);
                      setFormData({ ...formData, phone: digitsOnly });
                    }}
                    placeholder="10-digit number (e.g. 9876543210)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 text-xs">
                  Email Address
                </label>
                <span className="text-[10px] text-slate-400">
                  lowercase only
                </span>
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  const lower = e.target.value.toLowerCase().replace(/[A-Z\s]/g, '').trim();
                  setFormData({ ...formData, email: lower });
                }}
                onKeyDown={(e) => {
                  if (e.key === ' ') e.preventDefault();
                }}
                placeholder="e.g. name@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium lowercase"
              />
            </div>
          </div>

          {/* Program of Interest */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">
              Select Program of Interest <span className="text-rose-500">*</span>
            </label>
            {courses && courses.length > 0 ? (
              <CustomSelect
                id="course"
                value={formData.course}
                options={courses.map((c) => ({
                  value: c.name,
                  label: `${c.name}${c.durationWeeks ? ` (${c.durationWeeks} Weeks)` : ''}`
                }))}
                placeholder="Select Program of Interest"
                isOpen={openDropdown === 'course'}
                onToggle={toggleDropdown}
                onSelect={(val) => {
                  setFormData({ ...formData, course: val });
                  setOpenDropdown(null);
                }}
              />
            ) : (
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                placeholder="Enter interested course (e.g. Web Development, Python, Design...)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-semibold"
                required
              />
            )}
          </div>

          {/* Preferred Timing */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">
              Preferred Timing
            </label>
            <CustomSelect
              id="timing"
              value={formData.timing}
              options={TIMING_OPTIONS}
              isOpen={openDropdown === 'timing'}
              onToggle={toggleDropdown}
              onSelect={(val) => {
                setFormData({ ...formData, timing: val });
                setOpenDropdown(null);
              }}
            />
          </div>

          {/* Current Status */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">
              Current Educational / Professional Background
            </label>
            <CustomSelect
              id="qualification"
              value={formData.qualification}
              options={QUALIFICATION_OPTIONS}
              isOpen={openDropdown === 'qualification'}
              onToggle={toggleDropdown}
              onSelect={(val) => {
                setFormData({ ...formData, qualification: val });
                setOpenDropdown(null);
              }}
            />
          </div>

          {/* Any specific questions */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">
              Any Questions or Specific Requirements? (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Want weekend batch, placement assistance queries, installment details..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Inquiry...' : 'Submit Inquiry & Request Demo'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            🔒 Your contact information is kept strictly private by EduPulse Academy. No spam.
          </p>
        </form>
      </div>
    </div>
  );
}

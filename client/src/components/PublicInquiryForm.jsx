import React, { useState } from 'react';
import { School, CheckCircle2, Send, Phone, Mail, BookOpen, Clock, MapPin, Sparkles } from 'lucide-react';

export default function PublicInquiryForm({ courses, onLeadSubmitted, onBackToCRM }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: '',
    timing: 'Morning (09:00 AM - 11:30 AM)',
    qualification: 'College Student (Final Year)',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    const payload = {
      name: formData.name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      course: formData.course,
      source: 'QR Code (Campus Reception)',
      status: 'New Inquiry',
      counselor: 'Admissions Desk',
      followUp: 'Pending Counselor Call',
      notes: `Timing: ${formData.timing} | Background: ${formData.qualification} ${formData.notes ? '| Message: ' + formData.notes : ''}`
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (data && data.success && data.lead && onLeadSubmitted) {
        onLeadSubmitted({
          ...data.lead,
          source: data.lead.source || 'QR Code (Campus Reception)'
        });
      } else if (onLeadSubmitted) {
        onLeadSubmitted({
          id: Date.now(),
          ...payload,
          createdAt: new Date().toISOString().split('T')[0]
        });
      }
    } catch {
      if (onLeadSubmitted) {
        onLeadSubmitted({
          id: Date.now(),
          ...payload,
          createdAt: new Date().toISOString().split('T')[0]
        });
      }
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
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
              Thank you, <strong className="text-slate-800">{formData.name}</strong>. Your inquiry for <strong className="text-slate-800">{formData.course}</strong> has been received by the EduPulse Academy admissions desk.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Contact Number:</span>
              <strong className="text-slate-800">{formData.phone}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Preferred Timing:</span>
              <span className="font-semibold text-slate-800">{formData.timing}</span>
            </div>
            <div className="flex justify-between">
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden">
        {/* Top Header Card */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
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
              <div className="relative">
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: digitsOnly });
                  }}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="10-digit number (e.g. 9876543210)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono font-medium"
                />
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
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-semibold"
                required
              >
                {courses.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name} {c.durationWeeks ? `(${c.durationWeeks} Weeks)` : ''}
                  </option>
                ))}
              </select>
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
            <select
              value={formData.timing}
              onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="Morning (09:00 AM - 11:30 AM)">Morning (09:00 AM - 11:30 AM)</option>
              <option value="Evening (06:30 PM - 08:30 PM)">Evening (06:30 PM - 08:30 PM)</option>
              <option value="Weekend (Sat-Sun 10:00 AM - 02:00 PM)">Weekend (Sat-Sun 10:00 AM - 02:00 PM)</option>
            </select>
          </div>

          {/* Current Status */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">
              Current Educational / Professional Background
            </label>
            <select
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="College Student (Final Year / Pre-final)">College Student (Final Year / Pre-final)</option>
              <option value="Working Professional (Looking to Upskill)">Working Professional (Looking to Upskill)</option>
              <option value="Recent Graduate / Fresher Seeking Job">Recent Graduate / Fresher Seeking Job</option>
              <option value="Career Switcher / Non-IT Transition">Career Switcher / Non-IT Transition</option>
            </select>
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

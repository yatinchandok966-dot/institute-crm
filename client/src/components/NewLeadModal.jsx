import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UserPlus,
  Edit3,
  AlertTriangle,
  Flame,
  Sun,
  Snowflake,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Building,
  BookOpen,
  Calendar,
  Clock,
  ShieldAlert
} from 'lucide-react';
import {
  LEAD_SOURCES,
  LEAD_PIPELINE_STAGES,
  LEAD_PRIORITIES,
  OFFICIAL_COURSES
} from '../data/constants';

export default function NewLeadModal({
  isOpen,
  onClose,
  onLeadCreated,
  onLeadUpdated,
  leadToEdit = null,
  courses = [],
  trainers = [],
  existingLeads = []
}) {
  const isEditMode = Boolean(leadToEdit);

  // Dynamically collect known counsellors (strictly exclude technical trainers)
  const availableCounselors = useMemo(() => {
    const set = new Set();
    // Names of all technical trainers to strictly exclude
    const technicalTrainerNames = new Set(
      (trainers || [])
        .filter(t => {
          const role = (t?.role || '').toLowerCase();
          return role.includes('technical trainer') || role === 'trainer';
        })
        .map(t => (t?.name || '').trim().toLowerCase())
    );

    // Only include staff designated as counsellors
    (trainers || []).forEach((t) => {
      if (!t || !t.name) return;
      const role = (t.role || '').toLowerCase();
      const dept = (t.department || '').toLowerCase();
      const isTrainer = role.includes('technical trainer') || role === 'trainer';
      const isCounselor = role.includes('counsel') || dept.includes('counsel');
      if (isCounselor && !isTrainer) {
        set.add(t.name.trim());
      }
    });

    // From existing leads, add counsellor names (only if not a technical trainer)
    (existingLeads || []).forEach((l) => {
      if (l.counselor && l.counselor !== 'Unassigned') {
        const cTrim = l.counselor.trim();
        if (!technicalTrainerNames.has(cTrim.toLowerCase())) {
          set.add(cTrim);
        }
      }
    });

    return Array.from(set).sort();
  }, [existingLeads, trainers]);

  // Consolidate all real courses from database and official constants
  const allCourseList = useMemo(() => {
    const map = new Map();
    (OFFICIAL_COURSES || []).forEach(c => {
      if (c && c.name) map.set(c.name.trim().toLowerCase(), c);
    });
    (courses || []).forEach(c => {
      if (!c) return;
      const cName = typeof c === 'string' ? c : c.name;
      if (cName && cName.trim()) {
        const key = cName.trim().toLowerCase();
        const existing = map.get(key);
        map.set(key, typeof c === 'object' ? { ...existing, ...c } : (existing || { name: cName }));
      }
    });
    return Array.from(map.values());
  }, [courses]);

  const initialForm = {
    name: '',
    phone: '',
    email: '',
    city: '',
    qualification: '',
    college: '',
    course: '',
    source: 'Website',
    counselor: '',
    status: 'New',
    priority: 'Warm',
    nextFollowUpDate: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (leadToEdit) {
      setFormData({
        name: leadToEdit.name || '',
        phone: leadToEdit.phone || '',
        email: leadToEdit.email || '',
        city: leadToEdit.city || '',
        qualification: leadToEdit.qualification || '',
        college: leadToEdit.college || '',
        course: leadToEdit.course || '',
        source: leadToEdit.source || 'Website',
        counselor: leadToEdit.counselor || '',
        status: leadToEdit.status || 'New',
        priority: leadToEdit.priority || 'Warm',
        nextFollowUpDate: leadToEdit.nextFollowUpDate || '',
        notes: leadToEdit.notes || ''
      });
    } else {
      // Default next follow-up date to tomorrow 11:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);
      const isoDateTime = tomorrow.toISOString().slice(0, 16);

      setFormData({
        ...initialForm,
        course: '',
        nextFollowUpDate: isoDateTime
      });
    }
    setError(null);
  }, [leadToEdit, isOpen]);

  // Normalize phone for comparison (removes all non-digit characters)
  const normalizePhone = (p) => (p || '').replace(/[^0-9]/g, '');

  // Real-time duplicate detection for Phone & Email
  const duplicateInfo = useMemo(() => {
    if (!formData.phone && !formData.email) return null;

    const currentNormPhone = normalizePhone(formData.phone);
    const currentEmail = (formData.email || '').trim().toLowerCase();

    for (const lead of existingLeads) {
      // Exclude current lead being edited
      if (isEditMode && lead.id === leadToEdit?.id) continue;

      const leadNormPhone = normalizePhone(lead.phone);
      const leadEmail = (lead.email || '').trim().toLowerCase();

      const phoneMatches = currentNormPhone && currentNormPhone.length >= 8 && (
        leadNormPhone === currentNormPhone ||
        leadNormPhone.endsWith(currentNormPhone) ||
        currentNormPhone.endsWith(leadNormPhone)
      );

      const emailMatches = currentEmail && leadEmail && leadEmail === currentEmail;

      if (phoneMatches || emailMatches) {
        return {
          lead,
          phoneMatches,
          emailMatches
        };
      }
    }
    return null;
  }, [formData.phone, formData.email, existingLeads, isEditMode, leadToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Full Name is required.');
      return;
    }

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      setError('Phone Number is required.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setError('Phone Number must be exactly 10 digits (digits only, no letters allowed).');
      return;
    }

    const cleanEmail = (formData.email || '').trim().toLowerCase();
    if (cleanEmail) {
      const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailPattern.test(cleanEmail)) {
        setError('Please enter a valid lowercase email address (e.g. name@gmail.com). Must contain @ and a valid domain.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      phone: cleanPhone,
      email: cleanEmail,
      course: formData.course.trim() || 'General Inquiry',
      counselor: formData.counselor.trim() || 'Unassigned',
      createdAt: isEditMode && leadToEdit?.createdAt ? leadToEdit.createdAt : new Date().toISOString().split('T')[0]
    };

    try {
      if (isEditMode) {
        const updated = { ...leadToEdit, ...payload };
        if (onLeadUpdated) onLeadUpdated(updated);
        onClose();
      } else {
        const newLead = {
          id: Date.now(),
          ...payload,
          notesList: formData.notes ? [
            {
              id: Date.now(),
              text: formData.notes,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              author: formData.counselor || 'System'
            }
          ] : [],
          callHistory: []
        };
        if (onLeadCreated) onLeadCreated(newLead);
        onClose();
      }
    } catch (err) {
      setError('Failed to save lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - Clean, modern, light header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isEditMode ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
              }`}>
              {isEditMode ? (
                <Edit3 className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {isEditMode ? `Edit Lead Details: ${leadToEdit.name}` : 'Add Prospective Lead'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditMode
                  ? 'Update prospective student profile and follow-up timeline'
                  : 'Capture complete lead details for admissions counseling'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with scrollable content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Real-time Duplicate Phone/Email Alert */}
          {duplicateInfo && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-xs">
                  Duplicate Detected: {duplicateInfo.phoneMatches && 'Phone Number'}
                  {duplicateInfo.phoneMatches && duplicateInfo.emailMatches && ' & '}
                  {duplicateInfo.emailMatches && 'Email Address'} Already In System
                </p>
                <p className="text-[11px] text-amber-800">
                  Matches existing lead <strong className="underline">{duplicateInfo.lead.name}</strong> ({duplicateInfo.lead.course}),
                  currently in <span className="font-semibold">{duplicateInfo.lead.status}</span> stage, assigned to{' '}
                  <span className="font-semibold">{duplicateInfo.lead.counselor}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Section: Basic Lead Information */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Lead Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Riya Kapoor"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${(formData.phone || '').length === 10 ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                    {(formData.phone || '').length}/10 digits
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Email Address
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    lowercase only (e.g. @gmail.com)
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      const lower = e.target.value.toLowerCase().replace(/[A-Z\s]/g, '').trim();
                      setFormData({ ...formData, email: lower });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="e.g. arpita@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 lowercase font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  City / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Pune, Mumbai, Bangalore"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Academic Background */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Academic Background
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Qualification
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. B.Tech CS, BCA, B.Sc, 12th Standard"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  College / University
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g. Pune University / PICT"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Course & Source */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Course & Channel Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Interested Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                >
                  <option value="">Select or enter course name</option>
                  {allCourseList.map((c) => (
                    <option key={c.id || c.code || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {formData.course && !allCourseList.some(c => c.name === formData.course) && (
                    <option value={formData.course}>{formData.course}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lead Source <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {LEAD_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Counseling & Assignment */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Assignment & Pipeline Tracking
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Counsellor
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={formData.counselor || 'Unassigned'}
                    onChange={(e) => setFormData({ ...formData, counselor: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {availableCounselors.map((c) => (
                      <option key={c} value={c}>
                        {c} (Counsellor)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lead Status (Pipeline)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {LEAD_PIPELINE_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lead Priority
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: 'Hot' })}
                    className={`py-1.5 rounded-lg border text-center font-bold flex items-center justify-center gap-1 transition-all ${formData.priority === 'Hot'
                      ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: 'Warm' })}
                    className={`py-1.5 rounded-lg border text-center font-bold flex items-center justify-center gap-1 transition-all ${formData.priority === 'Warm'
                      ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Warm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: 'Cold' })}
                    className={`py-1.5 rounded-lg border text-center font-bold flex items-center justify-center gap-1 transition-all ${formData.priority === 'Cold'
                      ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-xs'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <Snowflake className="w-3.5 h-3.5 text-sky-600" />
                    <span>Cold</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Next Follow-up Date & Time
              </label>
              <div className="relative max-w-sm">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="datetime-local"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-semibold text-slate-700 mb-1">
              Lead Notes / Counselor Remarks
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Interested in full-stack curriculum with placement guarantee. Attending demo class this weekend."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isEditMode ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>{loading ? 'Updating...' : 'Save Changes'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Add Lead'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

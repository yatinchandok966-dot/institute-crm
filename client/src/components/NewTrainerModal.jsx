import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Calendar,
  BookOpen,
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Check,
  Award
} from 'lucide-react';

const POPULAR_SKILLS = [
  'React.js',
  'Node.js',
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'Spring Boot',
  'Machine Learning',
  'Data Science',
  'SQL & Databases',
  'MongoDB',
  'Docker & DevOps',
  'AWS Cloud',
  'UI/UX Design',
  'Cybersecurity'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '09:00 AM - 11:30 AM',
  '10:00 AM - 12:30 PM',
  '11:30 AM - 02:00 PM',
  '02:00 PM - 04:30 PM',
  '04:30 PM - 07:00 PM',
  '06:00 PM - 08:30 PM',
  '07:00 PM - 09:30 PM',
  '10:00 AM - 01:00 PM (Weekend)',
  '02:00 PM - 05:00 PM (Weekend)'
];

export default function NewTrainerModal({
  isOpen,
  onClose,
  trainerToEdit,
  courses = [],
  batches = [],
  existingTrainers = [],
  defaultRole = 'Technical Trainer',
  defaultDepartment = 'Academic Faculty',
  onTrainerSaved
}) {
  const isEditMode = Boolean(trainerToEdit);

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    role: defaultRole,
    department: defaultDepartment,
    phone: '',
    email: '',
    qualification: '',
    experience: '2+ Years',
    status: 'Full Time',
    bio: '',
    skills: [],
    assignedCourses: [],
    assignedBatches: [],
    schedule: []
  });

  const isTrainer = formData.role === 'Technical Trainer';

  const [newSkillInput, setNewSkillInput] = useState('');
  const [error, setError] = useState(null);

  // Auto-generate next Employee ID when creating new trainer/counsellor
  useEffect(() => {
    if (isOpen) {
      if (trainerToEdit) {
        const normalizedRole = (trainerToEdit.role && trainerToEdit.role.toLowerCase().includes('counsel'))
          ? 'Admission Counsellor'
          : 'Technical Trainer';
        setFormData({
          ...trainerToEdit,
          role: normalizedRole,
          department: normalizedRole === 'Admission Counsellor' ? 'Counseling & Admissions' : 'Academic Faculty',
          status: trainerToEdit.status || 'Full Time',
          skills: trainerToEdit.skills || [],
          assignedCourses: trainerToEdit.assignedCourses || [],
          assignedBatches: trainerToEdit.assignedBatches || [],
          schedule: trainerToEdit.schedule || []
        });
      } else {
        const nextNum = (existingTrainers.length + 1).toString().padStart(3, '0');
        const role = defaultRole === 'Admission Counsellor' ? 'Admission Counsellor' : 'Technical Trainer';
        const dept = role === 'Admission Counsellor' ? 'Counseling & Admissions' : 'Academic Faculty';
        setFormData({
          employeeId: `EMP-2026-${nextNum}`,
          name: '',
          role: role,
          department: dept,
          phone: '',
          email: '',
          qualification: '',
          experience: '2+ Years',
          status: 'Full Time',
          bio: '',
          skills: [],
          assignedCourses: [],
          assignedBatches: [],
          schedule: []
        });
      }
      setError(null);
      setNewSkillInput('');
    }
  }, [isOpen, trainerToEdit, existingTrainers, defaultRole, defaultDepartment]);

  if (!isOpen) return null;

  // Add skill tag
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkillInput).trim();
    if (!trimmed) return;
    if (!formData.skills.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
    }
    setNewSkillInput('');
  };

  // Remove skill tag
  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Toggle assigned course
  const handleToggleCourse = (courseName) => {
    setFormData(prev => {
      const exists = prev.assignedCourses.includes(courseName);
      return {
        ...prev,
        assignedCourses: exists
          ? prev.assignedCourses.filter(c => c !== courseName)
          : [...prev.assignedCourses, courseName]
      };
    });
  };

  // Toggle assigned batch
  const handleToggleBatch = (batchName) => {
    setFormData(prev => {
      const exists = prev.assignedBatches.includes(batchName);
      return {
        ...prev,
        assignedBatches: exists
          ? prev.assignedBatches.filter(b => b !== batchName)
          : [...prev.assignedBatches, batchName]
      };
    });
  };

  // Add schedule slot
  const handleAddScheduleSlot = () => {
    const newSlot = {
      id: Date.now(),
      day: 'Monday',
      time: '09:00 AM - 11:30 AM',
      batch: '',
      course: '',
      room: '',
      mode: 'Classroom'
    };
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, newSlot]
    }));
  };

  // Update schedule slot
  const handleUpdateScheduleSlot = (slotId, field, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map(s => s.id === slotId ? { ...s, [field]: value } : s)
    }));
  };

  // Remove schedule slot
  const handleRemoveScheduleSlot = (slotId) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter(s => s.id !== slotId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Trainer / Employee Full Name is required.');
      return;
    }

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Phone Number must be exactly 10 digits (digits only, no letters allowed).');
      return;
    }

    const cleanEmail = (formData.email || '').trim().toLowerCase();
    if (cleanEmail) {
      const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailPattern.test(cleanEmail)) {
        setError('Please enter a valid lowercase email address (e.g. trainer@gmail.com).');
        return;
      }
    }

    const payload = {
      id: isEditMode && trainerToEdit?.id ? trainerToEdit.id : Date.now(),
      employeeId: formData.employeeId.trim() || `EMP-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      role: formData.role.trim() || 'Technical Trainer',
      department: formData.department.trim() || 'Academic Faculty',
      phone: cleanPhone,
      email: cleanEmail,
      qualification: formData.qualification.trim(),
      experience: formData.experience.trim() || '1+ Years',
      status: formData.status || 'Active',
      bio: formData.bio.trim(),
      skills: formData.skills,
      assignedCourses: formData.assignedCourses,
      assignedBatches: formData.assignedBatches,
      schedule: formData.schedule,
      joiningDate: isEditMode && trainerToEdit?.joiningDate ? trainerToEdit.joiningDate : new Date().toISOString().split('T')[0]
    };

    if (onTrainerSaved) {
      onTrainerSaved(payload, isEditMode);
    }
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditMode ? 'Edit Trainer / Employee' : 'Add Trainer / Employee'}
              </h3>
              <p className="text-xs text-slate-500">
                Record employee credentials, technical skills, assigned programs, and teaching timetable
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Profile Information */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>1. Basic Profile & Credentials</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="e.g. EMP-2026-001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
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
                    placeholder="e.g. Pooja Verma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Designation / Role <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold">Trainer or Counsellor</span>
                </div>
                <div className="space-y-1.5">
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const selectedRole = e.target.value;
                      const isCounselor = selectedRole === 'Admission Counsellor';
                      setFormData(prev => ({
                        ...prev,
                        role: selectedRole,
                        department: isCounselor ? 'Counseling & Admissions' : 'Academic Faculty'
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Technical Trainer">Technical Trainer</option>
                    <option value="Admission Counsellor">Admission Counsellor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Academic Faculty">Academic Faculty</option>
                  <option value="Technical Training">Technical Training</option>
                  <option value="Counseling & Admissions">Counseling & Admissions</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employment Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                </select>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Email Address
                  </label>
                  <span className="text-[10px] text-slate-400">
                    lowercase (e.g. @gmail.com)
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
                      if (e.key === ' ') e.preventDefault();
                    }}
                    placeholder="e.g. pooja@edupulse.org"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium lowercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Highest Qualification
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. M.Tech Computer Science / B.E."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Industry / Teaching Experience
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 5+ Years"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Sections 2, 3, 4: ONLY VISIBLE FOR TECHNICAL TRAINER */}
          {isTrainer && (
            <>
              {/* Section 2: Skills & Technical Expertise */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>2. Skills & Technical Expertise</span>
                </h4>

                {/* Selected Skills Chips */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {formData.skills.length === 0 ? (
                    <span className="text-slate-400 text-[11px] italic">No skills added yet. Click suggestions below or type custom skill.</span>
                  ) : (
                    formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-600 transition-colors"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Custom Skill Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill & press Enter (e.g. Next.js, FastAPI)..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold rounded-lg text-xs transition-colors"
                  >
                    + Add Skill
                  </button>
                </div>

                {/* Quick Suggestions */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                    Popular Suggestions (Click to Add):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.map((sk) => {
                      const isSelected = formData.skills.includes(sk);
                      return (
                        <button
                          key={sk}
                          type="button"
                          disabled={isSelected}
                          onClick={() => handleAddSkill(sk)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${isSelected
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 shadow-2xs'
                            }`}
                        >
                          + {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Assigned Courses & Batches */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>3. Assigned Courses & Batches</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Assigned Courses */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>Assigned Courses</span>
                      <span className="text-[10px] text-indigo-600 font-bold">
                        {formData.assignedCourses.length} Selected
                      </span>
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {courses.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No courses created yet in Courses module.</p>
                      ) : (
                        courses.map((c) => {
                          const isChecked = formData.assignedCourses.includes(c.name);
                          return (
                            <label
                              key={c.id || c.name}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${isChecked
                                ? 'bg-indigo-50 text-indigo-900 border-indigo-200 font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCourse(c.name)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="truncate text-xs">{c.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Assigned Batches */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>Assigned Batches / Cohorts</span>
                      <span className="text-[10px] text-indigo-600 font-bold">
                        {formData.assignedBatches.length} Selected
                      </span>
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {batches.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No batches created yet in Batches module.</p>
                      ) : (
                        batches.map((b) => {
                          const isChecked = formData.assignedBatches.includes(b.name);
                          return (
                            <label
                              key={b.id || b.name}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${isChecked
                                ? 'bg-indigo-50 text-indigo-900 border-indigo-200 font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleBatch(b.name)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="truncate text-xs">{b.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Weekly Teaching Schedule */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>4. Trainer Schedule & Class Slots</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddScheduleSlot}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1 border border-indigo-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Class Slot</span>
                  </button>
                </div>

                {formData.schedule.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs space-y-1">
                    <Clock className="w-6 h-6 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-600">No schedule slots configured yet.</p>
                    <p className="text-[11px] text-slate-400">Click &ldquo;Add Class Slot&rdquo; above to assign timetable slots (e.g. Mon/Wed/Fri mornings).</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.schedule.map((slot, index) => (
                      <div
                        key={slot.id || index}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                      >
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Day</label>
                          <select
                            value={slot.day}
                            onChange={(e) => handleUpdateScheduleSlot(slot.id, 'day', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Time Slot</label>
                          <select
                            value={slot.time || '09:00 AM - 11:30 AM'}
                            onChange={(e) => handleUpdateScheduleSlot(slot.id, 'time', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Batch / Course</label>
                          <input
                            type="text"
                            value={slot.batch || ''}
                            onChange={(e) => handleUpdateScheduleSlot(slot.id, 'batch', e.target.value)}
                            placeholder="Batch / Course"
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Room / Lab</label>
                          <input
                            type="text"
                            value={slot.room || ''}
                            onChange={(e) => handleUpdateScheduleSlot(slot.id, 'room', e.target.value)}
                            placeholder="Room / Lab"
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="flex items-center justify-end pt-3 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveScheduleSlot(slot.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Remove Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Section 5: Biography / Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isTrainer ? 'Trainer Bio / Instructor Overview' : 'Counsellor Bio / Professional Overview'}
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder={
                isTrainer
                  ? 'e.g. Specialist in React, TypeScript, and architectural patterns. Mentored 400+ students in web development...'
                  : 'e.g. Experienced career counselor advising prospective students on course curriculums, fee structures, and career roadmaps...'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditMode ? 'Save Changes' : (isTrainer ? 'Save Trainer Profile' : 'Save Counsellor Profile')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}

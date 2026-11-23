import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Award,
  BookOpen,
  CalendarDays,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  GraduationCap,
  Briefcase,
  Layers,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import NewTrainerModal from './NewTrainerModal';
import TrainerScheduleModal from './TrainerScheduleModal';

export default function TrainersModule({
  trainers = [],
  courses = [],
  batches = [],
  onTrainerCreated,
  onTrainerUpdated,
  onTrainerDeleted
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [counselorFilter, setCounselorFilter] = useState('All'); // Counsellor / Staff dropdown filter
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [modalPresetRole, setModalPresetRole] = useState({ role: 'Technical Trainer', dept: 'Academic Faculty' });
  const [selectedTrainerForSchedule, setSelectedTrainerForSchedule] = useState(null);
  const [deleteConfirmationTrainer, setDeleteConfirmationTrainer] = useState(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = trainers.length;
    const active = trainers.filter(t => t.status === 'Active').length;
    const onLeave = trainers.filter(t => t.status === 'On Leave').length;
    const counselors = trainers.filter(t =>
      (t.role || '').toLowerCase().includes('counsel') ||
      (t.department || '').toLowerCase().includes('counsel')
    ).length;

    // Unique courses covered
    const coursesCovered = new Set();
    trainers.forEach(t => {
      (t.assignedCourses || []).forEach(c => coursesCovered.add(c));
    });

    // Total active batches assigned
    const batchesAssigned = new Set();
    trainers.forEach(t => {
      (t.assignedBatches || []).forEach(b => batchesAssigned.add(b));
    });

    return {
      total,
      active,
      onLeave,
      counselors,
      trainersCount: total - counselors,
      coursesCount: coursesCovered.size,
      batchesCount: batchesAssigned.size
    };
  }, [trainers]);

  // Unique Counsellors for filter dropdown
  const uniqueCounselorsList = useMemo(() => {
    const set = new Set();
    trainers.forEach(t => {
      if (
        (t.role || '').toLowerCase().includes('counsel') ||
        (t.department || '').toLowerCase().includes('counsel')
      ) {
        if (t.name) set.add(t.name);
      }
    });
    return Array.from(set).sort();
  }, [trainers]);

  // Unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const set = new Set();
    trainers.forEach(t => t.role && set.add(t.role));
    return Array.from(set).sort();
  }, [trainers]);

  // Unique courses for filter
  const uniqueCourses = useMemo(() => {
    const set = new Set();
    (courses || []).forEach(c => c.name && set.add(c.name));
    trainers.forEach(t => (t.assignedCourses || []).forEach(c => set.add(c)));
    return Array.from(set).sort();
  }, [courses, trainers]);

  // Filtered trainers list
  const filteredTrainers = useMemo(() => {
    return trainers.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (t.name || '').toLowerCase().includes(q) ||
        (t.employeeId || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.phone || '').includes(q) ||
        (t.role || '').toLowerCase().includes(q) ||
        (t.skills || []).some(s => s.toLowerCase().includes(q)) ||
        (t.assignedCourses || []).some(c => c.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'All' || t.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter || (statusFilter === 'Full Time' && (t.status === 'Active' || !t.status));
      const matchesCourse = courseFilter === 'All' || (t.assignedCourses || []).includes(courseFilter);

      // Counsellor dropdown filter logic
      let matchesCounselor = true;
      if (counselorFilter === 'only_counselors') {
        matchesCounselor =
          (t.role || '').toLowerCase().includes('counsel') ||
          (t.department || '').toLowerCase().includes('counsel');
      } else if (counselorFilter === 'only_trainers') {
        matchesCounselor =
          !(t.role || '').toLowerCase().includes('counsel') &&
          !(t.department || '').toLowerCase().includes('counsel');
      } else if (counselorFilter !== 'All') {
        matchesCounselor = t.name === counselorFilter || t.role === counselorFilter;
      }

      return matchesSearch && matchesRole && matchesStatus && matchesCourse && matchesCounselor;
    });
  }, [trainers, searchQuery, roleFilter, statusFilter, courseFilter, counselorFilter]);

  // Helpers
  const formatPhoneNumber = (phone) => {
    if (!phone) return '—';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return phone;
  };

  const openWhatsApp = (trainer) => {
    const cleanPhone = (trainer.phone || '').replace(/\D/g, '');
    const msg = encodeURIComponent(`Hello ${trainer.name}, this is from EduPulse Academy administration regarding your schedule.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleOpenAddTrainer = () => {
    setEditingTrainer(null);
    setModalPresetRole({ role: 'Technical Trainer', dept: 'Academic Faculty' });
    setIsAddEditModalOpen(true);
  };

  const handleOpenAddCounsellor = () => {
    setEditingTrainer(null);
    setModalPresetRole({ role: 'Admission Counsellor', dept: 'Counseling & Admissions' });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (trainer) => {
    setEditingTrainer(trainer);
    setIsAddEditModalOpen(true);
  };

  const handleTrainerSaved = (savedData, isEdit) => {
    if (isEdit) {
      if (onTrainerUpdated) onTrainerUpdated(savedData);
    } else {
      if (onTrainerCreated) onTrainerCreated(savedData);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmationTrainer && onTrainerDeleted) {
      onTrainerDeleted(deleteConfirmationTrainer.id);
    }
    setDeleteConfirmationTrainer(null);
  };

  const handleUpdateSchedule = (trainerId, updatedSchedule) => {
    const trainer = trainers.find(t => t.id === trainerId);
    if (trainer && onTrainerUpdated) {
      onTrainerUpdated({
        ...trainer,
        schedule: updatedSchedule
      });
    }
  };

  const hasActiveFilters = searchQuery || roleFilter !== 'All' || statusFilter !== 'All' || courseFilter !== 'All' || counselorFilter !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
    setCourseFilter('All');
    setCounselorFilter('All');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Trainers / Employees
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {trainers.length} Total Faculty
            </span>
            {stats.counselors > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {stats.counselors} Counsellors
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage employee profiles, skills and expertise, assigned courses, batch allocations, and class schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenAddTrainer}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            title="Add a new Counsellor or Trainer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Counsellor & Trainer</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.total}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Recorded profiles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Active Faculty</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">{stats.active}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Currently teaching</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Courses Covered</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.coursesCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Curriculum mapped</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Batches</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.batchesCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Active student cohorts</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, employee ID, skills, course, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
                title="Profile Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
                title="Tabular List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Counsellor / Staff Filter Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Counsellor / Staff Filter
            </label>
            <select
              value={counselorFilter}
              onChange={(e) => setCounselorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Staff ({trainers.length})</option>
              <option value="only_counselors">Only Admission Counsellors ({stats.counselors})</option>
              <option value="only_trainers">Only Technical Trainers ({stats.trainersCount})</option>
              {uniqueCounselorsList.map(c => (
                <option key={c} value={c}>{c} (Counsellor)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Role / Designation
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Roles</option>
              {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Employment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Assigned Course
            </label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium truncate focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Courses ({uniqueCourses.length})</option>
              {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Content: Empty State / Cards Grid / Table View */}
      {filteredTrainers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs py-16 px-4 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-2xs">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {trainers.length === 0 ? 'No Trainers / Employees Recorded Yet' : 'No Matching Instructors Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {trainers.length === 0
                ? 'Create faculty profiles, tag technical skills, and assign courses & class schedules.'
                : 'Try adjusting your search query or dropdown filters to find instructors.'}
            </p>
          </div>
          <div className="pt-2">
            {trainers.length === 0 ? (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleOpenAddTrainer}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add Counsellor & Trainer</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: Rich Profile Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrainers.map((trainer) => {
            const sessionsCount = trainer.schedule?.length || 0;
            const isCounselor = (trainer.role || '').toLowerCase().includes('counsel') || (trainer.department || '').toLowerCase().includes('counsel');
            return (
              <div
                key={trainer.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Card Top: Avatar, Name, Employee ID, Status */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl border text-base font-black flex items-center justify-center shrink-0 shadow-2xs ${isCounselor
                          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700'
                          : 'bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-700'
                        }`}>
                        {(trainer.name || 'T').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                          {trainer.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {trainer.employeeId}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isCounselor
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            {trainer.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                      trainer.status === 'Part Time'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                    {trainer.status === 'Part Time' ? 'Part Time' : 'Full Time'}
                  </span>
                </div>

                {/* Qualification & Experience */}
                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium pt-1 border-t border-slate-100">
                  {trainer.qualification && (
                    <span className="inline-flex items-center gap-1 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{trainer.qualification}</span>
                    </span>
                  )}
                  {trainer.experience && (
                    <span className="inline-flex items-center gap-1 text-slate-500 shrink-0">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{trainer.experience}</span>
                    </span>
                  )}
                </div>

                {/* Contact Info with Quick Connect */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-800 font-mono font-semibold text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatPhoneNumber(trainer.phone)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openWhatsApp(trainer)}
                        className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-2xs"
                        title="Message on WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </button>
                      <a
                        href={`tel:${trainer.phone}`}
                        className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                        title="Call"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {trainer.email && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${trainer.email}`} className="truncate hover:text-indigo-600">
                        {trainer.email}
                      </a>
                    </div>
                  )}
                </div>

                    {/* For Counselors: clean counselor summary */}
                    {trainer.role === 'Admission Counsellor' ? (
                      <div className="space-y-2 pt-1">
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Admissions & Career Counseling
                          </span>
                          <p className="text-[11px] text-slate-600 line-clamp-3">
                            {trainer.bio || 'Admissions Counselor advising prospective students on IT & engineering programs.'}
                          </p>
                        </div>
                      </div>
                  ) : (
                  <>
                    {/* Skills & Expertise */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Skills & Expertise ({trainer.skills?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {trainer.skills && trainer.skills.length > 0 ? (
                          trainer.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-200 shadow-2xs"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No skills listed</span>
                        )}
                      </div>
                    </div>

                      {/* Assigned Courses & Batches */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Assigned Curriculum</span>
                          <span className="text-slate-500 font-mono">
                            {(trainer.assignedCourses?.length || 0)} courses • {(trainer.assignedBatches?.length || 0)} batches
                          </span>
                        </div>

                          <div className="flex flex-wrap gap-1">
                            {(trainer.assignedCourses || []).map((c) => (
                              <span
                                key={c}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded-md text-[10px] font-semibold border border-indigo-100 truncate max-w-[200px]"
                                title={c}
                              >
                                <BookOpen className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span className="truncate">{c}</span>
                              </span>
                            ))}

                        {(trainer.assignedBatches || []).map((b) => (
                          <span
                            key={b}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[10px] font-medium border border-slate-200 truncate max-w-[200px]"
                            title={b}
                          >
                            <CalendarDays className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{b}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                  )}
                </div>

                {/* Card Footer: Schedule Button & Actions */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  {trainer.role !== 'Admission Counsellor' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedTrainerForSchedule(trainer)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5"
                      title="View & manage class schedule"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Schedule ({sessionsCount})</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Admissions Desk
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(trainer)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmationTrainer(trainer)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors shadow-2xs"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW: Compact Row-by-Row Layout */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 select-none">
                <tr>
                  <th className="px-5 py-3.5 text-left whitespace-nowrap">Trainer / Employee</th>
                  <th className="px-4 py-3.5 text-left whitespace-nowrap">Employee ID</th>
                  <th className="px-4 py-3.5 text-left whitespace-nowrap">Designation & Status</th>
                  <th className="px-4 py-3.5 text-left whitespace-nowrap">Contact</th>
                  <th className="px-4 py-3.5 text-left whitespace-nowrap">Skills & Expertise</th>
                  <th className="px-4 py-3.5 text-left whitespace-nowrap">Assigned Courses & Batches</th>
                  <th className="px-4 py-3.5 text-left whitespace-nowrap">Schedule</th>
                  <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTrainers.map((trainer) => {
                  const sessionsCount = trainer.schedule?.length || 0;
                  return (
                    <tr key={trainer.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                            {(trainer.name || 'T').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{trainer.name}</div>
                            {trainer.email && (
                              <div className="text-[11px] text-slate-500 font-medium">{trainer.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-4 py-4 align-middle whitespace-nowrap">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 text-xs">
                          {trainer.employeeId}
                        </span>
                      </td>

                      {/* Role & Status */}
                      <td className="px-4 py-4 align-middle whitespace-nowrap">
                        {(() => {
                          const isCounselor = (trainer.role || '').toLowerCase().includes('counsel') || (trainer.department || '').toLowerCase().includes('counsel');
                          return (
                            <div>
                              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${isCounselor ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}>
                                {trainer.role}
                              </span>
                              <div>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${trainer.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : trainer.status === 'On Leave'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-300'
                                  }`}>
                                  {trainer.status}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4 align-middle whitespace-nowrap">
                        <div className="font-mono text-slate-800 font-semibold text-xs">
                          {formatPhoneNumber(trainer.phone)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <button
                            type="button"
                            onClick={() => openWhatsApp(trainer)}
                            className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`tel:${trainer.phone}`}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="px-4 py-4 align-middle max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {trainer.skills && trainer.skills.length > 0 ? (
                            trainer.skills.slice(0, 3).map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">—</span>
                          )}
                          {trainer.skills && trainer.skills.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">
                              +{trainer.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Courses & Batches */}
                      <td className="px-4 py-4 align-middle max-w-[200px]">
                        <div className="space-y-1">
                          {(trainer.assignedCourses || []).slice(0, 1).map(c => (
                            <div key={c} className="text-xs font-semibold text-slate-800 truncate" title={c}>
                              {c}
                            </div>
                          ))}
                          <div className="text-[10px] text-slate-500 font-medium">
                            {(trainer.assignedBatches?.length || 0)} active batches
                          </div>
                        </div>
                      </td>

                      {/* Schedule Button */}
                      <td className="px-4 py-4 align-middle whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedTrainerForSchedule(trainer)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3 text-indigo-600" />
                          <span>{sessionsCount} Sessions</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(trainer)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                            title="Edit Trainer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmationTrainer(trainer)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shadow-2xs"
                            title="Delete Trainer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Add / Edit Trainer Modal */}
      <NewTrainerModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingTrainer(null);
        }}
        trainerToEdit={editingTrainer}
        courses={courses}
        batches={batches}
        existingTrainers={trainers}
        defaultRole={modalPresetRole.role}
        defaultDepartment={modalPresetRole.dept}
        onTrainerSaved={handleTrainerSaved}
      />

      {/* 6. Schedule Timetable Modal */}
      <TrainerScheduleModal
        isOpen={Boolean(selectedTrainerForSchedule)}
        onClose={() => setSelectedTrainerForSchedule(null)}
        trainer={selectedTrainerForSchedule}
        courses={courses}
        batches={batches}
        onUpdateTrainerSchedule={handleUpdateSchedule}
      />

      {/* 7. Delete Confirmation Modal */}
      {deleteConfirmationTrainer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Delete Trainer Profile?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800">{deleteConfirmationTrainer.name}</strong> ({deleteConfirmationTrainer.employeeId})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmationTrainer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

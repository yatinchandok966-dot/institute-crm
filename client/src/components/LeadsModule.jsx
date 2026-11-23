import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  UserCheck,
  Calendar,
  Clock,
  QrCode,
  Flame,
  Sun,
  Snowflake,
  Edit3,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  Check,
  X,
  SlidersHorizontal,
  AlertTriangle,
  RefreshCw,
  LayoutGrid,
  List,
  Building,
  GraduationCap,
  MapPin,
  User,
  ChevronRight,
  PhoneCall,
  FileText
} from 'lucide-react';

import {
  LEAD_SOURCES,
  LEAD_PIPELINE_STAGES,
  LEAD_PRIORITIES,
  COUNSELLORS_LIST
} from '../data/mockData';

import NewLeadModal from './NewLeadModal';
import LeadNotesModal from './LeadNotesModal';
import ImportLeadsModal from './ImportLeadsModal';

export default function LeadsModule({
  leads = [],
  courses = [],
  onOpenShareQR,
  onUpdateLeadStatus,
  onConvertToAdmission,
  onLeadCreated,
  onLeadUpdated,
  onLeadDeleted,
  onBatchLeadsImported,
  onAssignCounsellor,
  onUpdateLeadPriority,
  onAddLeadNote,
  onLogLeadCall
}) {
  // View mode: 'table' | 'kanban'
  const [viewMode, setViewMode] = useState('table');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [counselorFilter, setCounselorFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [followUpFilter, setFollowUpFilter] = useState('All'); // 'All' | 'overdue' | 'today' | 'upcoming'

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [deleteConfirmationLead, setDeleteConfirmationLead] = useState(null);

  // Today reference (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }, []);

  // Helper to determine follow-up urgency status
  const getFollowUpStatus = (dateStr) => {
    if (!dateStr) return { type: 'none', label: 'Unscheduled', badgeClass: 'bg-slate-100 text-slate-500 border-slate-200' };

    const cleanDate = dateStr.slice(0, 10);
    if (cleanDate < todayStr) {
      return { type: 'overdue', label: 'Overdue', badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 font-bold' };
    }
    if (cleanDate === todayStr) {
      return { type: 'today', label: 'Due Today', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold' };
    }
    return { type: 'upcoming', label: 'Upcoming', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' };
  };

  // Follow-up reminder statistics
  const followUpStats = useMemo(() => {
    let overdue = 0;
    let today = 0;
    let upcoming = 0;

    leads.forEach((l) => {
      const status = getFollowUpStatus(l.nextFollowUpDate);
      if (status.type === 'overdue') overdue++;
      if (status.type === 'today') today++;
      if (status.type === 'upcoming') upcoming++;
    });

    return { overdue, today, upcoming };
  }, [leads, todayStr]);

  // Stage counts for recommended pipeline
  const pipelineCounts = useMemo(() => {
    const counts = {};
    LEAD_PIPELINE_STAGES.forEach((stage) => {
      counts[stage] = leads.filter((l) => l.status === stage).length;
    });
    return counts;
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Text Search across Name, Phone, Email, City, Qualification, College, Course, Counselor
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (lead.name || '').toLowerCase().includes(q) ||
        (lead.phone || '').includes(q) ||
        (lead.email || '').toLowerCase().includes(q) ||
        (lead.city || '').toLowerCase().includes(q) ||
        (lead.qualification || '').toLowerCase().includes(q) ||
        (lead.college || '').toLowerCase().includes(q) ||
        (lead.course || '').toLowerCase().includes(q) ||
        (lead.counselor || '').toLowerCase().includes(q);

      // 2. Source Filter
      const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;

      // 3. Status (Pipeline) Filter
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;

      // 4. Course Filter
      const matchesCourse = courseFilter === 'All' || lead.course === courseFilter;

      // 5. Counselor Filter
      const matchesCounselor = counselorFilter === 'All' || lead.counselor === counselorFilter;

      // 6. Priority Filter
      const matchesPriority = priorityFilter === 'All' || lead.priority === priorityFilter;

      // 7. Follow-up Reminder Filter
      const fuStatus = getFollowUpStatus(lead.nextFollowUpDate);
      const matchesFollowUp =
        followUpFilter === 'All' ||
        (followUpFilter === 'overdue' && fuStatus.type === 'overdue') ||
        (followUpFilter === 'today' && fuStatus.type === 'today') ||
        (followUpFilter === 'upcoming' && fuStatus.type === 'upcoming');

      return (
        matchesSearch &&
        matchesSource &&
        matchesStatus &&
        matchesCourse &&
        matchesCounselor &&
        matchesPriority &&
        matchesFollowUp
      );
    });
  }, [
    leads,
    searchQuery,
    sourceFilter,
    statusFilter,
    courseFilter,
    counselorFilter,
    priorityFilter,
    followUpFilter
  ]);

  // WhatsApp quick connect
  const openWhatsApp = (lead) => {
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${lead.name}, this is ${lead.counselor || 'our academic counselor'} from EduPulse Academy regarding your inquiry for ${lead.course}. Would you be free for a short counseling call today?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  // Export leads to CSV
  const handleExportCSV = (onlyFiltered = false) => {
    const listToExport = onlyFiltered ? filteredLeads : leads;

    const headers = [
      'Full Name',
      'Phone Number',
      'Email',
      'City',
      'Qualification',
      'College/University',
      'Interested Course',
      'Lead Source',
      'Assigned Counsellor',
      'Created Date',
      'Lead Status',
      'Next Follow-up Date',
      'Priority',
      'Notes'
    ];

    const escapeCSV = (val) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = listToExport.map((l) => [
      escapeCSV(l.name),
      escapeCSV(l.phone),
      escapeCSV(l.email),
      escapeCSV(l.city),
      escapeCSV(l.qualification),
      escapeCSV(l.college),
      escapeCSV(l.course),
      escapeCSV(l.source),
      escapeCSV(l.counselor),
      escapeCSV(l.createdAt),
      escapeCSV(l.status),
      escapeCSV(l.nextFollowUpDate),
      escapeCSV(l.priority),
      escapeCSV(l.notes)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset all filters
  const hasActiveFilters =
    searchQuery ||
    sourceFilter !== 'All' ||
    statusFilter !== 'All' ||
    courseFilter !== 'All' ||
    counselorFilter !== 'All' ||
    priorityFilter !== 'All' ||
    followUpFilter !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSourceFilter('All');
    setStatusFilter('All');
    setCourseFilter('All');
    setCounselorFilter('All');
    setPriorityFilter('All');
    setFollowUpFilter('All');
  };

  // Open Edit Modal
  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setIsAddEditModalOpen(true);
  };

  // Open Notes & Call History
  const handleOpenNotes = (lead) => {
    setSelectedLeadForNotes(lead);
    setIsNotesModalOpen(true);
  };

  // Delete Lead
  const handleConfirmDelete = () => {
    if (deleteConfirmationLead && onLeadDeleted) {
      onLeadDeleted(deleteConfirmationLead.id);
    }
    setDeleteConfirmationLead(null);
  };

  return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* 1. Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Leads & Inquiries
                </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {leads.length} Total Leads
                  </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage prospective inquiries, counselor allocations, duplicate checks, follow-ups, and admissions conversion.
              </p>
            </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* View Mode Toggle */}
                <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white shadow-2xs">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${viewMode === 'table'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden md:inline">Table</span>
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${viewMode === 'kanban'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                    title="Pipeline Kanban View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden md:inline">Pipeline</span>
                  </button>
                </div>

                {/* Import / Export */}
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg shadow-2xs transition-all hover:border-slate-400"
                  title="Bulk import leads from CSV"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Import CSV</span>
                </button>

                <button
                  onClick={() => handleExportCSV(false)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg shadow-2xs transition-all hover:border-slate-400"
                  title="Export all leads to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                {/* Share QR Form */}
                {onOpenShareQR && (
                  <button
                    onClick={onOpenShareQR}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg shadow-2xs transition-all hover:border-slate-400"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>QR Form</span>
                  </button>
                )}

                {/* Add Lead */}
                <button
                  onClick={() => {
                    setEditingLead(null);
                    setIsAddEditModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Lead</span>
                </button>
              </div>
            </div>

                {/* 2. Follow-Up Reminders Alert Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Overdue */}
                  <button
                    onClick={() => setFollowUpFilter(followUpFilter === 'overdue' ? 'All' : 'overdue')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${followUpFilter === 'overdue'
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
                        : 'bg-white border-rose-200 hover:bg-rose-50/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <div className="text-xs text-rose-800 font-bold uppercase tracking-wider">
                          Overdue Follow-ups
                        </div>
                        <div className="text-xs text-slate-500">Scheduled before today</div>
                      </div>
                    </div>
                    <span className="text-xl font-extrabold text-rose-700 font-mono">
                      {followUpStats.overdue}
                    </span>
                  </button>

                  {/* Due Today */}
                  <button
                    onClick={() => setFollowUpFilter(followUpFilter === 'today' ? 'All' : 'today')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${followUpFilter === 'today'
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                        : 'bg-white border-amber-200 hover:bg-amber-50/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">
                          Follow-ups Due Today
                        </div>
                        <div className="text-xs text-slate-500">Action required today</div>
                      </div>
                    </div>
                    <span className="text-xl font-extrabold text-amber-700 font-mono">
                      {followUpStats.today}
                    </span>
                  </button>

                  {/* Upcoming */}
                  <button
                    onClick={() => setFollowUpFilter(followUpFilter === 'upcoming' ? 'All' : 'upcoming')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${followUpFilter === 'upcoming'
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <PhoneCall className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-xs text-indigo-900 font-bold uppercase tracking-wider">
                          Upcoming Follow-ups
                        </div>
                        <div className="text-xs text-slate-500">Scheduled future calls</div>
                      </div>
                    </div>
                    <span className="text-xl font-extrabold text-indigo-700 font-mono">
                      {followUpStats.upcoming}
                    </span>
                  </button>
                </div>

                {/* 3. Recommended Lead Pipeline Stages Funnel */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 overflow-x-auto">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Recommended Lead Pipeline
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Click any stage to filter leads instantly
                    </span>
                  </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 min-w-[620px]">
                        {LEAD_PIPELINE_STAGES.map((stage, idx) => {
                          const isSelected = statusFilter === stage;
                          const count = pipelineCounts[stage] || 0;
                          return (
                            <button
                              key={stage}
                              onClick={() => setStatusFilter(isSelected ? 'All' : stage)}
                              className={`p-2.5 rounded-lg border text-left transition-all ${isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-400'
                                  }`}>
                                  {idx + 1}. Stage
                                </span>
                                <span className={`text-xs font-extrabold px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-800'
                                  }`}>
                                  {count}
                                </span>
                              </div>
                              <div className="text-xs font-bold mt-1 truncate" title={stage}>
                                {stage}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Comprehensive Filter Toolbar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                      {/* Top search & quick clear */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search leads by name, phone, email, city, qualification, college..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>

                        {hasActiveFilters && (
                          <button
                            onClick={handleResetFilters}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 self-start sm:self-auto transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reset All Filters</span>
                          </button>
                        )}
                      </div>

                      {/* Dropdown Filters: Source, Status, Course, Counsellor, Priority */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
                        {/* Source Filter */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Lead Source
                          </label>
                          <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
              <option value="All">All Sources ({leads.length})</option>
              {
                                LEAD_SOURCES.map((src) => (
                                  <option key={src} value={src}>{src}</option>
                                ))
                              }
            </select>
                        </div>

                          {/* Status Filter */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Pipeline Status
                            </label>
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="All">All Stages</option>
                                {
                                  LEAD_PIPELINE_STAGES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))
                                }
            </select>
                          </div>

                          {/* Course Filter */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Interested Course
                            </label>
                            <select
                              value={courseFilter}
                              onChange={(e) => setCourseFilter(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium truncate focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="All">All Courses</option>
                              {courses.map((c) => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Counselor Filter */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Assigned Counsellor
                            </label>
                            <select
                              value={counselorFilter}
                              onChange={(e) => setCounselorFilter(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="All">All Counsellors</option>
                              {COUNSELLORS_LIST.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          {/* Priority Filter */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Lead Priority
                            </label>
                            <select
                              value={priorityFilter}
                              onChange={(e) => setPriorityFilter(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="All">All Priorities</option>
                              {LEAD_PRIORITIES.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                                {/* 5. Main View: Table View OR Kanban View */ }
      {viewMode === 'table' ? (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                                        <tr>
                                          <th className="px-5 py-3.5">Lead Information</th>
                                          <th className="px-4 py-3.5">Contact & Actions</th>
                                          <th className="px-4 py-3.5">Interested Course</th>
                                          <th className="px-4 py-3.5">Source</th>
                                          <th className="px-4 py-3.5">Assigned Counsellor</th>
                                          <th className="px-3 py-3.5 text-center">Priority</th>
                                          <th className="px-4 py-3.5">Next Follow-up</th>
                                          <th className="px-4 py-3.5">Lead Status</th>
                                          <th className="px-5 py-3.5 text-right">Actions</th>
                                        </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                              {filteredLeads.length === 0 ? (
                                                <tr>
                                                  <td colSpan="9" className="py-12 text-center text-slate-400">
                                                    <div className="max-w-xs mx-auto space-y-2">
                                                      <User className="w-8 h-8 text-slate-300 mx-auto" />
                                                      <p className="font-semibold text-slate-600">No matching leads found</p>
                                                      <p className="text-[11px] text-slate-400">Try adjusting your filters or search query.</p>
                                                      {hasActiveFilters && (
                                                        <button
                                                          onClick={handleResetFilters}
                                                          className="mt-2 text-indigo-600 font-bold hover:underline"
                                                        >
                                                          Reset filters
                                                        </button>
                                                      )}
                                                    </div>
                                                  </td>
                                                </tr>
                                          ) : (
                  filteredLeads.map((lead) => {
                    const fuStatus = getFollowUpStatus(lead.nextFollowUpDate);
                                          const notesCount = (lead.notesList?.length) || (lead.notes ? 1 : 0);
                                          const callsCount = lead.callHistory?.length || 0;

                                          return (
                                          <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                            {/* 1. Lead Information */}
                                            <td className="px-5 py-3.5">
                                              <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                                              {lead.email && (
                                                <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                                                  {lead.email}
                                                </div>
                                              )}
                                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                                                {lead.city && (
                                                  <span className="inline-flex items-center gap-0.5 font-medium text-slate-600">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    {lead.city}
                                                  </span>
                                                )}
                                                {lead.qualification && (
                                                  <span className="inline-flex items-center gap-0.5 font-medium text-slate-600">
                                                    <GraduationCap className="w-3 h-3 text-slate-400" />
                                                    {lead.qualification}
                                                  </span>
                                                )}
                                              </div>
                                              {lead.college && (
                                                <div className="text-[10px] text-slate-400 italic truncate max-w-[200px] mt-0.5">
                                                  {lead.college}
                                                </div>
                                              )}
                                            </td>

                                            {/* 2. Phone & Quick Connect */}
                                            <td className="px-4 py-3.5">
                                              <div className="font-mono text-slate-800 font-semibold text-[11px]">
                                                {lead.phone}
                                              </div>
                                              <div className="flex items-center gap-1.5 mt-1.5">
                                                <button
                                                  onClick={() => openWhatsApp(lead)}
                                                  className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                                                  title="Message on WhatsApp"
                                                >
                                                  <MessageSquare className="w-3.5 h-3.5" />
                                                </button>
                                                <a
                                                  href={`tel:${lead.phone}`}
                                                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                                                  title="Call Phone Number"
                                                >
                                                  <Phone className="w-3.5 h-3.5" />
                                                </a>
                                                <button
                                                  onClick={() => handleOpenNotes(lead)}
                                                  className="px-1.5 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold transition-colors flex items-center gap-1"
                                                  title="Notes & Call History"
                                                >
                                                  <FileText className="w-3 h-3" />
                                                  <span>{notesCount + callsCount}</span>
                                                </button>
                                              </div>
                                            </td>

                                            {/* 3. Interested Course */}
                                            <td className="px-4 py-3.5 text-slate-800 font-semibold max-w-[190px]">
                                              <div className="truncate" title={lead.course}>{lead.course}</div>
                                            </td>

                                            {/* 4. Lead Source */}
                                            <td className="px-4 py-3.5">
                                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                {lead.source || 'Website'}
                                              </span>
                                            </td>

                                            {/* 5. Assigned Counsellor with quick reassignment */}
                                            <td className="px-4 py-3.5">
                                              <select
                                                value={lead.counselor || 'Pooja Verma'}
                                                onChange={(e) => {
                                                  if (onAssignCounsellor) {
                                                    onAssignCounsellor(lead.id, e.target.value);
                                                  } else if (onLeadUpdated) {
                                                    onLeadUpdated({ ...lead, counselor: e.target.value });
                                                  }
                                                }}
                                                className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none"
                                                title="Reassign lead to employee"
                                              >
                                                {COUNSELLORS_LIST.map((c) => (
                                                  <option key={c} value={c}>{c}</option>
                                                ))}
                                              </select>
                                            </td>

                                            {/* 6. Lead Priority */}
                                            <td className="px-3 py-3.5 text-center">
                                              <select
                                                value={lead.priority || 'Warm'}
                                                onChange={(e) => {
                                                  if (onUpdateLeadPriority) {
                                                    onUpdateLeadPriority(lead.id, e.target.value);
                                                  } else if (onLeadUpdated) {
                                                    onLeadUpdated({ ...lead, priority: e.target.value });
                                                  }
                                                }}
                                                className={`text-[10px] font-bold rounded-full px-2 py-0.5 border cursor-pointer focus:outline-none ${lead.priority === 'Hot'
                                                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                                                    : lead.priority === 'Warm'
                                                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                                  }`}
                                              >
                                                {LEAD_PRIORITIES.map((p) => (
                                                  <option key={p} value={p}>{p}</option>
                                                ))}
                                              </select>
                                            </td>

                                            {/* 7. Next Follow-up Date */}
                                            <td className="px-4 py-3.5">
                                              {lead.nextFollowUpDate ? (
                                                <div className="space-y-0.5">
                                                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${fuStatus.badgeClass}`}>
                                                    <Clock className="w-3 h-3" />
                                                    <span>{fuStatus.label}</span>
                                                  </span>
                                                  <div className="text-[10px] text-slate-500 font-mono">
                                                    {lead.nextFollowUpDate.replace('T', ' ')}
                                                  </div>
                                                </div>
                                              ) : (
                                                <span className="text-[10px] text-slate-400 italic">Unscheduled</span>
                                              )}
                                            </td>

                                            {/* 8. Lead Status (Pipeline) */}
                                            <td className="px-4 py-3.5">
                                              <select
                                                value={lead.status}
                                                onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
                                                className="text-[11px] font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
                                              >
                                                {LEAD_PIPELINE_STAGES.map((s) => (
                                                  <option key={s} value={s}>{s}</option>
                                                ))}
                                              </select>
                                            </td>

                                            {/* 9. Actions: Convert to Admission, Edit, Delete */}
                                            <td className="px-5 py-3.5 text-right">
                                              <div className="inline-flex items-center gap-1.5">
                                                {/* Convert to Admission */}
                                                <button
                                                  onClick={() => onConvertToAdmission(lead)}
                                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors border border-indigo-200 inline-flex items-center gap-1"
                                                  title="Convert directly to formal student admission"
                                                >
                                                  <UserCheck className="w-3.5 h-3.5" />
                                                  <span className="hidden xl:inline">Convert →</span>
                                                </button>

                                                {/* Edit */}
                                                <button
                                                  onClick={() => handleOpenEdit(lead)}
                                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                                  title="Edit Lead"
                                                >
                                                  <Edit3 className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                  onClick={() => setDeleteConfirmationLead(lead)}
                                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                                  title="Delete Lead"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                          );
                  })
                )}
                                        </tbody>
                                    </table>
                                  </div>
                                </div>
                            ) : (
                            /* Kanban Pipeline View */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                              {LEAD_PIPELINE_STAGES.map((stage) => {
                                const stageLeads = filteredLeads.filter((l) => l.status === stage);
                                return (
                                  <div
                                    key={stage}
                                    className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col max-h-[750px]"
                                  >
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                                      <h3 className="font-bold text-xs text-slate-800 truncate" title={stage}>
                                        {stage}
                                      </h3>
                                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                                        {stageLeads.length}
                                      </span>
                                    </div>

                                    {/* Cards Container */}
                                    <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
                                      {stageLeads.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400 text-xs italic">
                                          No leads
                                        </div>
                                      ) : (
                                        stageLeads.map((lead) => {
                                          const fuStatus = getFollowUpStatus(lead.nextFollowUpDate);
                                          return (
                                            <div
                                              key={lead.id}
                                              className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-all text-xs"
                                            >
                                              <div className="flex items-start justify-between gap-1.5">
                                                <div>
                                                  <div className="font-bold text-slate-900 text-xs">{lead.name}</div>
                                                  <div className="text-[10px] font-mono text-slate-500">{lead.phone}</div>
                                                </div>
                                                <span
                                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${lead.priority === 'Hot'
                                                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                                                      : lead.priority === 'Warm'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                                                        : 'bg-slate-100 text-slate-700 border-slate-300'
                                                    }`}
                                                >
                                                  {lead.priority || 'Warm'}
                                                </span>
                                              </div>

                                              <div className="text-[11px] text-slate-700 font-semibold truncate" title={lead.course}>
                                                {lead.course}
                                              </div>

                                              {lead.nextFollowUpDate && (
                                                <div className="flex items-center gap-1 text-[10px]">
                                                  <span className={`px-1.5 py-0.2 rounded-full border font-bold ${fuStatus.badgeClass}`}>
                                                    {fuStatus.label}
                                                  </span>
                                                  <span className="text-slate-400 font-mono text-[9px]">
                                                    {lead.nextFollowUpDate.slice(5, 16)}
                                                  </span>
                                                </div>
                                              )}

                                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                                                <span>{lead.counselor}</span>
                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                                  {lead.source}
                                                </span>
                                              </div>

                                              {/* Quick stage transition dropdown */}
                                              <div className="flex items-center justify-between gap-1 pt-1">
                                                <select
                                                  value={lead.status}
                                                  onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
                                                  className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 w-full focus:outline-none"
                                                >
                                                  {LEAD_PIPELINE_STAGES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                  ))}
                                                </select>

                                                <button
                                                  onClick={() => handleOpenNotes(lead)}
                                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                  title="Notes & Call History"
                                                >
                                                  <FileText className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => onConvertToAdmission(lead)}
                                                  className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                                                  title="Convert to Admission"
                                                >
                                                  <UserCheck className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
      )}

                            {/* 6. Add / Edit Lead Modal */}
                            <NewLeadModal
                              isOpen={isAddEditModalOpen}
                              onClose={() => {
                                setIsAddEditModalOpen(false);
                                setEditingLead(null);
                              }}
                              leadToEdit={editingLead}
                              courses={courses}
                              existingLeads={leads}
                              onLeadCreated={onLeadCreated}
                              onLeadUpdated={onLeadUpdated}
                            />

                            {/* 7. Lead Notes & Call History Modal */}
                            <LeadNotesModal
                              isOpen={isNotesModalOpen}
                              onClose={() => {
                                setIsNotesModalOpen(false);
                                setSelectedLeadForNotes(null);
                              }}
                              lead={selectedLeadForNotes}
                              onAddNote={(leadId, note) => {
                                if (onAddLeadNote) onAddLeadNote(leadId, note);
                                // Also update selected lead preview
                                setSelectedLeadForNotes((prev) =>
                                  prev ? { ...prev, notesList: [note, ...(prev.notesList || [])] } : null
                                );
                              }}
                              onLogCall={(leadId, call, nextFollowUp) => {
                                if (onLogLeadCall) onLogLeadCall(leadId, call, nextFollowUp);
                                setSelectedLeadForNotes((prev) =>
                                  prev
                                    ? {
                                      ...prev,
                                      callHistory: [call, ...(prev.callHistory || [])],
                                      ...(nextFollowUp ? { nextFollowUpDate: nextFollowUp } : {})
                                    }
                                    : null
                                );
                              }}
                            />

                            {/* 8. CSV Bulk Import Modal */}
                            <ImportLeadsModal
                              isOpen={isImportModalOpen}
                              onClose={() => setIsImportModalOpen(false)}
                              existingLeads={leads}
                              courses={courses}
                              onImportLeads={(newLeads) => {
                                if (onBatchLeadsImported) onBatchLeadsImported(newLeads);
                              }}
                            />

                            {/* 9. Delete Confirmation Dialog */}
                            {deleteConfirmationLead && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 text-xs">
                                  <div className="flex items-center gap-2.5 text-rose-600 font-bold text-sm">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span>Confirm Delete Lead</span>
                                  </div>
                                  <p className="text-slate-600">
                                    Are you sure you want to permanently delete prospective lead{' '}
                                    <strong className="text-slate-900">{deleteConfirmationLead.name}</strong> (
                                    {deleteConfirmationLead.phone})? This action cannot be undone.
                                  </p>
                                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                                    <button
                                      onClick={() => setDeleteConfirmationLead(null)}
                                      className="px-3.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleConfirmDelete}
                                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                                    >
                                      Delete Lead
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                        );
}

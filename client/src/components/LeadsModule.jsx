import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { formatWhatsAppPhone } from '../utils/phone';
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
  Check,
  X,
  SlidersHorizontal,
  AlertTriangle,
  RefreshCw,
  Building,
  GraduationCap,
  MapPin,
  User,
  ChevronRight,
  PhoneCall,
  FileText,
  Sparkles,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CalendarClock,
  Layers,
  BookOpen,
  ArrowRight
} from 'lucide-react';

import {
  LEAD_SOURCES,
  LEAD_PIPELINE_STAGES,
  LEAD_PRIORITIES
} from '../data/constants';

import NewLeadModal from './NewLeadModal';
import LeadNotesModal from './LeadNotesModal';
import ImportLeadsModal from './ImportLeadsModal';

export default function LeadsModule({
  leads = [],
  admissions = [],
  courses = [],
  trainers = [],
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
    return { type: 'upcoming', label: 'Upcoming', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold' };
  };

  // Helper to format 10-digit phone number cleanly
  const formatPhoneNumber = (phone) => {
    if (!phone) return '—';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return phone;
  };

  // Helper to format follow-up date and time nicely
  const formatFollowUpDate = (dateStr) => {
    if (!dateStr) return { date: 'Unscheduled', time: '' };
    try {
      const parts = dateStr.includes('T') ? dateStr.split('T') : dateStr.split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || '';

      const [year, month, day] = datePart.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = months[parseInt(month, 10) - 1] || month;
      const formattedDate = `${day} ${monthName} ${year}`;

      let formattedTime = '';
      if (timePart) {
        const [hourStr, minStr] = timePart.split(':');
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        formattedTime = `${String(hour).padStart(2, '0')}:${minStr || '00'} ${ampm}`;
      }

      return { date: formattedDate, time: formattedTime };
    } catch {
      return { date: dateStr.replace('T', ' '), time: '' };
    }
  };

  // Admitted student identifiers to strictly exclude confirmed admissions from Leads page
  const admittedPhoneSet = useMemo(() => {
    const s = new Set();
    (admissions || []).forEach(a => {
      const p = String(a.phone || '').replace(/\D/g, '').slice(-10);
      if (p) s.add(p);
    });
    return s;
  }, [admissions]);

  const admittedNameSet = useMemo(() => {
    const s = new Set();
    (admissions || []).forEach(a => {
      const n = (a.studentName || a.student_name || '').trim().toLowerCase();
      if (n) s.add(n);
    });
    return s;
  }, [admissions]);

  // Clean unadmitted leads list (confirmed admissions are never shown on the Leads page)
  const unadmittedLeads = useMemo(() => {
    return leads.filter((l) => {
      if (!l) return false;
      const cleanP = String(l.phone || '').replace(/\D/g, '').slice(-10);
      const cleanN = (l.name || '').trim().toLowerCase();
      if (l.status === 'Lead Confirmed (Admitted)' || l.status === 'Admitted' || l.status === 'Converted') return false;
      if (cleanP && admittedPhoneSet.has(cleanP)) return false;
      if (cleanN && admittedNameSet.has(cleanN)) return false;
      return true;
    });
  }, [leads, admittedPhoneSet, admittedNameSet]);

  // Follow-up reminder statistics
  const followUpStats = useMemo(() => {
    let overdue = 0;
    let today = 0;
    let upcoming = 0;

    unadmittedLeads.forEach((l) => {
      const status = getFollowUpStatus(l.nextFollowUpDate);
      if (status.type === 'overdue') overdue++;
      if (status.type === 'today') today++;
      if (status.type === 'upcoming') upcoming++;
    });

    return { overdue, today, upcoming };
  }, [unadmittedLeads, todayStr]);

  // Dynamic unique courses from real courses and real leads (no fake defaults)
  const uniqueCourses = useMemo(() => {
    const set = new Set();
    (courses || []).forEach(c => c.name && set.add(c.name));
    unadmittedLeads.forEach(l => l.course && set.add(l.course));
    return Array.from(set).sort();
  }, [courses, unadmittedLeads]);

  // Dynamic unique counsellors from staff and actual leads (strictly exclude technical trainers)
  const uniqueCounselors = useMemo(() => {
    const set = new Set();
    const technicalTrainerNames = new Set(
      (trainers || [])
        .filter(t => {
          const role = (t?.role || '').toLowerCase();
          return role.includes('technical trainer') || role === 'trainer';
        })
        .map(t => (t?.name || '').trim().toLowerCase())
    );

    (trainers || []).forEach(t => {
      if (!t || !t.name) return;
      const role = (t.role || '').toLowerCase();
      const dept = (t.department || '').toLowerCase();
      const isTrainer = role.includes('technical trainer') || role === 'trainer';
      const isCounselor = role.includes('counsel') || dept.includes('counsel');
      if (isCounselor && !isTrainer) {
        set.add(t.name.trim());
      }
    });

    unadmittedLeads.forEach(l => {
      if (l.counselor && l.counselor !== 'Unassigned') {
        const cTrim = l.counselor.trim();
        if (!technicalTrainerNames.has(cTrim.toLowerCase())) {
          set.add(cTrim);
        }
      }
    });
    return Array.from(set).sort();
  }, [unadmittedLeads, trainers]);

  // Filtered Leads (with automatic deduplication by phone number)
  const filteredLeads = useMemo(() => {
    const rawList = unadmittedLeads.filter((lead) => {
      // 1. Text Search across Name, Phone, Email, City, Qualification, College, Course, Counselor
      const q = searchQuery.toLowerCase().trim();
      let matchesSearch = true;
      if (q) {
        const nameStr = (lead.name || '').toLowerCase();
        const phoneClean = (lead.phone || '').replace(/\D/g, '');
        const qDigits = q.replace(/\D/g, '');
        const emailStr = (lead.email || '').toLowerCase();
        const cityStr = (lead.city || '').toLowerCase();
        const collegeStr = (lead.college || '').toLowerCase();
        const courseStr = (lead.course || '').toLowerCase();
        const counselorStr = (lead.counselor || '').toLowerCase();

        // Check if query matches any lead by name
        const anyNameMatch = leads.some(l => (l.name || '').toLowerCase().includes(q));

        if (anyNameMatch) {
          // If query matches a person's name (e.g. "arpita"), strictly filter to that person so other records with email overlap are excluded
          matchesSearch = nameStr.includes(q);
        } else if (qDigits.length >= 3 && phoneClean.includes(qDigits)) {
          matchesSearch = true;
        } else if (q.includes('@')) {
          matchesSearch = emailStr.includes(q);
        } else {
          matchesSearch =
            nameStr.includes(q) ||
            (qDigits.length >= 3 && phoneClean.includes(qDigits)) ||
            emailStr.includes(q) ||
            cityStr.includes(q) ||
            collegeStr.includes(q) ||
            courseStr.includes(q) ||
            counselorStr.includes(q);
        }
      }

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

    // Guarantee uniqueness: no duplicate leads with identical 10-digit phone
    const seenPhones = new Set();
    return rawList.filter((l) => {
      if (!l) return false;
      const cleanPhone = String(l.phone || '').replace(/\D/g, '').slice(-10);
      const key = cleanPhone ? `phone_${cleanPhone}` : `id_${l.id}`;
      if (seenPhones.has(key)) return false;
      seenPhones.add(key);
      return true;
    });
  }, [
    unadmittedLeads,
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
    const cleanPhone = formatWhatsAppPhone(lead.phone);
    if (!cleanPhone) return;
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

        {/* Action Buttons (Table View Only - Pipeline View Removed) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Import CSV */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg shadow-2xs transition-all hover:border-slate-400"
            title="Bulk import leads from CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* Export CSV */}
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

      {/* 2. Elevated Follow-Up Reminder Cards (Increased Height & Presence) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Overdue Follow-ups */}
        <div
          onClick={() => setFollowUpFilter(followUpFilter === 'overdue' ? 'All' : 'overdue')}
          className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 border transition-all duration-200 cursor-pointer group bg-white min-h-[135px] flex flex-col justify-between ${
            followUpFilter === 'overdue'
              ? 'border-rose-400 ring-2 ring-rose-300 shadow-md bg-rose-50/40'
              : 'border-slate-200/90 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-rose-600" />
              {followUpStats.overdue > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 border border-white"></span>
                </span>
              )}
            </div>

            <div className="text-right">
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight block ${
                followUpStats.overdue > 0 ? 'text-rose-600' : 'text-slate-400'
              }`}>
                {followUpStats.overdue}
              </span>
            </div>
          </div>

          <div className="mt-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Overdue Follow-ups
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Scheduled prior to today
            </p>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {followUpFilter === 'overdue' ? (
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <span>Active Filter</span>
                <span className="text-rose-500 font-normal">✕</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium group-hover:text-rose-600 transition-colors">
                Action required immediately
              </span>
            )}
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              {followUpFilter === 'overdue' ? 'Showing filtered' : 'Filter leads →'}
            </span>
          </div>
        </div>

        {/* Card 2: Follow-ups Due Today */}
        <div
          onClick={() => setFollowUpFilter(followUpFilter === 'today' ? 'All' : 'today')}
          className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 border transition-all duration-200 cursor-pointer group bg-white min-h-[135px] flex flex-col justify-between ${
            followUpFilter === 'today'
              ? 'border-amber-400 ring-2 ring-amber-300 shadow-md bg-amber-50/40'
              : 'border-slate-200/90 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6 text-amber-600" />
              {followUpStats.today > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white"></span>
                </span>
              )}
            </div>

            <div className="text-right">
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight block ${
                followUpStats.today > 0 ? 'text-amber-600' : 'text-slate-400'
              }`}>
                {followUpStats.today}
              </span>
            </div>
          </div>

          <div className="mt-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Follow-ups Due Today
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Action required today
            </p>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {followUpFilter === 'today' ? (
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <span>Active Filter</span>
                <span className="text-amber-600 font-normal">✕</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium group-hover:text-amber-600 transition-colors">
                Today's counseling queue
              </span>
            )}
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              {followUpFilter === 'today' ? 'Showing filtered' : 'Filter leads →'}
            </span>
          </div>
        </div>

        {/* Card 3: Upcoming Follow-ups */}
        <div
          onClick={() => setFollowUpFilter(followUpFilter === 'upcoming' ? 'All' : 'upcoming')}
          className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 border transition-all duration-200 cursor-pointer group bg-white min-h-[135px] flex flex-col justify-between ${
            followUpFilter === 'upcoming'
              ? 'border-indigo-400 ring-2 ring-indigo-300 shadow-md bg-indigo-50/40'
              : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <PhoneCall className="w-6 h-6 text-indigo-600" />
            </div>

            <div className="text-right">
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight block ${
                followUpStats.upcoming > 0 ? 'text-indigo-600' : 'text-slate-400'
              }`}>
                {followUpStats.upcoming}
              </span>
            </div>
          </div>

          <div className="mt-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Upcoming Follow-ups
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Scheduled future calls
            </p>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {followUpFilter === 'upcoming' ? (
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <span>Active Filter</span>
                <span className="text-indigo-600 font-normal">✕</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium group-hover:text-indigo-600 transition-colors">
                Future calendar pipeline
              </span>
            )}
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              {followUpFilter === 'upcoming' ? 'Showing filtered' : 'Filter leads →'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
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
              {LEAD_SOURCES.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
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
              {LEAD_PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
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
              <option value="All">All Courses {uniqueCourses.length > 0 ? `(${uniqueCourses.length})` : ''}</option>
              {uniqueCourses.map((cName) => (
                <option key={cName} value={cName}>{cName}</option>
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
              <option value="All">All Counsellors {uniqueCounselors.length > 0 ? `(${uniqueCounselors.length})` : ''}</option>
              {uniqueCounselors.map((c) => (
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

      {/* 5. Professional Leads Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-left text-xs border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '16%' }} className="w-[16%] min-w-[210px]" /> {/* 1. Lead Information */}
              <col style={{ width: '11%' }} className="w-[11%] min-w-[145px]" /> {/* 2. Contact */}
              <col style={{ width: '12%' }} className="w-[12%] min-w-[155px]" /> {/* 3. Interested Course */}
              <col style={{ width: '8%' }} className="w-[8%] min-w-[100px]" />   {/* 4. Source */}
              <col style={{ width: '14%' }} className="w-[14%] min-w-[170px]" /> {/* 5. Assigned Counsellor */}
              <col style={{ width: '8%' }} className="w-[8%] min-w-[100px]" />   {/* 6. Priority */}
              <col style={{ width: '11%' }} className="w-[11%] min-w-[140px]" /> {/* 7. Next Follow-Up */}
              <col style={{ width: '9%' }} className="w-[9%] min-w-[110px]" />   {/* 8. Lead Status */}
              <col style={{ width: '11%' }} className="w-[11%] min-w-[145px]" /> {/* 9. Actions */}
            </colgroup>
            <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 select-none">
              <tr>
                <th className="pl-5 pr-3 py-3.5 text-left whitespace-nowrap">Lead Information</th>
                <th className="px-3 py-3.5 text-left whitespace-nowrap">Contact</th>
                <th className="px-3 py-3.5 text-left whitespace-nowrap">Interested Course</th>
                <th className="px-3 py-3.5 text-left whitespace-nowrap">Source</th>
                <th className="px-3 py-3.5 text-left whitespace-nowrap">Assigned Counsellor</th>
                <th className="px-3 py-3.5 text-left whitespace-nowrap">Priority</th>
                <th className="px-3 py-3.5 text-left whitespace-nowrap">Next Follow-Up</th>
                <th className="px-3 py-3.5 text-left whitespace-nowrap">Lead Status</th>
                <th className="pl-3 pr-5 py-3.5 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    {leads.length === 0 ? (
                      <div className="max-w-md mx-auto space-y-3 py-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-2xs">
                          <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">No Leads Recorded Yet</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Start building your inquiry pipeline by recording prospective students or importing records.
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLead(null);
                              setIsAddEditModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Add First Lead</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs shadow-2xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <Upload className="w-4 h-4 text-slate-500" />
                            <span>Import CSV</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-xs mx-auto space-y-2">
                        <User className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-600">No matching leads found</p>
                        <p className="text-[11px] text-slate-400">Try adjusting your filters or search query.</p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-2 text-indigo-600 font-bold hover:underline"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const fuStatus = getFollowUpStatus(lead.nextFollowUpDate);
                  const notesCount = (lead.notesList?.length) || (lead.notes ? 1 : 0);
                  const callsCount = lead.callHistory?.length || 0;
                  const fuFormatted = formatFollowUpDate(lead.nextFollowUpDate);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Lead Information */}
                      <td className="pl-5 pr-3.5 py-3.5 align-middle overflow-hidden">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {(lead.name || 'L').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 text-xs leading-tight truncate" title={lead.name}>
                              {lead.name}
                            </div>
                            {lead.email && (
                              <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5" title={lead.email}>
                                {lead.email}
                              </div>
                            )}
                            {(lead.city || lead.qualification || lead.college) && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 truncate">
                                {lead.city && (
                                   <span className="inline-flex items-center gap-0.5 font-medium text-slate-600 shrink-0">
                                     <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                     <span>{lead.city}</span>
                                   </span>
                                )}
                                {(lead.qualification || lead.college) && (
                                   <span className="inline-flex items-center gap-0.5 font-medium text-slate-500 truncate" title={[lead.qualification, lead.college].filter(Boolean).join(' • ')}>
                                     <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                                     <span className="truncate">
                                       {[lead.qualification, lead.college].filter(Boolean).join(' • ')}
                                     </span>
                                   </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Phone & Quick Connect */}
                      <td className="px-3.5 py-3.5 align-middle whitespace-nowrap overflow-hidden">
                        <div className="font-mono text-slate-800 font-bold text-xs tracking-tight">
                          {formatPhoneNumber(lead.phone)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => openWhatsApp(lead)}
                            className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-colors shadow-2xs"
                            title="Message on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </button>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                            title="Call Phone Number"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenNotes(lead)}
                            className="px-1.5 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                            title="Notes & Call History"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            <span>{notesCount + callsCount}</span>
                          </button>
                        </div>
                      </td>

                      {/* 3. Interested Course */}
                      <td className="px-3.5 py-3.5 align-middle whitespace-nowrap overflow-hidden">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50/80 text-indigo-900 border border-indigo-100 max-w-full truncate shadow-2xs" title={lead.course}>
                          <BookOpen className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="truncate">{lead.course}</span>
                        </span>
                      </td>

                      {/* 4. Lead Source */}
                      <td className="px-3.5 py-3.5 align-middle whitespace-nowrap overflow-hidden">
                        {lead.source?.toLowerCase().includes('qr') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs max-w-full" title={lead.source}>
                            <QrCode className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>QR Code</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 max-w-full truncate" title={lead.source || 'Website'}>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            <span className="truncate">{lead.source || 'Website'}</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Assigned Counsellor */}
                      <td className="px-3.5 py-3.5 align-middle whitespace-nowrap overflow-hidden">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border max-w-full truncate ${
                          lead.counselor && lead.counselor !== 'Unassigned'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`} title={lead.counselor || 'Unassigned'}>
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.counselor || 'Unassigned'}</span>
                        </span>
                      </td>

                      {/* 6. Lead Priority */}
                      <td className="px-3.5 py-3.5 align-middle text-left whitespace-nowrap overflow-hidden">
                        <select
                          value={lead.priority || 'Warm'}
                          onChange={(e) => {
                            if (onUpdateLeadPriority) {
                              onUpdateLeadPriority(lead.id, e.target.value);
                            } else if (onLeadUpdated) {
                              onLeadUpdated({ ...lead, priority: e.target.value });
                            }
                          }}
                          className={`text-[10px] font-bold rounded-md px-2 py-0.5 border cursor-pointer focus:outline-none transition-colors shadow-2xs ${
                            lead.priority === 'Hot'
                              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                              : lead.priority === 'Warm'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              : 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100'
                          }`}
                        >
                          {LEAD_PRIORITIES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </td>

                      {/* 7. Next Follow-up Date */}
                      <td className="px-3.5 py-3.5 align-middle whitespace-nowrap overflow-hidden">
                        {lead.nextFollowUpDate ? (
                          <div className="space-y-0.5">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${fuStatus.badgeClass}`}>
                              <Clock className="w-2.5 h-2.5 shrink-0" />
                              <span>{fuStatus.label}</span>
                            </span>
                            <div className="text-[10px] text-slate-700 font-medium truncate">
                              <span>{fuFormatted.date}</span>
                              {fuFormatted.time && (
                                <span className="text-slate-400 font-mono text-[9px] ml-1">
                                  {fuFormatted.time}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Unscheduled</span>
                        )}
                      </td>

                      {/* 8. Lead Status (Pipeline) */}
                      <td className="px-3.5 py-3.5 align-middle whitespace-nowrap overflow-hidden">
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
                          className="text-[10px] font-semibold bg-white border border-slate-300 rounded-md px-1.5 py-0.5 text-slate-800 shadow-2xs hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer w-full max-w-[95px] truncate"
                        >
                          {LEAD_PIPELINE_STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* 9. Actions: Convert to Admission, Edit, Delete */}
                      <td className="pl-3.5 pr-5 py-3.5 align-middle text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-center w-full">
                          {/* Convert to Admission */}
                          <button
                            type="button"
                            onClick={() => onConvertToAdmission && onConvertToAdmission(lead)}
                            className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-300 transition-all duration-150 inline-flex items-center gap-1 shadow-2xs group whitespace-nowrap shrink-0"
                            title="Convert directly to formal student admission"
                          >
                            <UserCheck className="w-3 h-3 text-emerald-600 group-hover:text-white transition-colors" />
                            <span>Convert</span>
                            <ArrowRight className="w-2.5 h-2.5 text-emerald-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs shrink-0"
                            title="Edit Lead"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmationLead(lead)}
                            className="p-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shadow-2xs shrink-0"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3 h-3" />
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

      {/* 6. Add / Edit Lead Modal */}
      <NewLeadModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingLead(null);
        }}
        leadToEdit={editingLead}
        courses={courses}
        trainers={trainers}
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
      {deleteConfirmationLead && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
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
                type="button"
                onClick={() => setDeleteConfirmationLead(null)}
                className="px-3.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

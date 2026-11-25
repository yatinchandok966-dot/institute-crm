import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LeadsModule from './components/LeadsModule';
import AdmissionsModule from './components/AdmissionsModule';
import CoursesModule from './components/CoursesModule';
import BatchesModule from './components/BatchesModule';
import StudentsModule from './components/StudentsModule';
import StudentProfile from './components/Students/StudentProfile';
import FeesModule from './components/FeesModule';
import AttendanceModule from './components/AttendanceModule';
import TrainersModule from './components/TrainersModule';

// Modals
import NewLeadModal from "./components/NewLeadModal";
import AdmissionModal from "./components/AdmissionModal";
import AdmissionConfirmationModal from "./components/AdmissionConfirmationModal";
import RecordPaymentModal from "./components/RecordPaymentModal";
import NewBatchModal from "./components/NewBatchModal";
import NewCourseModal from "./components/NewCourseModal";
import ReceiptModal from "./components/ReceiptModal";
import StudentIDModal from "./components/StudentIDModal";
import ShareQRModal from "./components/ShareQRModal";
import PublicInquiryForm from "./components/PublicInquiryForm";

// Deepak : Change mock data to original data
import { initialInstituteData } from "./data/constants";

const STORAGE_KEY = 'edupulse_institute_crm_v2';
const TAB_STORAGE_KEY = 'edupulse_crm_active_tab';
const VALID_TABS = ['dashboard', 'leads', 'admissions', 'courses', 'batches', 'trainers', 'students', 'fees', 'attendance'];

const getInitialTab = () => {
  if (typeof window === 'undefined') return 'dashboard';
  try {
    const params = new URLSearchParams(window.location.search);
    const paramTab = params.get('tab');
    if (paramTab && VALID_TABS.includes(paramTab)) {
      return paramTab;
    }
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && hash !== 'inquire' && VALID_TABS.includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem(TAB_STORAGE_KEY);
    if (saved && VALID_TABS.includes(saved)) {
      return saved;
    }
  } catch (err) {
    console.warn('Could not read saved tab:', err);
  }
  return 'dashboard';
};

export default function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Persistent institute state initialized from localStorage
  const [instituteData, setInstituteData] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const rawDeleted = Array.isArray(parsed.deletedCourseIds) ? parsed.deletedCourseIds : [];
          const deletedSet = new Set(rawDeleted.map(s => String(s).trim().toLowerCase()));
          const existingCourses = Array.isArray(parsed.courses) ? parsed.courses : [];
          
          const isDeleted = (c) => {
            if (!c) return true;
            const cId = String(c.id || '').trim().toLowerCase();
            const cCode = String(c.code || '').trim().toLowerCase();
            const cName = String(c.name || c.title || '').trim().toLowerCase();
            return (
              (cId && deletedSet.has(cId)) ||
              (cCode && deletedSet.has(cCode)) ||
              (cName && deletedSet.has(cName))
            );
          };

          let initialCoursesList = [];
          if (existingCourses.length > 0) {
            initialCoursesList = existingCourses.filter(c => !isDeleted(c));
          } else {
            // No local courses saved — start empty; server will populate via fetchDashboardData
            initialCoursesList = [];
          }

          // Fix QR source for Riya if currently Website or missing, and deduplicate by phone/id
          const rawParsedLeads = Array.isArray(parsed.recentLeads) ? parsed.recentLeads : [];
          const seenInitPhones = new Set();
          const deduplicatedLeads = [];
          for (const l of rawParsedLeads) {
            if (!l) continue;
            const cleanPhone = String(l.phone || '').replace(/\D/g, '').slice(-10);
            const key = cleanPhone ? `phone_${cleanPhone}` : `id_${l.id}`;
            if (!seenInitPhones.has(key)) {
              seenInitPhones.add(key);
              let item = l;
              if ((item.name === 'Riya' || item.id === 1795421032576) && (!item.source || item.source === 'Website')) {
                item = { ...item, source: 'QR Code (Campus Reception)' };
              }
              deduplicatedLeads.push(item);
            }
          }

          return {
            ...initialInstituteData,
            ...parsed,
            recentLeads: deduplicatedLeads,
            trainers: Array.isArray(parsed.trainers) ? parsed.trainers : [],
            admissions: Array.isArray(parsed.admissions) ? parsed.admissions : [],
            students: Array.isArray(parsed.students) ? parsed.students : [],
            courses: initialCoursesList,
            deletedCourseIds: rawDeleted,
            batches: Array.isArray(parsed.batches) ? parsed.batches : initialInstituteData.batches,
            feeTransactions: Array.isArray(parsed.feeTransactions) ? parsed.feeTransactions : [],
            revenueTimeline: Array.isArray(parsed.revenueTimeline) ? parsed.revenueTimeline : [],
            stats: parsed.stats || initialInstituteData.stats
          };
        }
      }
    } catch (err) {
      console.warn('Could not read from localStorage:', err);
    }
    return initialInstituteData;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    engine: "PostgreSQL",
  });
  const [currentHash, setCurrentHash] = useState(
    typeof window !== "undefined" ? window.location.hash : "",
  );

  // Deepak : student data -->
  const [students, setStudents] = useState([]);
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        const result = await response.json();

        if (result.success) {
          setStudents(result.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  // Automatically sync state to localStorage whenever it updates
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(instituteData));
      }
    } catch (err) {
      console.warn('Could not persist to localStorage:', err);
    }
  }, [instituteData]);

  // Automatically persist active tab to localStorage and sync with URL query
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && VALID_TABS.includes(activeTab)) {
        localStorage.setItem(TAB_STORAGE_KEY, activeTab);
        if (window.location.hash !== '#inquire') {
          const url = new URL(window.location.href);
          if (url.searchParams.get('tab') !== activeTab) {
            url.searchParams.set('tab', activeTab);
            window.history.replaceState({}, '', url);
          }
        }
      }
    } catch (err) {
      console.warn('Could not persist active tab:', err);
    }
  }, [activeTab]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const paramTab = params.get('tab');
      if (paramTab && VALID_TABS.includes(paramTab) && paramTab !== activeTab) {
        setSelectedStudentForProfile(null);
        setActiveTab(paramTab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  // Modal states
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isShareQROpen, setIsShareQROpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [leadForConversion, setLeadForConversion] = useState(null);
  const [confirmedAdmissionLetter, setConfirmedAdmissionLetter] =
    useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForEdit, setCourseForEdit] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [selectedStudentID, setSelectedStudentID] = useState(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);

  // Changes  By Deepak -->
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);

  // Force pure light theme & listen to URL hash for QR public form
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");

    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch initial dashboard stats & DB status from Express backend
  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, healthRes] = await Promise.all([
        fetch("/api/dashboard/stats").catch(() => null),
        fetch("/api/health").catch(() => null),
      ]);

      if (healthRes && healthRes.ok) {
        const health = await healthRes.json();
        setDbStatus(health.database || { connected: false });
      }

      if (statsRes && statsRes.ok) {
        const result = await statsRes.json();
        if (result.success) {
          setInstituteData(prev => {
            // Smart deduplicated merge for leads
            const serverLeads = Array.isArray(result.recentLeads) ? result.recentLeads : [];
            const localLeads = Array.isArray(prev.recentLeads) ? prev.recentLeads : [];
            const combined = serverLeads.length > 0 ? [...serverLeads, ...localLeads] : localLeads;
            const leadMap = new Map();
            combined.forEach(l => {
              if (!l) return;
              const cleanPhone = String(l.phone || '').replace(/\D/g, '').slice(-10);
              const key = cleanPhone ? `phone_${cleanPhone}` : `id_${l.id}`;
              if (!leadMap.has(key)) {
                leadMap.set(key, l);
              }
            });
            let mergedLeads = Array.from(leadMap.values());
            if (localLeads.length > 0 && serverLeads.length === 0) {
              localLeads.forEach(l => {
                fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(l)
                }).catch(() => null);
              });
            }
            // Ensure Riya has correct QR source
            mergedLeads = mergedLeads.map(l => {
              if (l && (l.name === 'Riya' || l.id === 1795421032576) && (!l.source || l.source === 'Website')) {
                return { ...l, source: 'QR Code (Campus Reception)' };
              }
              return l;
            });

            // Smart merge for trainers
            const serverTrainers = Array.isArray(result.trainers) ? result.trainers : [];
            const localTrainers = Array.isArray(prev.trainers) ? prev.trainers : [];
            let mergedTrainers = localTrainers.length > 0 ? localTrainers : (serverTrainers.length > 0 ? serverTrainers : initialInstituteData.trainers);
            if (serverTrainers.length > 0 && localTrainers.length > 0) {
              const tMap = new Map();
              localTrainers.forEach(t => tMap.set(t.employeeId || t.id || t.name, t));
              serverTrainers.forEach(t => {
                const key = t.employeeId || t.id || t.name;
                const existing = tMap.get(key) || {};
                const assignedCourses = (Array.isArray(t.assignedCourses) && t.assignedCourses.length > 0)
                  ? t.assignedCourses
                  : (existing.assignedCourses || []);
                tMap.set(key, { ...existing, ...t, assignedCourses });
              });
              mergedTrainers = Array.from(tMap.values());
            } else if (localTrainers.length > 0 && serverTrainers.length === 0) {
              localTrainers.forEach(t => {
                fetch('/api/trainers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(t)
                }).catch(() => null);
              });
              mergedTrainers = localTrainers;
            }

            // Smart merge for courses (respects deleted courses)
            const serverCourses = Array.isArray(result.courses) ? result.courses : [];
            const localCourses = Array.isArray(prev.courses) ? prev.courses : [];
            const deletedSet = new Set((prev.deletedCourseIds || []).map(s => String(s).trim().toLowerCase()));

            const isDeleted = (c) => {
              if (!c) return true;
              const cId = String(c.id || '').trim().toLowerCase();
              const cCode = String(c.code || '').trim().toLowerCase();
              const cName = String(c.name || c.title || '').trim().toLowerCase();
              return (
                (cId && deletedSet.has(cId)) ||
                (cCode && deletedSet.has(cCode)) ||
                (cName && deletedSet.has(cName))
              );
            };

            // Server is authoritative for courses — only show what the DB has
            let mergedCourses;
            if (serverCourses.length > 0) {
              // Use server courses only (filtered by locally-deleted ones pending sync)
              mergedCourses = serverCourses.filter(c => c && !isDeleted(c));
            } else {
              // Server returned no courses — keep local as fallback
              mergedCourses = localCourses.filter(c => c && !isDeleted(c));
            }

            // Smart merge for batches
            const serverBatches = Array.isArray(result.batches) ? result.batches : [];
            const localBatches = Array.isArray(prev.batches) ? prev.batches : [];
            let mergedBatches = localBatches;
            if (serverBatches.length > 0 && localBatches.length === 0) {
              mergedBatches = serverBatches;
            } else if (serverBatches.length > 0 && localBatches.length > 0) {
              const bMap = new Map();
              localBatches.forEach(b => bMap.set(b.id || b.name, b));
              serverBatches.forEach(b => bMap.set(b.id || b.name, b));
              mergedBatches = Array.from(bMap.values());
            } else if (localBatches.length > 0 && serverBatches.length === 0) {
              localBatches.forEach(b => {
                fetch('/api/batches', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(b)
                }).catch(() => null);
              });
              mergedBatches = localBatches;
            }

            // Server is authoritative for admissions & students so DB deletions reflect immediately
            const serverAdmissions = Array.isArray(result.admissions) ? result.admissions : [];
            const mergedAdmissions = serverAdmissions;

            const serverStudents = Array.isArray(result.students) ? result.students : [];
            const mergedStudents = serverStudents;

            // Smart merge for fee transactions
            const serverFees = Array.isArray(result.feeTransactions) ? result.feeTransactions : [];
            const localFees = Array.isArray(prev.feeTransactions) ? prev.feeTransactions : [];
            let mergedFees = localFees;
            if (serverFees.length > 0 && localFees.length === 0) {
              mergedFees = serverFees;
            } else if (serverFees.length > 0 && localFees.length > 0) {
              const fMap = new Map();
              localFees.forEach(f => fMap.set(f.receiptNo || f.id, f));
              serverFees.forEach(f => fMap.set(f.receiptNo || f.id, f));
              mergedFees = Array.from(fMap.values());
            } else if (localFees.length > 0 && serverFees.length === 0) {
              localFees.forEach(f => {
                fetch('/api/fees', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(f)
                }).catch(() => null);
              });
              mergedFees = localFees;
            }

            const totalRev = mergedFees.reduce((acc, t) => acc + Number(t.amount || 0), 0);
            const totalPend = mergedStudents.reduce((acc, s) => acc + Number(s.feeDue || 0), 0);
            const totalStuds = mergedStudents.length;
            const totalAdms = mergedAdmissions.length;
            const totalLds = mergedLeads.length;
            const convRate = totalLds > 0 ? `${Math.round((totalAdms / totalLds) * 100)}%` : '0%';
            const collRate = (totalRev + totalPend > 0)
              ? `${Math.round((totalRev / (totalRev + totalPend)) * 100)}%`
              : '100%';

            const mergedStats = {
              totalStudents: totalStuds,
              activeStudentsGrowth: totalStuds > 0 ? `+${totalStuds}` : '0%',
              newLeadsThisMonth: totalLds,
              leadConversionRate: convRate,
              confirmedAdmissions: totalAdms,
              activeCourses: mergedCourses.length,
              activeBatches: mergedBatches.length,
              monthlyRevenue: totalRev,
              revenueGrowth: totalRev > 0 ? '+100%' : '0%',
              pendingFees: totalPend,
              attendanceAverage: '100%',
              feeCollectionRate: collRate
            };

            return {
              ...prev,
              stats: mergedStats,
              courses: mergedCourses,
              batches: mergedBatches,
              recentLeads: mergedLeads,
              trainers: mergedTrainers,
              admissions: mergedAdmissions,
              students: mergedStudents,
              feeTransactions: mergedFees,
              revenueTimeline: result.revenueTimeline && result.revenueTimeline.length > 0 ? result.revenueTimeline : prev.revenueTimeline,
            };
          });
        }
      }
    } catch (err) {
      console.warn("Backend running in local fallback mode:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handlers for Leads
  const handleLeadCreated = async (newLead) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      const data = await res.json();
      const leadToAdd = (data && data.success && data.lead) ? data.lead : newLead;

      setInstituteData((prev) => {
        const cleanNewPhone = String(leadToAdd.phone || '').replace(/\D/g, '').slice(-10);
        const filtered = (prev.recentLeads || []).filter(l => {
          if (l.id === leadToAdd.id) return false;
          if (cleanNewPhone && String(l.phone || '').replace(/\D/g, '').slice(-10) === cleanNewPhone) return false;
          return true;
        });
        const updatedLeads = [leadToAdd, ...filtered];
        return {
          ...prev,
          recentLeads: updatedLeads,
          stats: {
            ...prev.stats,
            newLeadsThisMonth: updatedLeads.length,
          },
        };
      });
    } catch (err) {
      console.error('Error creating lead:', err);
    }
  };

  const handleLeadUpdated = (updatedLead) => {
    setInstituteData(prev => ({
      ...prev,
      recentLeads: prev.recentLeads.map(l => (l.id === updatedLead.id ? updatedLead : l))
    }));
    fetch(`/api/leads/${updatedLead.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedLead)
    }).catch(() => null);
  };

  const handleLeadDeleted = (leadId) => {
    setInstituteData(prev => {
      const updatedLeads = prev.recentLeads.filter(l => l.id !== leadId);
      return {
        ...prev,
        recentLeads: updatedLeads,
        stats: {
          ...prev.stats,
          newLeadsThisMonth: updatedLeads.length
        }
      };
    });
    fetch(`/api/leads/${leadId}`, {
      method: 'DELETE'
    }).catch(() => null);
  };

  const handleBatchLeadsImported = (newLeads) => {
    if (!newLeads || newLeads.length === 0) return;
    setInstituteData(prev => {
      const updatedLeads = [...newLeads, ...prev.recentLeads];
      return {
        ...prev,
        recentLeads: updatedLeads,
        stats: {
          ...prev.stats,
          newLeadsThisMonth: updatedLeads.length
        }
      };
    });
    fetch('/api/leads/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads: newLeads })
    }).catch(() => null);
  };

  const handleUpdateLeadStatus = (leadId, newStatus) => {
    setInstituteData((prev) => ({
      ...prev,
      recentLeads: prev.recentLeads.map((l) =>
        l.id === leadId ? { ...l, status: newStatus } : l,
      ),
    }));
    fetch(`/api/leads/${leadId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => null);
  };

  const handleAssignCounsellor = (leadId, counselor) => {
    setInstituteData(prev => ({
      ...prev,
      recentLeads: prev.recentLeads.map(l => (l.id === leadId ? { ...l, counselor } : l))
    }));
    fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counselor })
    }).catch(() => null);
  };

  const handleUpdateLeadPriority = (leadId, priority) => {
    setInstituteData(prev => ({
      ...prev,
      recentLeads: prev.recentLeads.map(l => (l.id === leadId ? { ...l, priority } : l))
    }));
    fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority })
    }).catch(() => null);
  };

  const handleAddLeadNote = (leadId, note) => {
    setInstituteData(prev => ({
      ...prev,
      recentLeads: prev.recentLeads.map(l => {
        if (l.id === leadId) {
          const notesList = [note, ...(l.notesList || [])];
          return { ...l, notesList, notes: note.text };
        }
        return l;
      })
    }));
    fetch(`/api/leads/${leadId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    }).catch(() => null);
  };

  const handleLogLeadCall = (leadId, call, nextFollowUp) => {
    setInstituteData(prev => ({
      ...prev,
      recentLeads: prev.recentLeads.map(l => {
        if (l.id === leadId) {
          const callHistory = [call, ...(l.callHistory || [])];
          return {
            ...l,
            callHistory,
            ...(nextFollowUp ? { nextFollowUpDate: nextFollowUp } : {})
          };
        }
        return l;
      })
    }));
    fetch(`/api/leads/${leadId}/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...call, nextFollowUpDate: nextFollowUp })
    }).catch(() => null);
  };

  // Convert Lead to Admission trigger
  const handleConvertToAdmission = (lead) => {
    setLeadForConversion(lead);
    setIsAdmissionModalOpen(true);
  };

  // On Admission Created (Lead-to-student conversion without re-entering details)
  const handleAdmissionCreated = (newAdmission, newStudent) => {
    if (!newAdmission) return;
    const safeStudentName = newAdmission.studentName || newAdmission.student_name || newAdmission.name || 'Student';
    const safeAdmNo = newAdmission.admissionNo || newAdmission.admission_no || `ADM-2026-${Date.now().toString().slice(-4)}`;
    const safeAppNo = newAdmission.applicationNo || newAdmission.application_no || `APP-2026-${Date.now().toString().slice(-4)}`;
    const safePaid = Number(newAdmission.admissionFeePaid ?? newAdmission.admission_fee_paid ?? 0);
    const safeDue = Number(newAdmission.feeDue ?? newAdmission.fee_due ?? 0);
    const safeTotal = Number(newAdmission.totalCourseFee ?? newAdmission.total_course_fee ?? (safePaid + safeDue));

    const safeAdmission = {
      ...newAdmission,
      studentName: safeStudentName,
      student_name: safeStudentName,
      admissionNo: safeAdmNo,
      admission_no: safeAdmNo,
      applicationNo: safeAppNo,
      application_no: safeAppNo,
      admissionFeePaid: safePaid,
      admission_fee_paid: safePaid,
      feeDue: safeDue,
      fee_due: safeDue,
      totalCourseFee: safeTotal,
      total_course_fee: safeTotal,
      course: newAdmission.course || 'Full Stack Web Development (MERN)',
      batch: newAdmission.batch || 'General Cohort',
      status: newAdmission.status || 'Admission Confirmed',
      admissionDate: newAdmission.admissionDate || newAdmission.admission_date || new Date().toISOString().split('T')[0]
    };

    setInstituteData((prev) => {
      // 1. Mark corresponding lead as converted
      const updatedLeads = (prev.recentLeads || []).map((l) => {
        if (
          l.id === safeAdmission.leadId ||
          l.name === safeAdmission.studentName
        ) {
          return { ...l, status: "Lead Confirmed (Admitted)" };
        }
        return l;
      });

      // 2. Add to students roster if not present (deduplicated by studentId / admissionNo)
      const existingStudents = prev.students || [];
      const updatedStudents = (newStudent && !existingStudents.some(s =>
        (newStudent.studentId && s.studentId === newStudent.studentId) ||
        (newStudent.admissionNo && s.admissionNo === newStudent.admissionNo)
      ))
        ? [newStudent, ...existingStudents]
        : existingStudents;

      const existingAdmissions = prev.admissions || [];
      const updatedAdmissions = !existingAdmissions.some(a =>
        (safeAdmission.id && a.id === safeAdmission.id) ||
        (safeAdmission.admissionNo && (a.admissionNo === safeAdmission.admissionNo || a.admission_no === safeAdmission.admissionNo))
      )
        ? [safeAdmission, ...existingAdmissions]
        : existingAdmissions;

      // 3. Add to fee transactions if an admission fee was collected
      const updatedFees = [...(prev.feeTransactions || [])];
      const paidAmount = safePaid;
      if (paidAmount > 0) {
        const rcpSeq = String(updatedFees.length + 1).padStart(4, "0");
        updatedFees.unshift({
          receiptNo: `RCP-2026-${rcpSeq}`,
          studentName: safeAdmission.studentName,
          studentId: newStudent?.studentId || "STU-NEW",
          course: safeAdmission.course,
          amount: paidAmount,
          mode: "Admission Registration (UPI / Bank)",
          date: new Date().toISOString().replace("T", " ").substring(0, 16),
          collectedBy: safeAdmission.counselor || "Admissions Desk",
          status: "Success",
        });
      }

      const totalRevenue = updatedFees.reduce(
        (acc, t) => acc + Number(t.amount || 0),
        0,
      );
      const totalPending = updatedStudents.reduce(
        (acc, s) => acc + Number(s.feeDue || 0),
        0,
      );

      return {
        ...prev,
        admissions: updatedAdmissions,
        recentLeads: updatedLeads,
        students: updatedStudents,
        feeTransactions: updatedFees,
        stats: {
          ...prev.stats,
          confirmedAdmissions: updatedAdmissions.length,
          totalStudents: updatedStudents.length,
          monthlyRevenue: totalRevenue,
          pendingFees: totalPending,
          leadConversionRate:
            updatedLeads.length > 0 ?
              `${Math.round((updatedAdmissions.length / updatedLeads.length) * 100)}%`
            : "0%",
        },
      };
    });

    setLeadForConversion(null);
    // Show official admission confirmation letter modal
    setConfirmedAdmissionLetter(newAdmission);

    // Persist admission, student and fee record to backend only if AdmissionModal didn't already persist it
    if (!newAdmission._persisted) {
      fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAdmission,
          studentId: newStudent?.studentId,
          admissionFeePaid: newAdmission.admissionFeePaid
        })
      }).catch(() => null);
    }
  };

  const handleUpdateAdmissionStatus = (admId, newStatus) => {
    setInstituteData((prev) => ({
      ...prev,
      admissions: prev.admissions.map((a) =>
        a.id === admId ? { ...a, status: newStatus } : a,
      ),
    }));
    fetch(`/api/admissions/${admId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => null);
  };

  const handleDeleteAdmission = (admissionId) => {
    if (!admissionId) return;

    setInstituteData((prev) => {
      const updatedAdmissions = (prev.admissions || []).filter(
        (a) =>
          String(a.id) !== String(admissionId) &&
          String(a.admissionNo) !== String(admissionId) &&
          String(a.admission_no) !== String(admissionId)
      );

      const totalRevenue = (prev.feeTransactions || []).reduce(
        (acc, t) => acc + (Number(t.amount) || 0),
        0
      );
      const totalPending = (prev.students || []).reduce(
        (acc, s) => acc + (Number(s.feeDue) || 0),
        0
      );

      const updatedData = {
        ...prev,
        admissions: updatedAdmissions,
        stats: {
          ...prev.stats,
          confirmedAdmissions: updatedAdmissions.length,
          conversionRate:
            (prev.recentLeads || []).length > 0
              ? `${Math.round((updatedAdmissions.length / prev.recentLeads.length) * 100)}%`
              : "0%",
          collectionRate:
            totalRevenue + totalPending > 0
              ? `${Math.round((totalRevenue / (totalRevenue + totalPending)) * 100)}%`
              : "100%",
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }

      return updatedData;
    });

    fetch(`/api/admissions/${admissionId}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Failed to delete admission from server:", err));
  };

  const handleDeleteStudent = async (student) => {
    if (!student) return;
    const targetId = student.studentId || student.id || student.admissionNo;
    if (!targetId) return;

    const cleanTargetPhone = student.phone
      ? String(student.phone).replace(/\D/g, '').slice(-10)
      : '';

    setInstituteData((prev) => {
      const updatedStudents = (prev.students || []).filter((s) => {
        const cleanSPhone = s.phone ? String(s.phone).replace(/\D/g, '').slice(-10) : '';
        const matches =
          (student.id != null && s.id != null && String(s.id) === String(student.id)) ||
          (student.studentId && s.studentId && s.studentId === student.studentId) ||
          (student.admissionNo && s.admissionNo && s.admissionNo === student.admissionNo) ||
          (cleanTargetPhone && cleanSPhone && cleanSPhone === cleanTargetPhone);
        return !matches;
      });

      const totalRevenue = (prev.feeTransactions || []).reduce(
        (acc, t) => acc + (Number(t.amount) || 0),
        0
      );
      const totalPending = updatedStudents.reduce(
        (acc, s) => acc + (Number(s.feeDue) || 0),
        0
      );

      const updatedData = {
        ...prev,
        students: updatedStudents,
        stats: {
          ...prev.stats,
          totalStudents: updatedStudents.length,
          pendingFeesAmount: totalPending,
          collectionRate:
            totalRevenue + totalPending > 0
              ? `${Math.round((totalRevenue / (totalRevenue + totalPending)) * 100)}%`
              : "100%",
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }

      return updatedData;
    });

    setSelectedStudentForProfile((prev) => {
      if (!prev) return null;
      const isMatch =
        (student.id != null && prev.id != null && String(prev.id) === String(student.id)) ||
        (student.studentId && prev.studentId && prev.studentId === student.studentId);
      return isMatch ? null : prev;
    });

    try {
      const res = await fetch(`/api/students/${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn("Failed to delete student from server:", errData.error || res.status);
      }
    } catch (err) {
      console.warn("Failed to delete student from server:", err);
    }
  };

  const handlePaymentRecorded = (newReceipt) => {
    setInstituteData((prev) => {
      const updatedStudents = prev.students.map((s) => {
        if (
          s.name.toLowerCase() === newReceipt.studentName.toLowerCase() ||
          s.studentId === newReceipt.studentId
        ) {
          const newPaid =
            Number(s.feePaid || 0) + Number(newReceipt.amount || 0);
          const newDue = Math.max(0, Number(s.feeTotal || 0) - newPaid);
          return {
            ...s,
            feePaid: newPaid,
            feeDue: newDue,
            feeStatus: newDue === 0 ? "Paid" : "Partial",
          };
        }
        return s;
      });

      const updatedFees = [newReceipt, ...prev.feeTransactions];
      const totalRevenue = updatedFees.reduce(
        (acc, t) => acc + Number(t.amount || 0),
        0,
      );
      const totalPending = updatedStudents.reduce(
        (acc, s) => acc + Number(s.feeDue || 0),
        0,
      );

      return {
        ...prev,
        feeTransactions: updatedFees,
        students: updatedStudents,
        stats: {
          ...prev.stats,
          monthlyRevenue: totalRevenue,
          pendingFees: totalPending,
          feeCollectionRate:
            totalRevenue + totalPending > 0 ?
              `${Math.round((totalRevenue / (totalRevenue + totalPending)) * 100)}%`
            : "100%",
        },
      };
    });

    fetch('/api/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReceipt)
    }).catch(() => null);
  };

  const handleBatchCreated = (newBatch) => {
    setInstituteData((prev) => {
      const updatedBatches = [newBatch, ...prev.batches];
      return {
        ...prev,
        batches: updatedBatches,
        stats: {
          ...prev.stats,
          activeBatches: updatedBatches.length,
        },
      };
    });

    fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBatch)
    }).catch(() => null);
  };

  const handleCourseCreated = (courseData, isEdit) => {
    setInstituteData(prev => {
      const updatedCourses = isEdit
        ? prev.courses.map(c => (c.id === courseData.id ? courseData : c))
        : [courseData, ...prev.courses];

      return {
        ...prev,
        courses: updatedCourses,
        stats: {
          ...prev.stats,
          activeCourses: updatedCourses.length,
        },
      };
    });

    if (isEdit) {
      fetch(`/api/courses/${courseData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      }).catch(() => null);
    } else {
      fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      }).catch(() => null);
    }
  };

  const handleDeleteCourse = (courseParam) => {
    const courseObj = typeof courseParam === 'object' && courseParam !== null
      ? courseParam
      : (instituteData.courses || []).find(c =>
          String(c.id) === String(courseParam) ||
          String(c.code) === String(courseParam) ||
          String(c.name) === String(courseParam)
        ) || { id: courseParam };

    const cId = courseObj.id ? String(courseObj.id).trim() : '';
    const cCode = courseObj.code ? String(courseObj.code).trim() : '';
    const cName = (courseObj.name || courseObj.title) ? String(courseObj.name || courseObj.title).trim() : '';

    const identifiersToAdd = [
      cId,
      cCode,
      cName,
      cId.toLowerCase(),
      cCode.toLowerCase(),
      cName.toLowerCase()
    ].filter(Boolean);

    setInstituteData(prev => {
      const currentDeleted = prev.deletedCourseIds || [];
      const newDeleted = Array.from(new Set([...currentDeleted, ...identifiersToAdd]));
      const newDeletedSet = new Set(newDeleted.map(s => String(s).trim().toLowerCase()));

      const updatedCourses = (prev.courses || []).filter(c => {
        const itemCId = String(c.id || '').trim().toLowerCase();
        const itemCCode = String(c.code || '').trim().toLowerCase();
        const itemCName = String(c.name || c.title || '').trim().toLowerCase();
        return (
          (!itemCId || !newDeletedSet.has(itemCId)) &&
          (!itemCCode || !newDeletedSet.has(itemCCode)) &&
          (!itemCName || !newDeletedSet.has(itemCName))
        );
      });

      return {
        ...prev,
        courses: updatedCourses,
        deletedCourseIds: newDeleted,
        stats: {
          ...prev.stats,
          activeCourses: updatedCourses.length
        }
      };
    });

    const paramId = courseObj.id || courseObj.code || courseParam;
    const qName = encodeURIComponent(courseObj.name || courseObj.title || '');
    const qCode = encodeURIComponent(courseObj.code || '');

    fetch(`/api/courses/${encodeURIComponent(paramId)}?name=${qName}&code=${qCode}`, {
      method: 'DELETE'
    }).catch(() => null);
  };

  // Handlers for Trainers / Employees
  const handleTrainerCreated = (newTrainer) => {
    setInstituteData(prev => ({
      ...prev,
      trainers: [newTrainer, ...(prev.trainers || [])]
    }));
    fetch('/api/trainers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTrainer)
    }).catch(() => null);
  };

  const handleTrainerUpdated = (updatedTrainer) => {
    setInstituteData(prev => {
      const updatedTrainers = (prev.trainers || []).map(t => {
        const isMatch =
          (t.id != null && updatedTrainer.id != null && String(t.id) === String(updatedTrainer.id)) ||
          (t.employeeId && updatedTrainer.employeeId && t.employeeId === updatedTrainer.employeeId) ||
          (t.name && updatedTrainer.name && t.name.toLowerCase() === updatedTrainer.name.toLowerCase());
        return isMatch ? { ...t, ...updatedTrainer } : t;
      });
      return {
        ...prev,
        trainers: updatedTrainers
      };
    });

    const trainerKey = updatedTrainer.id || updatedTrainer.employeeId;
    fetch(`/api/trainers/${trainerKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTrainer)
    }).catch(err => console.warn('Failed to update trainer on server:', err));
  };

  const handleTrainerDeleted = (trainerId) => {
    setInstituteData(prev => ({
      ...prev,
      trainers: (prev.trainers || []).filter(t => t.id !== trainerId)
    }));
    fetch(`/api/trainers/${trainerId}`, {
      method: 'DELETE'
    }).catch(() => null);
  };

  const handleStudentUpdated = async (updatedStudent) => {
    // 1. Optimistic state update for students AND associated admissions
    setInstituteData(prev => {
      const updatedStudents = (prev.students || []).map(s => {
        const isMatch =
          (s.id != null && updatedStudent.id != null && String(s.id) === String(updatedStudent.id)) ||
          (s.studentId && updatedStudent.studentId && s.studentId === updatedStudent.studentId) ||
          (s.admissionNo && updatedStudent.admissionNo && s.admissionNo === updatedStudent.admissionNo) ||
          (s.phone && updatedStudent.phone && String(s.phone).replace(/\D/g, '').slice(-10) === String(updatedStudent.phone).replace(/\D/g, '').slice(-10));
        return isMatch ? { ...s, ...updatedStudent } : s;
      });

      const updatedAdmissions = (prev.admissions || []).map(a => {
        const isMatch =
          (updatedStudent.admissionNo && a.admissionNo === updatedStudent.admissionNo) ||
          (updatedStudent.phone && a.phone && String(a.phone).replace(/\D/g, '').slice(-10) === String(updatedStudent.phone).replace(/\D/g, '').slice(-10)) ||
          (a.studentName && updatedStudent.name && a.studentName.toLowerCase() === updatedStudent.name.toLowerCase());
        if (isMatch) {
          return {
            ...a,
            studentName: updatedStudent.name || a.studentName,
            phone: updatedStudent.phone || a.phone,
            email: updatedStudent.email || a.email,
            guardianName: updatedStudent.guardian || a.guardianName,
            guardianPhone: updatedStudent.guardianPhone || a.guardianPhone,
            address: updatedStudent.address || a.address,
            course: updatedStudent.course || a.course,
            batch: updatedStudent.batch || a.batch,
            status: updatedStudent.status || a.status
          };
        }
        return a;
      });

      return {
        ...prev,
        students: updatedStudents,
        admissions: updatedAdmissions
      };
    });

    setStudents(prev =>
      (prev || []).map(s => {
        const isMatch =
          (s.id != null && updatedStudent.id != null && String(s.id) === String(updatedStudent.id)) ||
          (s.studentId && updatedStudent.studentId && s.studentId === updatedStudent.studentId) ||
          (s.admissionNo && updatedStudent.admissionNo && s.admissionNo === updatedStudent.admissionNo);
        return isMatch ? { ...s, ...updatedStudent } : s;
      })
    );

    setSelectedStudentForProfile(prev => ({ ...(prev || {}), ...updatedStudent }));

    // 2. Persist to Express backend / PostgreSQL
    try {
      const studentId = updatedStudent.id || updatedStudent.studentId || updatedStudent.admissionNo;
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      });

      const contentType = res.headers.get('content-type') || '';
      let result;
      if (contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.ok
            ? 'Unexpected response from server'
            : (text && text.length < 200 && !text.includes('<!DOCTYPE') && !text.includes('<html')
                ? text
                : 'Server is currently offline or unreachable. Please start the backend server.')
        );
      }

      if (result && result.success && result.student) {
        setInstituteData(prev => {
          const freshStudents = (prev.students || []).map(s => {
            const isMatch =
              (s.id != null && result.student.id != null && String(s.id) === String(result.student.id)) ||
              (s.studentId && result.student.studentId && s.studentId === result.student.studentId) ||
              (s.admissionNo && result.student.admissionNo && s.admissionNo === result.student.admissionNo) ||
              (s.phone && result.student.phone && String(s.phone).replace(/\D/g, '').slice(-10) === String(result.student.phone).replace(/\D/g, '').slice(-10));
            return isMatch ? { ...s, ...result.student } : s;
          });
          return {
            ...prev,
            students: freshStudents
          };
        });
        setStudents(prev =>
          (prev || []).map(s => {
            const isMatch =
              (s.id != null && result.student.id != null && String(s.id) === String(result.student.id)) ||
              (s.studentId && result.student.studentId && s.studentId === result.student.studentId) ||
              (s.admissionNo && result.student.admissionNo && s.admissionNo === result.student.admissionNo) ||
              (s.phone && result.student.phone && String(s.phone).replace(/\D/g, '').slice(-10) === String(result.student.phone).replace(/\D/g, '').slice(-10));
            return isMatch ? { ...s, ...result.student } : s;
          })
        );
        setSelectedStudentForProfile(prev => ({ ...(prev || {}), ...result.student }));
        // Refresh dashboard stats so pipeline, counts, and charts stay in perfect sync
        fetchDashboardData();
      } else if (result && !result.success) {
        throw new Error(result.error || 'Server validation failed');
      }
    } catch (err) {
      console.warn('Backend update error, persisted in local state:', err);
      throw err;
    }
  };

  const handleOpenStudentProfile = (studentOrAdmission) => {
    if (!studentOrAdmission) return;
    const cleanP = (studentOrAdmission.phone || '').replace(/\D/g, '').slice(-10);
    const match = (instituteData.students || []).find(s => {
      const matchId = studentOrAdmission.id != null && s.id != null && String(s.id) === String(studentOrAdmission.id);
      const matchCode = studentOrAdmission.studentId && s.studentId === studentOrAdmission.studentId;
      const matchAdm = studentOrAdmission.admissionNo && (s.admissionNo === studentOrAdmission.admissionNo || s.studentId === studentOrAdmission.admissionNo);
      const matchPhone = cleanP && s.phone && String(s.phone).replace(/\D/g, '').slice(-10) === cleanP;
      const matchName = (studentOrAdmission.studentName || studentOrAdmission.name) && s.name && s.name.toLowerCase() === (studentOrAdmission.studentName || studentOrAdmission.name).toLowerCase();
      return matchId || matchCode || matchAdm || matchPhone || matchName;
    });

    const target = match || {
      id: studentOrAdmission.id,
      studentId: studentOrAdmission.studentId || `STU-${String(studentOrAdmission.admissionNo || '').replace(/\D/g, '') || 'NEW'}`,
      admissionNo: studentOrAdmission.admissionNo,
      name: studentOrAdmission.studentName || studentOrAdmission.name,
      phone: studentOrAdmission.phone,
      email: studentOrAdmission.email,
      guardian: studentOrAdmission.guardianName || studentOrAdmission.guardian,
      guardianPhone: studentOrAdmission.guardianPhone,
      address: studentOrAdmission.address,
      course: studentOrAdmission.course,
      batch: studentOrAdmission.batch,
      feeTotal: studentOrAdmission.totalCourseFee || studentOrAdmission.feeTotal || 0,
      feePaid: studentOrAdmission.admissionFeePaid || studentOrAdmission.feePaid || 0,
      feeDue: studentOrAdmission.feeDue || 0,
      status: studentOrAdmission.status || 'Active'
    };

    setSelectedStudentForProfile(target);
    setActiveTab('students');
  };

  // Render Module Content
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            data={instituteData}
            onOpenNewLead={() => setIsLeadModalOpen(true)}
            onOpenNewAdmission={() => {
              setLeadForConversion(null);
              setIsAdmissionModalOpen(true);
            }}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
            onOpenConfirmationLetter={(adm) => setConfirmedAdmissionLetter(adm)}
            onNavigate={handleTabChange}
            onConvertToAdmission={handleConvertToAdmission}
            onOpenStudentProfile={handleOpenStudentProfile}
          />
        );
      case "leads":
        return (
          <LeadsModule
            leads={instituteData.recentLeads}
            courses={instituteData.courses}
            trainers={instituteData.trainers}
            onOpenShareQR={() => setIsShareQROpen(true)}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onConvertToAdmission={handleConvertToAdmission}
            onLeadCreated={handleLeadCreated}
            onLeadUpdated={handleLeadUpdated}
            onLeadDeleted={handleLeadDeleted}
            onBatchLeadsImported={handleBatchLeadsImported}
            onAssignCounsellor={handleAssignCounsellor}
            onUpdateLeadPriority={handleUpdateLeadPriority}
            onAddLeadNote={handleAddLeadNote}
            onLogLeadCall={handleLogLeadCall}
          />
        );
      case "admissions":
        return (
          <AdmissionsModule
            admissions={instituteData.admissions}
            courses={instituteData.courses}
            batches={instituteData.batches}
            trainers={instituteData.trainers}
            onOpenNewAdmission={() => { setLeadForConversion(null); setIsAdmissionModalOpen(true); }}
            onOpenConfirmationLetter={(adm) => setConfirmedAdmissionLetter(adm)}
            onUpdateAdmissionStatus={handleUpdateAdmissionStatus}
            onOpenStudentProfile={handleOpenStudentProfile}
            onDeleteAdmission={handleDeleteAdmission}
          />
        );
      case "courses":
        return (
          <CoursesModule
            courses={instituteData.courses}
            admissions={instituteData.admissions}
            students={instituteData.students}
            trainers={instituteData.trainers}
            onOpenNewCourse={() => {
              setCourseForEdit(null);
              setIsCourseModalOpen(true);
            }}
            onEditCourse={(course) => {
              setCourseForEdit(course);
              setIsCourseModalOpen(true);
            }}
            onDeleteCourse={handleDeleteCourse}
          />
        );
      case "batches":
        return (
          <BatchesModule
            batches={instituteData.batches}
            courses={instituteData.courses}
            admissions={instituteData.admissions}
            students={instituteData.students}
            onOpenNewBatch={() => setIsBatchModalOpen(true)}
          />
        );
      case 'trainers':
        return (
          <TrainersModule
            trainers={instituteData.trainers || []}
            courses={instituteData.courses}
            batches={instituteData.batches}
            onTrainerCreated={handleTrainerCreated}
            onTrainerUpdated={handleTrainerUpdated}
            onTrainerDeleted={handleTrainerDeleted}
          />
        );
      case 'students': {
        const activeStudent = selectedStudentForProfile ? (
          (instituteData.students || []).find(s => {
            const cleanP = (selectedStudentForProfile.phone || '').replace(/\D/g, '').slice(-10);
            return (
              (s.id != null && selectedStudentForProfile.id != null && String(s.id) === String(selectedStudentForProfile.id)) ||
              (s.studentId && selectedStudentForProfile.studentId && s.studentId === selectedStudentForProfile.studentId) ||
              (s.admissionNo && selectedStudentForProfile.admissionNo && s.admissionNo === selectedStudentForProfile.admissionNo) ||
              (cleanP && s.phone && String(s.phone).replace(/\D/g, '').slice(-10) === cleanP)
            );
          }) || selectedStudentForProfile
        ) : null;

        if (activeStudent) {
          return (
            <StudentProfile
              student={activeStudent}
              onBack={() => setSelectedStudentForProfile(null)}
              onOpenPayment={() => setIsPaymentModalOpen(true)}
              onUpdateStudent={handleStudentUpdated}
              courses={instituteData.courses}
              batches={instituteData.batches}
            />
          );
        }
        return (
          <StudentsModule
            students={instituteData.students}
            onOpenStudentID={(student) => setSelectedStudentID(student)}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
            onOpenStudentProfile={handleOpenStudentProfile}
            onEditStudent={handleOpenStudentProfile}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      }
      case 'fees':
        return (
          <FeesModule
            feeTransactions={instituteData.feeTransactions}
            stats={instituteData.stats}
            students={instituteData.students}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
            onOpenReceipt={(receipt) => setSelectedReceipt(receipt)}
          />
        );
      case "attendance":
        return (
          <AttendanceModule
            batches={instituteData.batches}
            students={instituteData.students}
          />
        );
      default:
        return (
          <Dashboard
            data={instituteData}
            onOpenNewLead={() => setIsLeadModalOpen(true)}
            onOpenNewAdmission={() => {
              setLeadForConversion(null);
              setIsAdmissionModalOpen(true);
            }}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
            onOpenConfirmationLetter={(adm) => setConfirmedAdmissionLetter(adm)}
            onNavigate={handleTabChange}
            onConvertToAdmission={handleConvertToAdmission}
            onOpenStudentProfile={handleOpenStudentProfile}
          />
        );
    }
  };

  // If browser navigated to or scanned QR code (#inquire), show clean public inquiry form
  if (currentHash === "#inquire") {
    return (
      <PublicInquiryForm
        courses={instituteData.courses}
        onLeadSubmitted={(newLead) => {
          // PublicInquiryForm already sent POST /api/leads to the server.
          // Update local state directly with deduplication without making a duplicate POST request!
          setInstituteData((prev) => {
            const cleanNewPhone = String(newLead?.phone || '').replace(/\D/g, '').slice(-10);
            const filtered = (prev.recentLeads || []).filter(l => {
              if (l.id === newLead.id) return false;
              if (cleanNewPhone && String(l.phone || '').replace(/\D/g, '').slice(-10) === cleanNewPhone) return false;
              return true;
            });
            const updatedLeads = [{
              ...newLead,
              source: newLead?.source || 'QR Code (Campus Reception)'
            }, ...filtered];
            return {
              ...prev,
              recentLeads: updatedLeads,
              stats: {
                ...prev.stats,
                newLeadsThisMonth: updatedLeads.length,
              },
            };
          });
        }}
        onBackToCRM={() => {
          window.location.hash = "";
          setCurrentHash("");
        }}
      />
    );
  }

  const handleTabChange = (tab) => {
    if (!VALID_TABS.includes(tab)) return;
    setSelectedStudentForProfile(null);
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        data={instituteData}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenNewLead={() => setIsLeadModalOpen(true)}
          onOpenNewAdmission={() => {
            setLeadForConversion(null);
            setIsAdmissionModalOpen(true);
          }}
          onOpenPayment={() => setIsPaymentModalOpen(true)}
          onRefresh={fetchDashboardData}
          isRefreshing={isRefreshing}
          dbStatus={dbStatus}
          data={instituteData}
          onNavigate={handleTabChange}
        />

        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>

      {/* Modals */}
      <NewLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onLeadCreated={handleLeadCreated}
        courses={instituteData.courses}
        trainers={instituteData.trainers}
        existingLeads={instituteData.recentLeads}
      />

      {/* Admissions Conversion & New Admission Modal */}
      <AdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => {
          setIsAdmissionModalOpen(false);
          setLeadForConversion(null);
        }}
        leadToConvert={leadForConversion}
        courses={instituteData.courses}
        batches={instituteData.batches}
        trainers={instituteData.trainers}
        onAdmissionCreated={handleAdmissionCreated}
      />

      {/* Admission Confirmation Slip & Letter Modal */}
      <AdmissionConfirmationModal
        admission={confirmedAdmissionLetter}
        onClose={() => setConfirmedAdmissionLetter(null)}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentRecorded={handlePaymentRecorded}
        students={instituteData.students}
        courses={instituteData.courses}
      />

      <NewBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onBatchCreated={handleBatchCreated}
        courses={instituteData.courses}
      />

      <NewCourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setCourseForEdit(null);
        }}
        onCourseCreated={handleCourseCreated}
        courseToEdit={courseForEdit}
        trainers={instituteData.trainers || []}
      />

      <ReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <StudentIDModal
        student={selectedStudentID}
        onClose={() => setSelectedStudentID(null)}
      />

      {/* Share QR Code & Front-Desk Standee Modal */}
      <ShareQRModal
        isOpen={isShareQROpen}
        onClose={() => setIsShareQROpen(false)}
        courses={instituteData.courses}
      />
    </div>
  );
}

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
import { initialInstituteData, OFFICIAL_COURSES } from "./data/constants";

const STORAGE_KEY = 'edupulse_institute_crm_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Persistent institute state initialized from localStorage
  const [instituteData, setInstituteData] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);

          // Merge loaded courses with OFFICIAL_COURSES so all real courses are present
          const existingCourses = Array.isArray(parsed.courses) ? parsed.courses : [];
          const courseMap = new Map();
          OFFICIAL_COURSES.forEach(c => courseMap.set(c.name, c));
          existingCourses.forEach(c => {
            if (c && c.name) courseMap.set(c.name, { ...c });
          });
          const mergedInitialCourses = Array.from(courseMap.values());

          // Fix QR source for Riya if currently Website or missing
          const fixedLeads = (Array.isArray(parsed.recentLeads) ? parsed.recentLeads : []).map(l => {
            if (l && (l.name === 'Riya' || l.id === 1795421032576) && (!l.source || l.source === 'Website')) {
              return { ...l, source: 'QR Code (Campus Reception)' };
            }
            return l;
          });

          return {
            ...initialInstituteData,
            ...parsed,
            recentLeads: fixedLeads,
            trainers: Array.isArray(parsed.trainers) ? parsed.trainers : [],
            admissions: Array.isArray(parsed.admissions) ? parsed.admissions : [],
            students: Array.isArray(parsed.students) ? parsed.students : [],
            courses: mergedInitialCourses,
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
        const response = await fetch("http://localhost:5000/api/students");
        const result = await response.json();

        if (result.success) {
          console.log(result);
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
            // Smart merge for leads
            const serverLeads = Array.isArray(result.recentLeads) ? result.recentLeads : [];
            const localLeads = Array.isArray(prev.recentLeads) ? prev.recentLeads : [];
            let mergedLeads = localLeads;
            if (serverLeads.length > 0 && localLeads.length === 0) {
              mergedLeads = serverLeads;
            } else if (serverLeads.length > 0 && localLeads.length > 0) {
              const map = new Map();
              localLeads.forEach(l => map.set(l.id || l.phone, l));
              serverLeads.forEach(l => map.set(l.id || l.phone, l));
              mergedLeads = Array.from(map.values());
            } else if (localLeads.length > 0 && serverLeads.length === 0) {
              localLeads.forEach(l => {
                fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(l)
                }).catch(() => null);
              });
              mergedLeads = localLeads;
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
              localTrainers.forEach(t => tMap.set(t.id || t.employeeId, t));
              serverTrainers.forEach(t => tMap.set(t.id || t.employeeId, t));
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

            // Smart merge for courses (includes all official courses from database and constants)
            const serverCourses = Array.isArray(result.courses) ? result.courses : [];
            const localCourses = Array.isArray(prev.courses) ? prev.courses : [];
            const cMap = new Map();
            OFFICIAL_COURSES.forEach(c => cMap.set(c.name, c));
            localCourses.forEach(c => {
              if (c && c.name) cMap.set(c.name, { ...cMap.get(c.name), ...c });
            });
            serverCourses.forEach(c => {
              if (c && c.name) cMap.set(c.name, { ...cMap.get(c.name), ...c });
            });
            const mergedCourses = Array.from(cMap.values());

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

            // Smart merge for admissions
            const serverAdmissions = Array.isArray(result.admissions) ? result.admissions : [];
            const localAdmissions = Array.isArray(prev.admissions) ? prev.admissions : [];
            let mergedAdmissions = localAdmissions;
            if (serverAdmissions.length > 0 && localAdmissions.length === 0) {
              mergedAdmissions = serverAdmissions;
            } else if (serverAdmissions.length > 0 && localAdmissions.length > 0) {
              const aMap = new Map();
              localAdmissions.forEach(a => aMap.set(a.id || a.admissionNo, a));
              serverAdmissions.forEach(a => aMap.set(a.id || a.admissionNo, a));
              mergedAdmissions = Array.from(aMap.values());
            } else if (localAdmissions.length > 0 && serverAdmissions.length === 0) {
              localAdmissions.forEach(a => {
                fetch('/api/admissions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(a)
                }).catch(() => null);
              });
              mergedAdmissions = localAdmissions;
            }

            // Smart merge for students
            const serverStudents = Array.isArray(result.students) ? result.students : [];
            const localStudents = Array.isArray(prev.students) ? prev.students : [];
            let mergedStudents = localStudents;
            if (serverStudents.length > 0 && localStudents.length === 0) {
              mergedStudents = serverStudents;
            } else if (serverStudents.length > 0 && localStudents.length > 0) {
              const sMap = new Map();
              localStudents.forEach(s => sMap.set(s.id || s.studentId || s.admissionNo, s));
              serverStudents.forEach(s => sMap.set(s.id || s.studentId || s.admissionNo, s));
              mergedStudents = Array.from(sMap.values());
            } else if (localStudents.length > 0 && serverStudents.length === 0) {
              mergedStudents = localStudents;
            }

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
  const handleLeadCreated = (newLead) => {
    setInstituteData((prev) => {
      const updatedLeads = [newLead, ...prev.recentLeads];
      return {
        ...prev,
        recentLeads: updatedLeads,
        stats: {
          ...prev.stats,
          newLeadsThisMonth: updatedLeads.length,
        },
      };
    });
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead)
    }).catch(() => null);
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

      // 2. Add to students roster if not present
      const updatedStudents =
        newStudent ? [newStudent, ...(prev.students || [])] : (prev.students || []);
      const updatedAdmissions = [safeAdmission, ...(prev.admissions || [])];

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

    // Persist admission, student and fee record to backend and DB
    fetch('/api/admissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newAdmission,
        studentId: newStudent?.studentId,
        admissionFeePaid: newAdmission.admissionFeePaid
      })
    }).catch(() => null);
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

  const handleDeleteCourse = (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    setInstituteData(prev => {
      const updatedCourses = prev.courses.filter(c => c.id !== courseId);
      return {
        ...prev,
        courses: updatedCourses,
        stats: {
          ...prev.stats,
          activeCourses: updatedCourses.length
        }
      };
    });

    fetch(`/api/courses/${courseId}`, {
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
    setInstituteData(prev => ({
      ...prev,
      trainers: (prev.trainers || []).map(t => (t.id === updatedTrainer.id ? updatedTrainer : t))
    }));
    fetch(`/api/trainers/${updatedTrainer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTrainer)
    }).catch(() => null);
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
            onNavigate={(tab) => setActiveTab(tab)}
            onConvertToAdmission={handleConvertToAdmission}
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
          />
        );
      case "courses":
        return (
          <CoursesModule
            courses={instituteData.courses}
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
      case 'students':
        if (selectedStudentForProfile) {
          return (
            <StudentProfile
              student={selectedStudentForProfile}
              onBack={() => setSelectedStudentForProfile(null)}
              onOpenPayment={() => setIsPaymentModalOpen(true)}
            />
          );
        }
        return (
          <StudentsModule
            students={instituteData.students}
            onOpenStudentID={(student) => setSelectedStudentID(student)}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
            onOpenStudentProfile={(student) => setSelectedStudentForProfile(student)}
          />
        );
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
            onNavigate={(tab) => setActiveTab(tab)}
            onConvertToAdmission={handleConvertToAdmission}
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
          handleLeadCreated({
            ...newLead,
            source: newLead?.source || 'QR Code (Campus Reception)'
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

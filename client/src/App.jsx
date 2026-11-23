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
import NewLeadModal from './components/NewLeadModal';
import AdmissionModal from './components/AdmissionModal';
import AdmissionConfirmationModal from './components/AdmissionConfirmationModal';
import RecordPaymentModal from './components/RecordPaymentModal';
import NewBatchModal from './components/NewBatchModal';
import NewCourseModal from './components/NewCourseModal';
import ReceiptModal from './components/ReceiptModal';
import StudentIDModal from './components/StudentIDModal';
import ShareQRModal from './components/ShareQRModal';
import PublicInquiryForm from './components/PublicInquiryForm';

import { initialInstituteData } from './data/mockData';

const STORAGE_KEY = 'edupulse_institute_crm_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Persistent institute state initialized from localStorage
  const [instituteData, setInstituteData] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('edupulse_institute_crm_v1');
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const cleanCourses = (Array.isArray(parsed.courses) ? parsed.courses : [])
            .filter(c => !['FSWD-101', 'DSML-201', 'UIUX-301', 'SEC-501', 'CLD-601', 'DM-401'].includes(c.code));
          const cleanBatches = (Array.isArray(parsed.batches) ? parsed.batches : [])
            .filter(b => !['FSWD Morning Batch (M26)', 'FSWD Evening Batch (E12)', 'Data Science Weekend Cohort (DS-14)', 'UI/UX Evening Batch (U4)', 'Cyber Security Sprint Cohort (SEC-09)', 'Cloud DevOps Weekend (CLD-02)'].includes(b.name));

          return {
            ...initialInstituteData,
            ...parsed,
            recentLeads: Array.isArray(parsed.recentLeads) ? parsed.recentLeads : [],
            trainers: Array.isArray(parsed.trainers) ? parsed.trainers : [],
            admissions: Array.isArray(parsed.admissions) ? parsed.admissions : [],
            students: Array.isArray(parsed.students) ? parsed.students : [],
            courses: cleanCourses,
            batches: cleanBatches,
            feeTransactions: Array.isArray(parsed.feeTransactions) ? parsed.feeTransactions : [],
            revenueTimeline: Array.isArray(parsed.revenueTimeline) ? parsed.revenueTimeline : [],
            stats: {
              ...(parsed.stats || initialInstituteData.stats),
              activeCourses: cleanCourses.length,
              activeBatches: cleanBatches.length
            }
          };
        }
      }
    } catch (err) {
      console.warn('Could not read from localStorage:', err);
    }
    return initialInstituteData;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState({ connected: false, engine: 'PostgreSQL' });
  const [currentHash, setCurrentHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');

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
  const [confirmedAdmissionLetter, setConfirmedAdmissionLetter] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForEdit, setCourseForEdit] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedStudentID, setSelectedStudentID] = useState(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);

  // Force pure light theme & listen to URL hash for QR public form
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');

    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial dashboard stats & DB status from Express backend
  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, healthRes] = await Promise.all([
        fetch('/api/dashboard/stats').catch(() => null),
        fetch('/api/health').catch(() => null)
      ]);

      if (healthRes && healthRes.ok) {
        const health = await healthRes.json();
        setDbStatus(health.database || { connected: false });
      }

      if (statsRes && statsRes.ok) {
        const result = await statsRes.json();
        if (result.success) {
          setInstituteData(prev => {
            // Smart merge for leads: never wipe existing local leads with empty array
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
              // Sync local leads up to server so server also has them
              localLeads.forEach(l => {
                fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(l)
                }).catch(() => null);
              });
              mergedLeads = localLeads;
            }

            // Smart merge for trainers
            const serverTrainers = Array.isArray(result.trainers) ? result.trainers : [];
            const localTrainers = Array.isArray(prev.trainers) ? prev.trainers : [];
            let mergedTrainers = localTrainers;
            if (serverTrainers.length > 0 && localTrainers.length === 0) {
              mergedTrainers = serverTrainers;
            } else if (serverTrainers.length > 0 && localTrainers.length > 0) {
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

            return {
              ...prev,
              stats: result.stats || prev.stats,
              courses: (result.courses && result.courses.length > 0) ? result.courses : prev.courses,
              batches: (result.batches && result.batches.length > 0) ? result.batches : prev.batches,
              recentLeads: mergedLeads,
              trainers: mergedTrainers,
              admissions: (result.admissions && result.admissions.length > 0) ? result.admissions : prev.admissions,
              students: (result.students && result.students.length > 0) ? result.students : prev.students,
              feeTransactions: (result.feeTransactions && result.feeTransactions.length > 0) ? result.feeTransactions : prev.feeTransactions,
              revenueTimeline: result.revenueTimeline || prev.revenueTimeline,
            };
          });
        }
      }
    } catch (err) {
      console.warn('Backend running in local fallback mode:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handlers for Leads
  const handleLeadCreated = (newLead) => {
    setInstituteData(prev => {
      const updatedLeads = [newLead, ...prev.recentLeads];
      return {
        ...prev,
        recentLeads: updatedLeads,
        stats: {
          ...prev.stats,
          newLeadsThisMonth: updatedLeads.length
        }
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
    setInstituteData(prev => ({
      ...prev,
      recentLeads: prev.recentLeads.map(l => (l.id === leadId ? { ...l, status: newStatus } : l))
    }));
    fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
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
    setInstituteData(prev => {
      // 1. Mark corresponding lead as converted
      const updatedLeads = prev.recentLeads.map(l => {
        if (l.id === newAdmission.leadId || l.name === newAdmission.studentName) {
          return { ...l, status: 'Lead Confirmed (Admitted)' };
        }
        return l;
      });

      // 2. Add to students roster if not present
      const updatedStudents = newStudent ? [newStudent, ...prev.students] : prev.students;
      const updatedAdmissions = [newAdmission, ...prev.admissions];

      // 3. Add to fee transactions if an admission fee was collected
      const updatedFees = [...prev.feeTransactions];
      const paidAmount = Number(newAdmission.admissionFeePaid) || 0;
      if (paidAmount > 0) {
        const rcpSeq = String(prev.feeTransactions.length + 1).padStart(4, '0');
        updatedFees.unshift({
          receiptNo: `RCP-2026-${rcpSeq}`,
          studentName: newAdmission.studentName,
          studentId: newStudent?.studentId || 'STU-NEW',
          course: newAdmission.course,
          amount: paidAmount,
          mode: 'Admission Registration (UPI / Bank)',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          collectedBy: newAdmission.counselor || 'Admissions Desk',
          status: 'Success'
        });
      }

      const totalRevenue = updatedFees.reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const totalPending = updatedStudents.reduce((acc, s) => acc + Number(s.feeDue || 0), 0);

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
          leadConversionRate: updatedLeads.length > 0 ? `${Math.round((updatedAdmissions.length / updatedLeads.length) * 100)}%` : '0%'
        }
      };
    });

    setLeadForConversion(null);
    // Show official admission confirmation letter modal
    setConfirmedAdmissionLetter(newAdmission);
  };

  const handleUpdateAdmissionStatus = (admId, newStatus) => {
    setInstituteData(prev => ({
      ...prev,
      admissions: prev.admissions.map(a => (a.id === admId ? { ...a, status: newStatus } : a))
    }));
    fetch(`/api/admissions/${admId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => null);
  };

  const handlePaymentRecorded = (newReceipt) => {
    setInstituteData(prev => {
      const updatedStudents = prev.students.map(s => {
        if (s.name.toLowerCase() === newReceipt.studentName.toLowerCase() || s.studentId === newReceipt.studentId) {
          const newPaid = Number(s.feePaid || 0) + Number(newReceipt.amount || 0);
          const newDue = Math.max(0, Number(s.feeTotal || 0) - newPaid);
          return {
            ...s,
            feePaid: newPaid,
            feeDue: newDue,
            feeStatus: newDue === 0 ? 'Paid' : 'Partial'
          };
        }
        return s;
      });

      const updatedFees = [newReceipt, ...prev.feeTransactions];
      const totalRevenue = updatedFees.reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const totalPending = updatedStudents.reduce((acc, s) => acc + Number(s.feeDue || 0), 0);

      return {
        ...prev,
        feeTransactions: updatedFees,
        students: updatedStudents,
        stats: {
          ...prev.stats,
          monthlyRevenue: totalRevenue,
          pendingFees: totalPending,
          feeCollectionRate: totalRevenue + totalPending > 0
            ? `${Math.round((totalRevenue / (totalRevenue + totalPending)) * 100)}%`
            : '100%'
        }
      };
    });
  };

  const handleBatchCreated = (newBatch) => {
    setInstituteData(prev => {
      const updatedBatches = [newBatch, ...prev.batches];
      return {
        ...prev,
        batches: updatedBatches,
        stats: {
          ...prev.stats,
          activeBatches: updatedBatches.length
        }
      };
    });
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
          activeCourses: updatedCourses.length
        }
      };
    });
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
      case 'dashboard':
        return (
          <Dashboard
            data={instituteData}
            onOpenNewLead={() => setIsLeadModalOpen(true)}
            onOpenNewAdmission={() => { setLeadForConversion(null); setIsAdmissionModalOpen(true); }}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
            onOpenConfirmationLetter={(adm) => setConfirmedAdmissionLetter(adm)}
            onNavigate={(tab) => setActiveTab(tab)}
            onConvertToAdmission={handleConvertToAdmission}
          />
        );
      case 'leads':
        return (
          <LeadsModule
            leads={instituteData.recentLeads}
            courses={instituteData.courses}
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
      case 'admissions':
        return (
          <AdmissionsModule
            admissions={instituteData.admissions}
            courses={instituteData.courses}
            batches={instituteData.batches}
            onOpenNewAdmission={() => { setLeadForConversion(null); setIsAdmissionModalOpen(true); }}
            onOpenConfirmationLetter={(adm) => setConfirmedAdmissionLetter(adm)}
            onUpdateAdmissionStatus={handleUpdateAdmissionStatus}
          />
        );
      case 'courses':
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
      case 'batches':
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
      case 'attendance':
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
            onOpenNewAdmission={() => { setLeadForConversion(null); setIsAdmissionModalOpen(true); }}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
            onOpenConfirmationLetter={(adm) => setConfirmedAdmissionLetter(adm)}
            onNavigate={(tab) => setActiveTab(tab)}
            onConvertToAdmission={handleConvertToAdmission}
          />
        );
    }
  };

  // If browser navigated to or scanned QR code (#inquire), show clean public inquiry form
  if (currentHash === '#inquire') {
    return (
      <PublicInquiryForm
        courses={instituteData.courses}
        onLeadSubmitted={(newLead) => {
          handleLeadCreated(newLead);
        }}
        onBackToCRM={() => {
          window.location.hash = '';
          setCurrentHash('');
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
          onOpenNewAdmission={() => { setLeadForConversion(null); setIsAdmissionModalOpen(true); }}
          onOpenPayment={() => setIsPaymentModalOpen(true)}
          onRefresh={fetchDashboardData}
          isRefreshing={isRefreshing}
          dbStatus={dbStatus}
          data={instituteData}
          onNavigate={handleTabChange}
        />

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <NewLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onLeadCreated={handleLeadCreated}
        courses={instituteData.courses}
        existingLeads={instituteData.recentLeads}
      />

      {/* Admissions Conversion & New Admission Modal */}
      <AdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => { setIsAdmissionModalOpen(false); setLeadForConversion(null); }}
        leadToConvert={leadForConversion}
        courses={instituteData.courses}
        batches={instituteData.batches}
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

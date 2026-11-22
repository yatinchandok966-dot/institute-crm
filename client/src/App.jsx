import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LeadsModule from './components/LeadsModule';
import AdmissionsModule from './components/AdmissionsModule';
import CoursesModule from './components/CoursesModule';
import BatchesModule from './components/BatchesModule';
import StudentsModule from './components/StudentsModule';
import FeesModule from './components/FeesModule';
import AttendanceModule from './components/AttendanceModule';

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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [instituteData, setInstituteData] = useState(initialInstituteData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState({ connected: false, engine: 'PostgreSQL' });
  const [currentHash, setCurrentHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');

  // Modal states
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isShareQROpen, setIsShareQROpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [leadForConversion, setLeadForConversion] = useState(null);
  const [confirmedAdmissionLetter, setConfirmedAdmissionLetter] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedStudentID, setSelectedStudentID] = useState(null);

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
          setInstituteData(prev => ({
            ...prev,
            stats: result.stats || prev.stats,
            courses: result.courses || prev.courses,
            batches: result.batches || prev.batches,
            recentLeads: result.recentLeads || prev.recentLeads,
            admissions: result.admissions || prev.admissions,
            students: result.students || prev.students,
            feeTransactions: result.feeTransactions || prev.feeTransactions,
            revenueTimeline: result.revenueTimeline || prev.revenueTimeline,
          }));
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
    setInstituteData(prev => ({
      ...prev,
      recentLeads: [newLead, ...prev.recentLeads],
      stats: {
        ...prev.stats,
        newLeadsThisMonth: (prev.stats.newLeadsThisMonth || 86) + 1
      }
    }));
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
    setInstituteData(prev => ({
      ...prev,
      recentLeads: prev.recentLeads.filter(l => l.id !== leadId)
    }));
    fetch(`/api/leads/${leadId}`, {
      method: 'DELETE'
    }).catch(() => null);
  };

  const handleBatchLeadsImported = (newLeads) => {
    if (!newLeads || newLeads.length === 0) return;
    setInstituteData(prev => ({
      ...prev,
      recentLeads: [...newLeads, ...prev.recentLeads],
      stats: {
        ...prev.stats,
        newLeadsThisMonth: (prev.stats.newLeadsThisMonth || 86) + newLeads.length
      }
    }));
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

      // 3. Add to fee transactions if an admission fee was collected
      const updatedFees = [...prev.feeTransactions];
      if (Number(newAdmission.admissionFeePaid) > 0) {
        updatedFees.unshift({
          receiptNo: `RCP-2026-0${90 + prev.feeTransactions.length + 1}`,
          studentName: newAdmission.studentName,
          studentId: newStudent?.studentId || 'STU-NEW',
          course: newAdmission.course,
          amount: Number(newAdmission.admissionFeePaid),
          mode: 'Admission Registration (UPI / Bank)',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          collectedBy: newAdmission.counselor || 'Admissions Desk',
          status: 'Success'
        });
      }

      return {
        ...prev,
        admissions: [newAdmission, ...prev.admissions],
        recentLeads: updatedLeads,
        students: updatedStudents,
        feeTransactions: updatedFees,
        stats: {
          ...prev.stats,
          confirmedAdmissions: (prev.stats.confirmedAdmissions || 24) + 1,
          totalStudents: (prev.stats.totalStudents || 342) + 1,
          monthlyRevenue: (prev.stats.monthlyRevenue || 642000) + (Number(newAdmission.admissionFeePaid) || 0)
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
          const newPaid = s.feePaid + Number(newReceipt.amount);
          const newDue = Math.max(0, s.feeTotal - newPaid);
          return {
            ...s,
            feePaid: newPaid,
            feeDue: newDue,
            feeStatus: newDue === 0 ? 'Paid' : 'Partial'
          };
        }
        return s;
      });

      return {
        ...prev,
        feeTransactions: [newReceipt, ...prev.feeTransactions],
        students: updatedStudents,
        stats: {
          ...prev.stats,
          monthlyRevenue: (prev.stats.monthlyRevenue || 642000) + Number(newReceipt.amount),
          pendingFees: Math.max(0, (prev.stats.pendingFees || 128500) - Number(newReceipt.amount))
        }
      };
    });
  };

  const handleBatchCreated = (newBatch) => {
    setInstituteData(prev => ({
      ...prev,
      batches: [newBatch, ...prev.batches],
      stats: {
        ...prev.stats,
        activeBatches: (prev.stats.activeBatches || 5) + 1
      }
    }));
  };

  const handleCourseCreated = (newCourse) => {
    setInstituteData(prev => ({
      ...prev,
      courses: [newCourse, ...prev.courses],
      stats: {
        ...prev.stats,
        activeCourses: (prev.stats.activeCourses || 6) + 1
      }
    }));
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
            onOpenNewCourse={() => setIsCourseModalOpen(true)}
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
      case 'students':
        return (
          <StudentsModule
            students={instituteData.students}
            onOpenStudentID={(student) => setSelectedStudentID(student)}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
          />
        );
      case 'fees':
        return (
          <FeesModule
            feeTransactions={instituteData.feeTransactions}
            stats={instituteData.stats}
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

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
          onNavigate={(tab) => setActiveTab(tab)}
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
        onClose={() => setIsCourseModalOpen(false)}
        onCourseCreated={handleCourseCreated}
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

import React from 'react';
import {
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  Calendar,
  Layers,
  Code2,
  FileSpreadsheet
} from 'lucide-react';

export default function ModulePlaceholder({ moduleId, onBackToDashboard }) {
  const moduleDetails = {
    whatsapp: {
      title: 'WhatsApp & SMS Marketing Engine',
      category: 'Automation & Communication',
      badge: 'Upcoming in Sprint 2',
      description: 'Automate student journey communications from first inquiry to course graduation. Connects directly to WhatsApp Cloud API and Twilio SMS.',
      plannedFeatures: [
        'Instant welcome message & course brochure PDF sent on new inquiry creation',
        'Automated fee installment reminders with UPI payment link 3 days before due date',
        'Daily student attendance summary broadcast to parents',
        'Batch schedule change alerts and holiday notifications',
        'One-click mass broadcast to interested leads for upcoming batches'
      ],
      dbTables: ['whatsapp_logs', 'campaign_templates', 'sms_notifications'],
      color: 'from-emerald-500 to-teal-700'
    },
    branches: {
      title: 'Multi-Branch & Campus Manager',
      category: 'Enterprise Administration',
      badge: 'Upcoming in Sprint 3',
      description: 'Designed for expanding institutes with multiple learning centers, franchise partners, or separate city campuses.',
      plannedFeatures: [
        'Centralized dashboard with branch-wise revenue and admissions filter',
        'Classroom resource and seat occupancy tracker per campus',
        'Branch manager & staff access control with role segregation',
        'Cross-branch student transfers and batch reallocation',
        'Consolidated franchise royalty and tax reporting'
      ],
      dbTables: ['branches', 'classrooms', 'branch_staff_mapping', 'branch_accounts'],
      color: 'from-blue-600 to-indigo-800'
    },
    certificates: {
      title: 'Digital Certificates & QR Verification',
      category: 'Academics & Credentials',
      badge: 'Upcoming in Sprint 3',
      description: 'One-click generate professional graduation certificates with unique verification QR codes and automated student portfolio links.',
      plannedFeatures: [
        'Custom SVG / PDF certificate design templates per course',
        'Public verification link at verify.yourinstitute.com/cert/:id',
        'Automated LinkedIn "Add to Profile" certification button for graduates',
        'Grade, project score, and instructor signature inclusion',
        'Batch-wide certificate issuing on batch completion'
      ],
      dbTables: ['certificates', 'verification_tokens', 'certificate_templates'],
      color: 'from-purple-600 to-pink-700'
    },
    portal: {
      title: 'Student & Parent Mobile Portal',
      category: 'Mobile & LMS Integration',
      badge: 'Upcoming in Sprint 4',
      description: 'A mobile-friendly progressive web portal for students to review course schedules, study materials, project assignments, and fee receipts.',
      plannedFeatures: [
        'Student personalized timetable and lecture Zoom / Google Meet links',
        'Downloadable fee receipts and payment transaction history',
        'Assignment submission and instructor feedback tracker',
        'Real-time attendance percentage and warning indicators',
        'Direct chat with assigned mentor/counselor'
      ],
      dbTables: ['student_portal_users', 'assignments', 'submissions', 'study_materials'],
      color: 'from-sky-500 to-cyan-700'
    },
    'ai-counselor': {
      title: 'AI Admission Counselor Bot',
      category: 'Artificial Intelligence',
      badge: 'Upcoming in Sprint 4',
      description: 'AI conversational agent powered by Gemini to handle incoming website visitor inquiries 24/7 and qualify leads before human counselor follow-up.',
      plannedFeatures: [
        'Answers questions regarding course fees, curriculum syllabus, and job placement stats',
        'Screens prospective student background and recommends optimal course tracks',
        'Directly books demo class slots into CRM batches table',
        'Captures verified phone & email and registers into PostgreSQL leads table instantly'
      ],
      dbTables: ['ai_conversations', 'bot_qualified_leads', 'faq_embeddings'],
      color: 'from-amber-500 to-orange-700'
    },
    reports: {
      title: 'Advanced Financial & P&L Analytics',
      category: 'Financial Intelligence',
      badge: 'Upcoming in Sprint 5',
      description: 'Comprehensive financial reporting suite calculating course profitability, instructor payroll, lead acquisition costs (CAC), and forecasting.',
      plannedFeatures: [
        'Course-wise ROI and profitability calculator',
        'Counselor conversion rate and incentive calculation',
        'Monthly cash flow statement (Collected vs Overdue vs Expenses)',
        'One-click export to Tally / QuickBooks / Excel format'
      ],
      dbTables: ['expenses', 'staff_salaries', 'tax_reports', 'financial_logs'],
      color: 'from-indigo-600 to-violet-800'
    },
    database: {
      title: 'PostgreSQL Database Integration & Status',
      category: 'Infrastructure',
      badge: 'Architecture Ready',
      description: 'EduPulse CRM runs on PostgreSQL for relational data integrity (courses, students, batches, fee transactions).',
      plannedFeatures: [
        'Full schema file ready in server/schema.sql',
        'Node.js pg.Pool connection pool setup in server/db.js',
        'Graceful fallback system active when database is local or cloud hosted',
        'Configurable via environment variables (PGHOST, PGUSER, PGDATABASE, PGPORT)'
      ],
      dbTables: ['users', 'courses', 'batches', 'leads', 'students', 'enrollments', 'fee_payments'],
      color: 'from-slate-700 to-slate-900'
    },
    settings: {
      title: 'Institute Settings & Preferences',
      category: 'Configuration',
      badge: 'Settings',
      description: 'Configure your institute business details, branding, academic terms, and staff permissions.',
      plannedFeatures: [
        'Institute Name, Logo, Address, and GST / Tax registration details',
        'Counselor lead assignment round-robin logic',
        'Currency formats (₹ INR, $ USD, € EUR, £ GBP)',
        'Academic terms and session calendar configuration'
      ],
      dbTables: ['institute_settings', 'roles_permissions'],
      color: 'from-slate-600 to-slate-800'
    }
  };

  const details = moduleDetails[moduleId] || {
    title: `${moduleId.toUpperCase()} Module`,
    category: 'Institute Module',
    badge: 'Under Development',
    description: 'This module is scheduled as part of the institute management workflow roadmap.',
    plannedFeatures: [
      'Comprehensive data tables with PostgreSQL backend integration',
      'Export and import CSV / Excel files',
      'Granular role-based counselor and instructor permissions',
      'Automated email and SMS triggers'
    ],
    dbTables: [`tbl_${moduleId}`],
    color: 'from-indigo-600 to-blue-800'
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className={`p-8 rounded-2xl bg-gradient-to-r ${details.color} text-white shadow-lg relative overflow-hidden`}>
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/20">
              {details.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900">
              {details.badge}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">{details.title}</h2>
          <p className="text-white/80 max-w-2xl text-sm leading-relaxed">{details.description}</p>
          
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all shadow"
            >
              ← Back to Main Dashboard
            </button>
            <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Full backend schema ready in server/schema.sql</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Planned Features & Database Schema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Planned Features */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Planned Capabilities in Next Release</h3>
          </div>
          <ul className="space-y-3">
            {details.plannedFeatures.map((feat, index) => (
              <li key={index} className="flex items-start gap-3 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Database Integration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">PostgreSQL Schema & Tables</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The data entities for this module are architected for relational consistency, indexing, and fast querying in PostgreSQL:
          </p>
          <div className="flex flex-wrap gap-2">
            {details.dbTables.map((tbl, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-indigo-700 font-semibold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-400" />
                {tbl}
              </span>
            ))}
          </div>

          <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-900 leading-relaxed">
            💡 <strong>Next Step:</strong> You can request this specific screen to be fleshed out with full CRUD forms, student filters, and PostgreSQL queries at any time!
          </div>
        </div>
      </div>
    </div>
  );
}

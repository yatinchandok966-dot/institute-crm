import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  UserCheck,
  BookOpen,
  CalendarDays,
  GraduationCap,
  CreditCard,
  ClipboardCheck,
  School,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, data }) {
  const leadsCount = data?.recentLeads?.length || 5;
  const admissionsCount = data?.admissions?.length || 5;
  const batchesCount = data?.batches?.length || 5;
  const studentsCount = data?.students?.length || 5;

  const sections = [
    {
      title: 'RECRUITMENT & ADMISSIONS',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'leads', label: 'Leads & Inquiries', icon: UserPlus, badge: `${leadsCount}` },
        { id: 'admissions', label: 'Admissions Pipeline', icon: UserCheck, badge: `${admissionsCount} Confirmed`, badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
      ]
    },
    {
      title: 'ACADEMIC OPERATIONS',
      items: [
        { id: 'courses', label: 'Courses & Syllabus', icon: BookOpen },
        { id: 'batches', label: 'Batches & Cohorts', icon: CalendarDays, badge: `${batchesCount}` },
        { id: 'students', label: 'Students Directory', icon: GraduationCap, badge: `${studentsCount}` }
      ]
    },
    {
      title: 'FINANCE & ATTENDANCE',
      items: [
        { id: 'fees', label: 'Fees & Invoicing', icon: CreditCard, badge: 'Due', badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200' },
        { id: 'attendance', label: 'Attendance Register', icon: ClipboardCheck }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col h-screen border-r border-slate-200 sticky top-0 select-none z-20 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-slate-900 text-base tracking-tight leading-none">EduPulse CRM</h1>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Institute Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || (isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 border border-slate-200')
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Profile Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">admin@edupulse.org</p>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold">
            Director
          </span>
        </div>
      </div>
    </aside>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, CreditCard, CalendarDays, BookOpen, GraduationCap, LayoutDashboard, MessageSquare, Moon, Sun, ArrowRight, X } from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewLead,
  onOpenPayment,
  onOpenNewBatch,
  isDarkMode,
  onToggleDarkMode
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'lead', title: 'Register New Student Inquiry', icon: UserPlus, action: () => { onClose(); onOpenNewLead(); } },
    { id: 'fee', title: 'Record Fee Payment Receipt', icon: CreditCard, action: () => { onClose(); onOpenPayment(); } },
    { id: 'batch', title: 'Schedule New Batch / Cohort', icon: CalendarDays, action: () => { onClose(); onOpenNewBatch(); } },
    { id: 'theme', title: `Toggle Theme (${isDarkMode ? 'Switch to Light' : 'Switch to Dark'})`, icon: isDarkMode ? Sun : Moon, action: () => { onToggleDarkMode(); onClose(); } },
    { id: 'nav-dashboard', title: 'Go to Dashboard', icon: LayoutDashboard, action: () => { onNavigate('dashboard'); onClose(); } },
    { id: 'nav-leads', title: 'Go to Leads & Pipeline Kanban', icon: UserPlus, action: () => { onNavigate('leads'); onClose(); } },
    { id: 'nav-students', title: 'Go to Students Directory', icon: GraduationCap, action: () => { onNavigate('students'); onClose(); } },
    { id: 'nav-courses', title: 'Go to Courses & Syllabus', icon: BookOpen, action: () => { onNavigate('courses'); onClose(); } },
    { id: 'nav-batches', title: 'Go to Batches & Schedules', icon: CalendarDays, action: () => { onNavigate('batches'); onClose(); } },
    { id: 'nav-fees', title: 'Go to Fees & Invoicing', icon: CreditCard, action: () => { onNavigate('fees'); onClose(); } },
    { id: 'nav-wa', title: 'Go to WhatsApp & SMS Hub', icon: MessageSquare, action: () => { onNavigate('whatsapp'); onClose(); } },
  ];

  const filtered = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to module... (Press ESC to exit)"
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands or actions found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl+K</kbd> anywhere</span>
          <span>EduPulse OS</span>
        </div>
      </div>
    </div>
  );
}

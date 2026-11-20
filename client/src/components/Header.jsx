import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  RefreshCw
} from 'lucide-react';

export default function Header({
  onRefresh,
  isRefreshing,
  data,
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const leads = data?.recentLeads || [];
  const admissions = data?.admissions || [];
  const students = data?.students || [];

  const matched = searchQuery.trim().length > 1 ? {
    leads: leads.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.phone.includes(searchQuery)).slice(0, 3),
    admissions: admissions.filter(a => a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || a.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    students: students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentId.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
  } : null;

  const hasMatches = matched && (matched.leads.length > 0 || matched.admissions.length > 0 || matched.students.length > 0);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-lg relative" ref={searchRef}>
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search leads, admissions, students, phone numbers..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 1 && (
          <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 text-xs p-2 space-y-2">
            {!hasMatches ? (
              <div className="p-3 text-center text-slate-400">No matching records found</div>
            ) : (
              <>
                {matched.admissions.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Admissions</span>
                    {matched.admissions.map(a => (
                      <button
                        key={a.id}
                        onClick={() => { onNavigate('admissions'); setIsSearchOpen(false); }}
                        className="w-full text-left p-2 hover:bg-slate-50 rounded flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-900">{a.studentName} ({a.admissionNo})</span>
                        <span className="text-[10px] font-bold text-emerald-700">{a.status}</span>
                      </button>
                    ))}
                  </div>
                )}
                {matched.leads.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Leads</span>
                    {matched.leads.map(l => (
                      <button
                        key={l.id}
                        onClick={() => { onNavigate('leads'); setIsSearchOpen(false); }}
                        className="w-full text-left p-2 hover:bg-slate-50 rounded flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-900">{l.name}</span>
                        <span className="text-[10px] font-bold text-indigo-700">{l.status}</span>
                      </button>
                    ))}
                  </div>
                )}
                {matched.students.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Students</span>
                    {matched.students.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { onNavigate('students'); setIsSearchOpen(false); }}
                        className="w-full text-left p-2 hover:bg-slate-50 rounded flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-900">{s.name} ({s.studentId})</span>
                        <span className="text-[10px] font-bold text-slate-600">{s.course}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{todayFormatted}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          title="Refresh Data"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>
    </header>
  );
}

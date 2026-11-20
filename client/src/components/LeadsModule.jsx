import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  UserCheck,
  Calendar,
  Clock,
  QrCode
} from 'lucide-react';

export default function LeadsModule({
  leads,
  courses,
  onOpenNewLead,
  onOpenShareQR,
  onUpdateLeadStatus,
  onConvertToAdmission
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const leadStages = [
    'New Inquiry',
    'Contacted',
    'Demo Scheduled',
    'Follow-up',
    'Lead Confirmed'
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'All' || lead.course === courseFilter;
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const openWhatsApp = (lead) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hello ${lead.name}, thank you for inquiring about ${lead.course} at EduPulse Academy. Our academic counselor is available to answer your questions or schedule a demo session. Let us know when you are available.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Leads & Inquiries
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {leads.length} Active Leads
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prospective student inquiries. Convert qualified leads directly into the Admissions Pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenShareQR}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg shadow-xs transition-all hover:border-slate-400"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span>Share QR Form</span>
          </button>

          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, phone, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Course:</span>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium max-w-[200px] truncate focus:outline-none"
            >
              <option value="All">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none"
            >
              <option value="All">All Stages</option>
              {leadStages.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Direct Professional Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Student Name & Contact</th>
                <th className="px-4 py-3.5">Program of Interest</th>
                <th className="px-4 py-3.5">Lead Source</th>
                <th className="px-4 py-3.5">Counselor</th>
                <th className="px-4 py-3.5">Next Follow-up</th>
                <th className="px-4 py-3.5">Current Stage</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No matching leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{lead.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 font-semibold">
                      {lead.course}
                    </td>
                    <td className="px-4 py-3.5">
                      {lead.source && lead.source.toLowerCase().includes('qr') ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <QrCode className="w-3 h-3 text-emerald-600" />
                          <span>QR Code Form</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {lead.source}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {lead.counselor}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {lead.followUp || 'Scheduled'}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
                        className="text-[11px] font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
                      >
                        {leadStages.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Primary Action: Convert to Admission */}
                        <button
                          onClick={() => onConvertToAdmission(lead)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors border border-indigo-200 inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Convert to Admission →</span>
                        </button>

                        <button
                          onClick={() => openWhatsApp(lead)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="Message on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Call Student"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

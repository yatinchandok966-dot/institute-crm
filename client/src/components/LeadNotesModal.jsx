import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  MessageSquare,
  PhoneCall,
  Calendar,
  Clock,
  User,
  Plus,
  Flame,
  Sun,
  Snowflake,
  Send,
  PhoneForwarded,
  CheckCircle2,
  FileText
} from 'lucide-react';

const CALL_OUTCOMES = [
  'Connected - Interested',
  'Counselling Scheduled',
  'Call Back Requested',
  'Ringing / No Answer',
  'Busy',
  'Wrong Number',
  'Not Interested / Lost'
];

export default function LeadNotesModal({
  isOpen,
  onClose,
  lead,
  onAddNote,
  onLogCall
}) {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'calls'
  const [newNoteText, setNewNoteText] = useState('');

  // Call log form state
  const [callData, setCallData] = useState({
    outcome: 'Connected - Interested',
    duration: '3m 00s',
    notes: '',
    counselor: lead?.counselor || 'Counselor',
    updateFollowUp: true,
    nextFollowUpDate: ''
  });

  if (!isOpen || !lead) return null;

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote = {
      id: Date.now(),
      text: newNoteText.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: lead.counselor || 'Academic Counselor'
    };

    onAddNote(lead.id, newNote);
    setNewNoteText('');
  };

  const handleLogCallSubmit = (e) => {
    e.preventDefault();
    const newCall = {
      id: Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      duration: callData.duration || '2m 15s',
      outcome: callData.outcome,
      notes: callData.notes,
      counselor: callData.counselor || lead.counselor || 'Admissions Counselor'
    };

    onLogCall(lead.id, newCall, callData.updateFollowUp ? callData.nextFollowUpDate : null);
    setCallData({
      outcome: 'Connected - Interested',
      duration: '3m 00s',
      notes: '',
      counselor: lead?.counselor || 'Counselor',
      updateFollowUp: true,
      nextFollowUpDate: ''
    });
  };

  const notesList = lead.notesList || (lead.notes ? [
    { id: 1, text: lead.notes, date: lead.createdAt || '2026-11-20', author: lead.counselor || 'System' }
  ] : []);

  const callHistory = lead.callHistory || [];

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Clean Light Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-2xs">
              {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">{lead.name}</h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  lead.priority === 'Hot'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : lead.priority === 'Warm'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {lead.priority === 'Hot' && <Flame className="w-3 h-3 text-rose-500" />}
                  {lead.priority === 'Warm' && <Sun className="w-3 h-3 text-amber-500" />}
                  {lead.priority === 'Cold' && <Snowflake className="w-3 h-3 text-sky-500" />}
                  <span>{lead.priority || 'Warm'} Priority</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lead.course} • <span className="font-mono text-slate-700 font-semibold">{lead.phone}</span>
                {lead.city ? ` • ${lead.city}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lead Notes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800">
              {notesList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calls')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'calls'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call History & Logs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
              {callHistory.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {activeTab === 'notes' ? (
            <div className="space-y-4">
              {/* Add Note Input */}
              <form onSubmit={handleAddNoteSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-semibold text-slate-800 text-xs">
                  Add New Note / Follow-up Observation
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Type counselor remarks, student questions, batch preferences..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all self-end flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

              {/* Notes Timeline */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Notes Timeline
                </h4>
                {notesList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No notes recorded yet. Add your first counselor note above.
                  </div>
                ) : (
                  notesList.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <User className="w-3 h-3 text-indigo-500" />
                          {note.author}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {note.date}
                        </span>
                      </div>
                      <p className="text-slate-800 text-xs whitespace-pre-wrap font-medium">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Log Call Form */}
              <form onSubmit={handleLogCallSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <PhoneForwarded className="w-4 h-4 text-emerald-600" />
                  <span>Log Telephonic Conversation</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Call Outcome
                    </label>
                    <select
                      value={callData.outcome}
                      onChange={(e) => setCallData({ ...callData, outcome: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CALL_OUTCOMES.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Call Duration
                    </label>
                    <input
                      type="text"
                      value={callData.duration}
                      onChange={(e) => setCallData({ ...callData, duration: e.target.value })}
                      placeholder="e.g. 3m 45s"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Discussion Summary / Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={callData.notes}
                    onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
                    placeholder="Briefly describe what was discussed, objections raised, next steps agreed..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="updateFollowUp"
                      checked={callData.updateFollowUp}
                      onChange={(e) => setCallData({ ...callData, updateFollowUp: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="updateFollowUp" className="text-slate-700 font-semibold cursor-pointer">
                      Schedule Next Follow-up:
                    </label>
                    {callData.updateFollowUp && (
                      <input
                        type="datetime-local"
                        value={callData.nextFollowUpDate}
                        onChange={(e) => setCallData({ ...callData, nextFollowUpDate: e.target.value })}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Call Log</span>
                  </button>
                </div>
              </form>

              {/* Call History List */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Call History Records
                </h4>
                {callHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No calls recorded yet. Use the form above to log counseling call conversations.
                  </div>
                ) : (
                  callHistory.map((call) => (
                    <div
                      key={call.id}
                      className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            call.outcome.includes('Interested') || call.outcome.includes('Scheduled')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : call.outcome.includes('Requested')
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {call.outcome}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            Duration: {call.duration}
                          </span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {call.date}
                        </span>
                      </div>

                      {call.notes && (
                        <p className="text-slate-700 text-xs mt-1">
                          {call.notes}
                        </p>
                      )}

                      <div className="text-[10px] text-slate-400 font-medium">
                        Logged by: {call.counselor}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

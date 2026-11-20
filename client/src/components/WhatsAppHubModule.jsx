import React, { useState } from 'react';
import { MessageSquareText, Send, Sparkles, UserCheck, CheckCircle2, Phone, Copy, ExternalLink } from 'lucide-react';

export default function WhatsAppHubModule({ leads, students, templates }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || 'demo_invite');
  const [recipientType, setRecipientType] = useState('leads'); // 'leads' | 'students'
  const [selectedRecipientId, setSelectedRecipientId] = useState(leads[0]?.id || '');
  const [customMessage, setCustomMessage] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const recipientList = recipientType === 'leads' ? leads : students;
  const selectedRecipient = recipientList.find(r => r.id === Number(selectedRecipientId)) || recipientList[0];

  // Helper to substitute variables
  const formatMessage = () => {
    if (!currentTemplate || !selectedRecipient) return '';
    let text = currentTemplate.message;
    text = text.replace(/{{name}}/g, selectedRecipient.name || 'Student');
    text = text.replace(/{{course}}/g, selectedRecipient.course || 'Professional Certification');
    text = text.replace(/{{amount}}/g, selectedRecipient.feeDue || '15,000');
    text = text.replace(/{{dueDate}}/g, '25 Nov 2026');
    text = text.replace(/{{studentId}}/g, selectedRecipient.studentId || 'STU-2026');
    text = text.replace(/{{batchName}}/g, selectedRecipient.batch || 'FSWD Morning Cohort');
    text = text.replace(/{{startDate}}/g, 'Monday, 10:00 AM');
    text = text.replace(/{{schedule}}/g, 'Mon-Fri 09:00 AM - 11:30 AM');
    text = text.replace(/{{instructor}}/g, 'Prof. Alex Rivera');
    text = text.replace(/{{date}}/g, new Date().toLocaleDateString());
    return text;
  };

  const activeMessage = customMessage || formatMessage();

  const handleSendWhatsApp = () => {
    if (!selectedRecipient) return;
    const phone = selectedRecipient.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(activeMessage);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              WhatsApp & Student Communication Hub
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Live Click-to-Chat Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch demo invitations, fee reminders, batch start notices, and syllabus PDFs directly to student WhatsApp numbers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Picker (Col 1) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Pre-Built Message Templates
          </h3>
          <div className="space-y-2">
            {templates.map(tmpl => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => { setSelectedTemplateId(tmpl.id); setCustomMessage(''); }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{tmpl.title}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">{tmpl.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{tmpl.subject}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Composer & Preview (Col 2 & 3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Compose & Personalize Message
            </h3>

            {/* Recipient Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Recipient Group
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => { setRecipientType('leads'); setSelectedRecipientId(leads[0]?.id || ''); }}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      recipientType === 'leads'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    Prospective Leads ({leads.length})
                  </button>
                  <button
                    onClick={() => { setRecipientType('students'); setSelectedRecipientId(students[0]?.id || ''); }}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      recipientType === 'students'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    Enrolled Students ({students.length})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Select Recipient Contact
                </label>
                <select
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  {recipientList.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.phone}) — {r.course}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Message Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Live Message Content
                </label>
                <span className="text-slate-400 text-[11px]">
                  Variables are dynamically replaced
                </span>
              </div>
              <textarea
                rows={7}
                value={activeMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:shadow"
            >
              <Send className="w-4 h-4" />
              <span>Launch WhatsApp & Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

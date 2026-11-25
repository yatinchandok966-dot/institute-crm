import React, { useState } from 'react';
import { MessageSquareText, Send, Sparkles, UserCheck, CheckCircle2, Phone, Copy, ExternalLink } from 'lucide-react';

const defaultTemplates = [
  {
    id: 'demo_invite',
    title: 'Demo Session Invitation',
    category: 'Lead Follow-up',
    subject: 'Complimentary Expert Session',
    message: 'Hello {{name}}, welcome to EduPulse Academy! We have reserved your seat for the upcoming practical demo session for the {{course}} program. Please confirm if this time suits you.'
  },
  {
    id: 'fee_reminder',
    title: 'Tuition Fee Due Notice',
    category: 'Billing & Accounts',
    subject: 'Tuition Installment Reminder',
    message: 'Dear {{name}}, this is a gentle reminder from EduPulse Accounts regarding your remaining course tuition balance of ₹{{amount}}. Kindly complete the payment to maintain uninterrupted access to classes and portal.'
  },
  {
    id: 'batch_welcome',
    title: 'Batch Allotment & Onboarding',
    category: 'Admissions',
    subject: 'Welcome to Your Cohort',
    message: 'Congratulations {{name}}! Your admission to {{course}} is confirmed. Your assigned batch is {{batchName}}. Classes begin on {{startDate}}. Please arrive 15 minutes early.'
  }
];

export default function WhatsAppHubModule({ leads = [], students = [], templates = defaultTemplates }) {
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
    text = text.replace(/{{course}}/g, selectedRecipient.course || 'Certification Program');
    text = text.replace(/{{amount}}/g, String(selectedRecipient.feeDue || 0));
    text = text.replace(/{{studentId}}/g, selectedRecipient.studentId || 'N/A');
    text = text.replace(/{{batchName}}/g, selectedRecipient.batch || 'Assigned Cohort');
    text = text.replace(/{{startDate}}/g, 'Upcoming Scheduled Date');
    return text;
  };

  const activeMessage = customMessage || formatMessage();

  const handleSendWhatsApp = () => {
    if (!selectedRecipient || !selectedRecipient.phone) return;
    const phone = selectedRecipient.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(activeMessage);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const handleCopy = () => {
    if (!activeMessage) return;
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              WhatsApp & Student Communication Hub
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Direct Click-to-Chat
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch demo invitations, fee reminders, batch start notices, and announcements directly to student WhatsApp numbers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Picker (Col 1) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm">
            Message Templates
          </h3>
          <div className="space-y-2">
            {templates.map(tmpl => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => { setSelectedTemplateId(tmpl.id); setCustomMessage(''); }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Compose & Personalize Message
            </h3>

            {/* Recipient Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Recipient Group
                </label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => { setRecipientType('leads'); setSelectedRecipientId(leads[0]?.id || ''); }}
                    className={`flex-1 py-1.5 rounded font-bold text-xs transition-all ${
                      recipientType === 'leads'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Prospective Leads ({leads.length})
                  </button>
                  <button
                    onClick={() => { setRecipientType('students'); setSelectedRecipientId(students[0]?.id || ''); }}
                    className={`flex-1 py-1.5 rounded font-bold text-xs transition-all ${
                      recipientType === 'students'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Enrolled Students ({students.length})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Select Recipient Contact
                </label>
                <select
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {recipientList.length === 0 ? (
                    <option value="">No contacts in this group</option>
                  ) : (
                    recipientList.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.phone}) — {r.course}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Live Message Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-bold text-slate-700">
                  Live Message Content
                </label>
                <span className="text-slate-400 text-[11px]">
                  Variables are dynamically populated
                </span>
              </div>
              <textarea
                rows={6}
                value={activeMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={recipientList.length === 0 ? "Select or add a contact to generate a personalized message..." : "Compose WhatsApp message..."}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleCopy}
              disabled={!activeMessage}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              disabled={!selectedRecipient}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
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

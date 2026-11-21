import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function NewLeadModal({ isOpen, onClose, onLeadCreated, courses }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: courses?.[0]?.name || 'Full Stack Web Development (MERN)',
    source: 'Website Form',
    counselor: 'Admissions Counselor',
    followUp: 'Call Pending',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Student Name and Phone are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      status: 'New Inquiry',
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        onLeadCreated(data.lead);
        onClose();
      } else {
        onLeadCreated({ id: Date.now(), ...payload });
        onClose();
      }
    } catch {
      onLeadCreated({ id: Date.now(), ...payload });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Record New Lead Inquiry</h3>
              <p className="text-xs text-slate-400">Captures prospective student details for counseling follow-up</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Website Form">Website Form</option>
                <option value="Walk-in">Walk-in Inquiry</option>
                <option value="Instagram Ad">Instagram Ad</option>
                <option value="Google Search Ad">Google Search Ad</option>
                <option value="Student Referral">Student Referral</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Program of Interest *
            </label>
            <select
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {courses?.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} (Fee: ₹{c.fee.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Counselor
              </label>
              <select
                value={formData.counselor}
                onChange={(e) => setFormData({ ...formData, counselor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Admissions Counselor">Admissions Counselor</option>
                <option value="Senior Academic Counselor">Senior Academic Counselor</option>
                <option value="Campus Front Desk">Campus Front Desk</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Follow-up Schedule
              </label>
              <input
                type="text"
                value={formData.followUp}
                onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                placeholder="e.g. Tomorrow 11:00 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Inquiry Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Inquired about weekend batch, fee discounts, demo class..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Register Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

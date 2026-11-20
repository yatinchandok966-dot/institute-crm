import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';

export default function NewCourseModal({ isOpen, onClose, onCourseCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Software Development',
    durationWeeks: 12,
    fee: 40000,
    description: '',
    modules: 'Module 1: Foundations & Architecture\nModule 2: Advanced Implementation\nModule 3: Industry Capstone Project'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const parsedModules = formData.modules.split('\n').filter(m => m.trim().length > 0);

    const newCourse = {
      id: Date.now(),
      name: formData.name,
      code: formData.code || `CRS-${Date.now().toString().slice(-4)}`,
      category: formData.category,
      durationWeeks: Number(formData.durationWeeks) || 12,
      fee: Number(formData.fee) || 40000,
      description: formData.description,
      modules: parsedModules,
      activeStudents: 0
    };

    onCourseCreated(newCourse);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Add New Course Program</h3>
              <p className="text-[11px] text-slate-300">Define course code, fee tiers, duration, and syllabus</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence & LLM Engineering"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. AI-501"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Software Development">Software Development</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Duration (Weeks) *
              </label>
              <input
                type="number"
                min="2"
                max="52"
                value={formData.durationWeeks}
                onChange={(e) => setFormData({ ...formData, durationWeeks: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tuition Fee (INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="1000"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Course Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of course competencies and tools covered..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Curriculum Outline (One per line)
            </label>
            <textarea
              rows={3}
              value={formData.modules}
              onChange={(e) => setFormData({ ...formData, modules: e.target.value })}
              className="w-full px-3 py-2 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Course'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

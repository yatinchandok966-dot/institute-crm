// NewCourseModal.jsx
import React, { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';

export default function NewCourseModal({
  isOpen,
  onClose,
  onCourseCreated,
  trainers = [],
  courseToEdit = null
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Software Development',
    trainerId: '',
    durationWeeks: 12,
    fee: 40000,
    description: '',
    modules: ''
  });

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        name: courseToEdit.name || '',
        category: courseToEdit.category || 'Software Development',
        trainerId: courseToEdit.trainerId || '',
        durationWeeks: courseToEdit.durationWeeks || 12,
        fee: courseToEdit.fee || 40000,
        description: courseToEdit.description || '',
        modules: courseToEdit.modules ? courseToEdit.modules.join('\n') : ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Software Development',
        trainerId: '',
        durationWeeks: 12,
        fee: 40000,
        description: '',
        modules: 'Module 1: Foundations\nModule 2: Advanced Implementation'
      });
    }
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  // Auto-generate a clean, professional course code like MERN-201 or CRS-2970
  const generateCourseCode = (title) => {
    if (!title || !title.trim()) return `CRS-${Math.floor(1000 + Math.random() * 9000)}`;
    const clean = title.trim().replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
    const prefix = clean.length >= 2 ? clean : 'CRS';
    return `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedModules = formData.modules.split('\n').filter(m => m.trim().length > 0);
    const selectedTrainer = trainers.find(t => String(t.id) === String(formData.trainerId));

    const finalCode = (courseToEdit && courseToEdit.code)
      ? courseToEdit.code
      : generateCourseCode(formData.name);

    const courseData = {
      id: courseToEdit ? courseToEdit.id : Date.now(),
      name: formData.name.trim(),
      code: finalCode,
      category: formData.category,
      trainerId: formData.trainerId,
      trainerName: selectedTrainer ? selectedTrainer.name : 'Unassigned',
      durationWeeks: Number(formData.durationWeeks),
      fee: Number(formData.fee),
      description: formData.description,
      modules: parsedModules,
      activeStudents: courseToEdit ? courseToEdit.activeStudents : 0
    };

    onCourseCreated(courseData, !!courseToEdit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                {courseToEdit ? 'Edit Course Program' : 'Add New Course'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Course code will be auto-generated automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Course Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Full Stack Web Development (MERN)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Software Development">Software Development</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assign Trainer / Faculty
              </label>
              <select
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Unassigned --</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.role ? `(${t.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Duration (Weeks) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.durationWeeks}
                onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tuition Fee (INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Curriculum Outline (One module per line)
            </label>
            <textarea
              rows={4}
              placeholder="Module 1: Foundations&#10;Module 2: Advanced Implementation"
              value={formData.modules}
              onChange={(e) => setFormData({ ...formData, modules: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{courseToEdit ? 'Update Course' : 'Create Course'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

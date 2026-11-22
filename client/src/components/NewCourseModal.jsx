//NewCourseModal.jsx

import React, { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';

export default function NewCourseModal({ isOpen, onClose, onCourseCreated, trainers = [], courseToEdit = null }) {
  const [formData, setFormData] = useState({
    name: '', code: '', category: 'Software Development', trainerId: '', durationWeeks: 12, fee: 40000, description: '', modules: ''
  });

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        ...courseToEdit,
        modules: courseToEdit.modules ? courseToEdit.modules.join('\n') : ''
      });
    } else {
      setFormData({ name: '', code: '', category: 'Software Development', trainerId: '', durationWeeks: 12, fee: 40000, description: '', modules: 'Module 1: Foundations\nModule 2: Advanced Implementation' });
    }
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedModules = formData.modules.split('\n').filter(m => m.trim().length > 0);
    const selectedTrainer = trainers.find(t => t.id === formData.trainerId);

    const courseData = {
      id: courseToEdit ? courseToEdit.id : Date.now(),
      name: formData.name,
      code: formData.code || `CRS-${Date.now().toString().slice(-4)}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full border shadow-2xl flex flex-col">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center rounded-t-xl">
          <h3 className="font-bold text-sm flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-400"/> {courseToEdit ? 'Edit Course' : 'Add New Course'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Course Title *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Course Code</label>
              <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg uppercase" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Category *</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
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
              <label className="block font-semibold mb-1">Assign Trainer</label>
              <select value={formData.trainerId} onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="">-- Unassigned --</option>
                {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Duration (Weeks) *</label>
              <input type="number" min="2" required value={formData.durationWeeks} onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Tuition Fee (INR) *</label>
            <input type="number" min="1000" required value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-bold" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Curriculum Outline (One per line)</label>
            <textarea rows={4} value={formData.modules} onChange={(e) => setFormData({ ...formData, modules: e.target.value })} className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]" />
          </div>

          <div className="pt-3 border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {courseToEdit ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
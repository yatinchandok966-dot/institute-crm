// CoursesModule.jsx
import React, { useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  User,
  BookOpen,
  Eye,
  Clock,
  CreditCard,
  GraduationCap,
  X,
  Layers,
  Award
} from 'lucide-react';

export default function CoursesModule({
  courses = [],
  onOpenNewCourse,
  onEditCourse,
  onDeleteCourse
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null);

  const categories = ['All', 'Software Development', 'Data & AI', 'Design', 'Marketing', 'Cyber Security'];

  const filteredCourses = courses.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.trainerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Courses & Syllabus <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border">{courses.length} Active</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Academic programs, curriculum syllabi, duration, tuition pricing, and faculty assignments.
          </p>
        </div>
        <button
          onClick={onOpenNewCourse}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by title, code, trainer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap text-xs transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-sm">No Courses Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {courses.length === 0
              ? 'No courses have been added yet. Click "+ Add Course" to configure your academic programs.'
              : 'No courses match your selected search or category filter.'}
          </p>
          {courses.length === 0 && (
            <button
              onClick={onOpenNewCourse}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add First Course
            </button>
          )}
        </div>
      ) : (
        /* Courses Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const isExpanded = expandedCourseId === course.id;
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Header: Category and Right Side in Top (Code + Eye Icon) */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {course.category}
                    </span>

                    {/* Right side in top: Course Code + Eye Icon */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {course.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCourseForDetails(course)}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors shadow-2xs"
                        title="View Full Course Details & Syllabus"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {course.name}
                    </h3>
                    <p className="text-[11px] text-indigo-600 mt-1 flex items-center gap-1 font-semibold">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Trainer: {course.trainerName || 'Unassigned'}</span>
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
                      <p className="font-bold text-slate-900 mt-0.5">{course.durationWeeks} Weeks</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</span>
                      <p className="font-bold text-indigo-700 mt-0.5">{course.activeStudents || 0}</p>
                    </div>
                  </div>

                  {/* Inline Expanded Syllabus (optional) */}
                  {isExpanded && course.modules && course.modules.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs animate-in fade-in duration-150">
                      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Curriculum Syllabus</span>
                      </h4>
                      {course.modules.map((mod, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-600 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{mod}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Fee & Action Buttons */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tuition Fee</span>
                      <p className="font-black text-slate-900 text-base font-mono">
                        ₹{Number(course.fee).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditCourse(course)}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                        title="Edit Course"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg shadow-2xs transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200"
                        title={isExpanded ? 'Collapse' : 'Expand Quick Syllabus'}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Full Details View Modal (Triggered by Eye Icon) */}
      {selectedCourseForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base leading-tight">
                      {selectedCourseForDetails.name}
                    </h3>
                    <span className="text-[11px] font-mono font-bold bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded border border-indigo-700">
                      {selectedCourseForDetails.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedCourseForDetails.category} • Complete Academic Program Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourseForDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tuition Fee</span>
                  </div>
                  <p className="text-base font-black text-slate-900 font-mono mt-1">
                    ₹{Number(selectedCourseForDetails.fee).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Duration</span>
                  </div>
                  <p className="text-base font-bold text-slate-900 mt-1">
                    {selectedCourseForDetails.durationWeeks} Weeks
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Students</span>
                  </div>
                  <p className="text-base font-bold text-indigo-700 mt-1">
                    {selectedCourseForDetails.activeStudents || 0} Enrolled
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Trainer</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1 truncate" title={selectedCourseForDetails.trainerName}>
                    {selectedCourseForDetails.trainerName || 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Description if available */}
              {selectedCourseForDetails.description && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Course Overview
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedCourseForDetails.description}
                  </p>
                </div>
              )}

              {/* Full Curriculum Syllabus Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Curriculum Syllabus Outline</span>
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    {selectedCourseForDetails.modules?.length || 0} Modules
                  </span>
                </div>

                {selectedCourseForDetails.modules && selectedCourseForDetails.modules.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCourseForDetails.modules.map((mod, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-800 leading-snug">
                            {mod}
                          </p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 italic">
                    No curriculum modules listed for this program yet.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  const toEdit = selectedCourseForDetails;
                  setSelectedCourseForDetails(null);
                  if (onEditCourse) onEditCourse(toEdit);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-indigo-600" />
                <span>Edit Course</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCourseForDetails(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

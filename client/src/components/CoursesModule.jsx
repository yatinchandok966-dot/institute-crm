// CourseModule.jsx

import React, { useState } from 'react';
import { Plus, Search, CheckCircle2, ChevronDown, ChevronUp, Edit, Trash2, User } from 'lucide-react';

export default function CoursesModule({ courses, onOpenNewCourse, onEditCourse, onDeleteCourse }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const categories = ['All', 'Software Development', 'Data & AI', 'Design', 'Marketing', 'Cyber Security'];

  const filteredCourses = courses.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Courses & Syllabus <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border">{courses.length} Active</span>
          </h1>
        </div>
        <button onClick={onOpenNewCourse} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border rounded-lg" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => {
          const isExpanded = expandedCourseId === course.id;
          return (
            <div key={course.id} className="bg-white rounded-xl border shadow-xs flex flex-col justify-between overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100">{course.category}</span>
                  <span className="text-xs font-mono font-bold text-slate-500">{course.code}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{course.name}</h3>
                  <p className="text-[11px] text-indigo-600 mt-1 flex items-center gap-1 font-semibold">
                    <User className="w-3 h-3" /> Trainer: {course.trainerName || 'Unassigned'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border text-xs">
                  <div><span className="text-[10px] text-slate-400">Duration</span><p className="font-bold">{course.durationWeeks} Weeks</p></div>
                  <div><span className="text-[10px] text-slate-400">Students</span><p className="font-bold text-indigo-700">{course.activeStudents}</p></div>
                </div>

                {isExpanded && course.modules && (
                  <div className="pt-2 border-t space-y-1.5 text-xs">
                    <h4 className="font-bold text-slate-800 text-[11px] uppercase">Syllabus</h4>
                    {course.modules.map((mod, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-600 text-[11px]"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />{mod}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t flex items-center justify-between">
                  <div><span className="text-[10px] text-slate-400 uppercase">Fee</span><p className="font-black text-slate-900 text-base">₹{Number(course.fee).toLocaleString()}</p></div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => onEditCourse(course)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => onDeleteCourse(course.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={() => setExpandedCourseId(isExpanded ? null : course.id)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-semibold text-xs rounded transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
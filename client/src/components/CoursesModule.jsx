import React, { useState } from 'react';
import { BookOpen, Plus, Clock, Users, Search, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function CoursesModule({ courses, onOpenNewCourse }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const categories = ['All', 'Software Development', 'Data & AI', 'Design', 'Marketing', 'Cyber Security'];

  const filteredCourses = courses.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id) => {
    setExpandedCourseId(prev => (prev === id ? null : id));
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Courses & Syllabus
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {courses.length} Active Courses
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Program catalog with tuition fee structures, duration, and curriculum outlines.
          </p>
        </div>

        <button
          onClick={onOpenNewCourse}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by title or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => {
          const isExpanded = expandedCourseId === course.id;
          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Category & Code */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {course.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {course.code}
                  </span>
                </div>

                {/* Title & Desc */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Duration</span>
                    <p className="font-bold text-slate-800 mt-0.5">{course.durationWeeks} Weeks</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Enrolled Students</span>
                    <p className="font-bold text-indigo-700 mt-0.5">{course.activeStudents}</p>
                  </div>
                </div>

                {/* Syllabus Modules Accordion */}
                {isExpanded && course.modules && (
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Curriculum Syllabus Outline
                    </h4>
                    <div className="space-y-1.5">
                      {course.modules.map((mod, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-600 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{mod}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Standard Fee</span>
                    <p className="font-black text-slate-900 text-base">
                      ₹{Number(course.fee).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleExpand(course.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Syllabus' : 'View Syllabus'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

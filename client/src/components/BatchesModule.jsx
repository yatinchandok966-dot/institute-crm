import React, { useState } from 'react';
import { CalendarDays, Plus, Clock, Search, MapPin } from 'lucide-react';

export default function BatchesModule({ batches, courses, onOpenNewBatch }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBatches = batches.filter(b => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Batches & Cohort Schedules
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {batches.length} Active Batches
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor seat filling rates, instructor allocations, lecture timings, and classroom schedules.
          </p>
        </div>

        <button
          onClick={onOpenNewBatch}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Batch</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batches by cohort name, instructor, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5">
          {['All', 'Upcoming', 'Ongoing'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map(batch => {
          const fillPercentage = Math.round((batch.enrolled / batch.capacity) * 100);
          const seatsLeft = batch.capacity - batch.enrolled;

          return (
            <div
              key={batch.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Status & Mode */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {batch.mode}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {batch.status}
                  </span>
                </div>

                {/* Batch Name & Course */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {batch.name}
                  </h3>
                  <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                    {batch.course}
                  </p>
                </div>

                {/* Instructor */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">Lead Instructor</span>
                  <p className="font-bold text-slate-800 mt-0.5">{batch.instructor}</p>
                </div>

                {/* Timing */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{batch.timing}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>Start Date: <strong className="text-slate-800">{batch.startDate}</strong></span>
                  </div>
                </div>
              </div>

              {/* Seat Capacity Progress */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Seat Capacity:</span>
                  <span className="text-slate-900">
                    {batch.enrolled} / {batch.capacity} ({fillPercentage}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${fillPercentage >= 90 ? 'bg-amber-600' : 'bg-indigo-600'}`}
                    style={{ width: `${Math.min(100, fillPercentage)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>{seatsLeft > 0 ? `${seatsLeft} seats remaining` : 'Batch Full'}</span>
                  <span className="font-medium text-indigo-700">{batch.room}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

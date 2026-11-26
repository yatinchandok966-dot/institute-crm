import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  BookOpen,
  CalendarDays,
  User,
  Check
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '09:00 AM - 11:30 AM',
  '10:00 AM - 12:30 PM',
  '11:30 AM - 02:00 PM',
  '02:00 PM - 04:30 PM',
  '04:30 PM - 07:00 PM',
  '06:00 PM - 08:30 PM',
  '07:00 PM - 09:30 PM',
  '10:00 AM - 01:00 PM (Weekend)',
  '02:00 PM - 05:00 PM (Weekend)'
];

export default function TrainerScheduleModal({
  isOpen,
  onClose,
  trainer,
  courses = [],
  batches = [],
  onUpdateTrainerSchedule
}) {
  const [scheduleSlots, setScheduleSlots] = useState(() => trainer?.schedule || []);
  const [selectedDay, setSelectedDay] = useState('All');

  // Update slots when trainer changes
  React.useEffect(() => {
    if (trainer) {
      setScheduleSlots(trainer.schedule || []);
    }
  }, [trainer]);

  if (!isOpen || !trainer) return null;

  const handleAddSlot = () => {
    const newSlot = {
      id: Date.now(),
      day: selectedDay !== 'All' ? selectedDay : 'Monday',
      time: '09:00 AM - 11:30 AM',
      batch: '',
      course: '',
      room: '',
      mode: 'Classroom'
    };
    const updated = [...scheduleSlots, newSlot];
    setScheduleSlots(updated);
    if (onUpdateTrainerSchedule) {
      onUpdateTrainerSchedule(trainer.id, updated);
    }
  };

  const handleUpdateSlot = (slotId, field, value) => {
    const updated = scheduleSlots.map(s => s.id === slotId ? { ...s, [field]: value } : s);
    setScheduleSlots(updated);
    if (onUpdateTrainerSchedule) {
      onUpdateTrainerSchedule(trainer.id, updated);
    }
  };

  const handleRemoveSlot = (slotId) => {
    const updated = scheduleSlots.filter(s => s.id !== slotId);
    setScheduleSlots(updated);
    if (onUpdateTrainerSchedule) {
      onUpdateTrainerSchedule(trainer.id, updated);
    }
  };

  const filteredSlots = selectedDay === 'All'
    ? scheduleSlots
    : scheduleSlots.filter(s => s.day === selectedDay);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-2xs">
              {(trainer.name || 'T').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{trainer.name}&rsquo;s Class Schedule</h3>
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {trainer.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-500">{trainer.role} • {trainer.experience || 'Faculty'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day Tabs */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => setSelectedDay('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              selectedDay === 'All'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Days ({scheduleSlots.length})
          </button>
          {DAYS_OF_WEEK.map(day => {
            const count = scheduleSlots.filter(s => s.day === day).length;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{day.slice(0, 3)}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Schedule List */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700">
              {selectedDay === 'All' ? 'All Assigned Class Sessions' : `${selectedDay} Classes`}
            </span>
            <button
              type="button"
              onClick={handleAddSlot}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors border border-indigo-200 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class Session</span>
            </button>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600 text-xs">No class sessions scheduled for this day</p>
              <p className="text-[11px] text-slate-400">Click &ldquo;Add Class Session&rdquo; above to assign a timetable slot.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                >
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Day</label>
                    <select
                      value={slot.day}
                      onChange={(e) => handleUpdateSlot(slot.id, 'day', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Time Slot</label>
                    <select
                      value={slot.time || '09:00 AM - 11:30 AM'}
                      onChange={(e) => handleUpdateSlot(slot.id, 'time', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Batch / Course</label>
                    <input
                      type="text"
                      value={slot.batch || ''}
                      onChange={(e) => handleUpdateSlot(slot.id, 'batch', e.target.value)}
                      placeholder="Batch / Course"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Room / Lab</label>
                    <input
                      type="text"
                      value={slot.room || ''}
                      onChange={(e) => handleUpdateSlot(slot.id, 'room', e.target.value)}
                      placeholder="Room / Lab"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Total active timetable commitments: <strong className="text-slate-800">{scheduleSlots.length} sessions/week</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}

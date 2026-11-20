import React, { useState } from 'react';
import { ClipboardCheck, Calendar, Users, CheckCircle2, Save } from 'lucide-react';

export default function AttendanceModule({ batches, students }) {
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || 1);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const initial = {};
    students.forEach(s => {
      initial[s.id] = 'P'; // Present by default
    });
    return initial;
  });
  const [savedMessage, setSavedMessage] = useState(null);

  const selectedBatch = batches.find(b => b.id === Number(selectedBatchId)) || batches[0];

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleToggle = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = () => {
    setSavedMessage(`Attendance register recorded for ${selectedBatch?.name} on ${attendanceDate}.`);
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const total = students.length;
  const presentCount = Object.values(attendanceRecords).filter(v => v === 'P').length;
  const absentCount = Object.values(attendanceRecords).filter(v => v === 'A').length;
  const lateCount = Object.values(attendanceRecords).filter(v => v === 'L').length;
  const presentRate = Math.round((presentCount / (total || 1)) * 100);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Attendance Register
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {presentRate}% Present Today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record daily batch session attendance for enrolled students.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Register</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Select Batch:
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.instructor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Session Date:
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Quick Actions:</span>
          <button
            onClick={() => handleMarkAll('P')}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold transition-colors border border-emerald-200"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('A')}
            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 font-semibold transition-colors border border-rose-200"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Enrolled Student Roster ({students.length})
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-emerald-700 font-bold">Present: {presentCount}</span>
            <span className="text-rose-700 font-bold">Absent: {absentCount}</span>
            <span className="text-amber-700 font-bold">Late: {lateCount}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Roll ID</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Historical Attendance</th>
                <th className="px-4 py-3 text-right">Today's Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {students.map((student) => {
                const currentStatus = attendanceRecords[student.id] || 'P';
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{student.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800">
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg gap-1">
                        <button
                          onClick={() => handleToggle(student.id, 'P')}
                          className={`px-3 py-1 rounded font-bold text-xs transition-colors ${
                            currentStatus === 'P'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleToggle(student.id, 'A')}
                          className={`px-3 py-1 rounded font-bold text-xs transition-colors ${
                            currentStatus === 'A'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleToggle(student.id, 'L')}
                          className={`px-3 py-1 rounded font-bold text-xs transition-colors ${
                            currentStatus === 'L'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

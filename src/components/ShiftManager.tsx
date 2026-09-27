import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Users, 
  ShieldCheck, 
  Briefcase, 
  Edit3,
  Calendar,
  Check
} from 'lucide-react';
import { Shift, Employee } from '../types/attendance';
import { AttendanceStorage } from '../services/storage';

interface ShiftManagerProps {
  shifts: Shift[];
  employees: Employee[];
  onShiftsUpdated: () => void;
}

export const ShiftManager: React.FC<ShiftManagerProps> = ({
  shifts,
  employees,
  onShiftsUpdated
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [gracePeriod, setGracePeriod] = useState(15);
  const [breakMins, setBreakMins] = useState(60);

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const newShift: Shift = {
      id: `shift_${Date.now()}`,
      name,
      code: code.toUpperCase(),
      startTime,
      endTime,
      gracePeriodMinutes: Number(gracePeriod),
      halfDayMinutes: 240,
      fullDayMinutes: 480,
      breakDurationMinutes: Number(breakMins),
      workDays: [1, 2, 3, 4, 5],
      color: '#0F172A'
    };

    const currentShifts = AttendanceStorage.getShifts();
    AttendanceStorage.saveShifts([...currentShifts, newShift]);
    onShiftsUpdated();
    setIsModalOpen(false);
    setName('');
    setCode('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Shifts & Workforce Roster
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Organizational Schedule Policies</span>
            <span aria-hidden="true">·</span>
            <span>{shifts.length} active shift configurations</span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Shift</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shifts.map((shift) => {
          const assignedEmps = employees.filter(e => e.shiftId === shift.id);

          return (
            <div key={shift.id} className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                    {shift.code}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 mt-1.5">{shift.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                    {shift.startTime} – {shift.endTime}
                  </span>
                  <span className="block text-[11px] text-neutral-500">Scheduled Hours</span>
                </div>
              </div>

              {/* Details table */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-50 rounded-lg text-xs">
                <div>
                  <span className="text-neutral-500 block">Grace Window</span>
                  <span className="font-semibold text-neutral-900 font-mono tabular-nums">{shift.gracePeriodMinutes} mins</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Paid Break</span>
                  <span className="font-semibold text-neutral-900 font-mono tabular-nums">{shift.breakDurationMinutes} mins</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Work Days</span>
                  <span className="font-semibold text-neutral-900">Mon – Fri</span>
                </div>
              </div>

              {/* Assigned Staff Preview */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-neutral-600 mb-2">
                  <span>Assigned Staff ({assignedEmps.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {assignedEmps.map(emp => (
                    <div 
                      key={emp.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-md text-xs font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                      <span>{emp.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Create Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-base font-semibold text-neutral-900">Create New Shift</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Shift Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. European Overlap Shift"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Shift Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. EU-01"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Grace Period (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Break Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    required
                    value={breakMins}
                    onChange={(e) => setBreakMins(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

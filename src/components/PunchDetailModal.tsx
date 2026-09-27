import React from 'react';
import { X, Clock, MapPin, SlidersHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';
import { Employee, AttendanceRecord, Shift } from '../types/attendance';

interface PunchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  employee: Employee;
  shifts: Shift[];
  onOpenRegularize: (empId: string, date: string) => void;
}

export const PunchDetailModal: React.FC<PunchDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  employee,
  shifts,
  onOpenRegularize
}) => {
  if (!isOpen) return null;

  const shift = shifts.find(s => s.id === employee.shiftId) || shifts[0];
  const workH = record ? Math.floor(record.totalWorkMinutes / 60) : 0;
  const workM = record ? record.totalWorkMinutes % 60 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Attendance Event Timeline
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {record ? record.date : 'Selected Date'} · Verification Audit
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee & Record Summary */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-200 text-neutral-800 font-semibold flex items-center justify-center text-xs">
                {employee.avatarInitials}
              </div>
              <div>
                <div className="font-semibold text-neutral-900">{employee.name}</div>
                <div className="text-neutral-500">{employee.employeeCode} · {employee.department}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono font-semibold text-neutral-900 tabular-nums">
                {workH}h {workM}m
              </div>
              <div className="text-neutral-500 capitalize">{record?.status || 'No entry'}</div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Chronological Punch Events
            </h4>

            {!record || record.punches.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-400">
                No punch events recorded for this date.
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 pl-6">
                {record.punches.map((p, idx) => (
                  <div key={p.id || idx} className="relative group">
                    <span className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-neutral-900 ring-4 ring-white" />
                    
                    <div className="p-3 rounded-lg border border-neutral-200 bg-white shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900 text-xs capitalize">
                          {p.type.replace('_', ' ')}
                        </span>
                        <span className="font-mono tabular-nums text-xs font-semibold text-neutral-800">
                          {p.timeString}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
                        <span className="capitalize">{p.method.replace('_', ' ')}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[200px]">{p.location}</span>
                      </div>

                      {p.photoUrl && (
                        <div className="mt-2">
                          <img
                            src={p.photoUrl}
                            alt="Punch selfie"
                            className="w-16 h-16 rounded object-cover border border-neutral-200"
                          />
                        </div>
                      )}

                      {p.notes && (
                        <div className="mt-1 text-[11px] text-neutral-600 italic">
                          &quot;{p.notes}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 text-xs">
            <button
              onClick={() => {
                onClose();
                if (record) {
                  onOpenRegularize(employee.id, record.date);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Regularize / Correct</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium shadow-xs"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

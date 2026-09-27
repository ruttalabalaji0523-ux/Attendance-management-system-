import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Coffee, 
  LogIn, 
  LogOut, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Employee, AttendanceRecord, Shift, PunchType } from '../types/attendance';
import { AttendanceStorage } from '../services/storage';

interface PunchClockProps {
  isOpen: boolean;
  onClose: () => void;
  activeEmployee: Employee;
  employees: Employee[];
  shifts: Shift[];
  todayRecord?: AttendanceRecord;
  onPunchSuccess: () => void;
  onSelectEmployee: (empId: string) => void;
}

export const PunchClock: React.FC<PunchClockProps> = ({
  isOpen,
  onClose,
  activeEmployee,
  employees,
  shifts,
  todayRecord,
  onPunchSuccess,
  onSelectEmployee
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('San Francisco HQ - Main Office (Geo-verified)');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Web camera setup
  useEffect(() => {
    if (cameraActive && isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access unavailable or declined:', err);
          setCameraActive(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraActive, isOpen]);

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 320;
    canvas.height = videoRef.current.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedPhoto(dataUrl);
      setCameraActive(false);
    }
  };

  if (!isOpen) return null;

  const empShift = shifts.find(s => s.id === activeEmployee.shiftId) || shifts[0];
  const lastPunch = todayRecord?.punches[todayRecord.punches.length - 1];
  const isClockedIn = lastPunch && (lastPunch.type === 'in' || lastPunch.type === 'break_end');
  const isOnBreak = lastPunch && lastPunch.type === 'break_start';
  const hasClockedOut = lastPunch && lastPunch.type === 'out';

  const handlePunchAction = (type: PunchType) => {
    setIsProcessing(true);
    setFeedback(null);

    try {
      const res = AttendanceStorage.punch(
        activeEmployee.id,
        type,
        'web',
        locationName,
        capturedPhoto || undefined,
        notes || undefined
      );

      setFeedback({ type: 'success', message: res.message });
      setNotes('');
      setCapturedPhoto(null);
      onPunchSuccess();

      setTimeout(() => {
        setIsProcessing(false);
      }, 800);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record punch' });
      setIsProcessing(false);
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Attendance Punch Terminal</h2>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
              <span>{activeEmployee.employeeCode}</span>
              <span aria-hidden="true">·</span>
              <span>{empShift.name} ({empShift.startTime} – {empShift.endTime})</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Quick Switch (Convenience in preview/testing) */}
          <div className="flex items-center justify-between text-xs bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-medium">
                {activeEmployee.avatarInitials}
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{activeEmployee.name}</p>
                <p className="text-neutral-500">{activeEmployee.role} · {activeEmployee.department}</p>
              </div>
            </div>
            <select
              value={activeEmployee.id}
              onChange={(e) => onSelectEmployee(e.target.value)}
              className="text-xs bg-white border border-neutral-300 rounded px-2 py-1 text-neutral-700 focus:outline-neutral-900"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeCode})</option>
              ))}
            </select>
          </div>

          {/* Clock Display */}
          <div className="text-center py-4 bg-neutral-900 text-white rounded-xl shadow-inner relative overflow-hidden">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
              {formattedDate}
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-emerald-400 tabular-nums">
              {formattedTime}
            </div>

            {/* Current State today */}
            <div className="mt-3 flex items-center justify-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className={`w-2 h-2 rounded-full ${
                  isOnBreak ? 'bg-amber-400' : isClockedIn ? 'bg-emerald-400' : 'bg-neutral-500'
                }`} />
                {isOnBreak 
                  ? 'Currently On Break' 
                  : isClockedIn 
                  ? `Clocked In (${todayRecord?.firstIn || '--'})` 
                  : hasClockedOut 
                  ? `Shift Completed (${todayRecord?.lastOut || '--'})` 
                  : 'Not Clocked In Today'}
              </span>
              {todayRecord && todayRecord.totalWorkMinutes > 0 && (
                <>
                  <span className="text-neutral-600">|</span>
                  <span className="font-mono text-neutral-300 tabular-nums">
                    Logged: {Math.floor(todayRecord.totalWorkMinutes / 60)}h {todayRecord.totalWorkMinutes % 60}m
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Location & Verification */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span className="truncate max-w-[280px]">{locationName}</span>
              </div>
              <button 
                onClick={() => setLocationName(loc => loc.includes('San Francisco') ? 'Remote Workstation (Verified IP)' : 'San Francisco HQ - Main Office (Geo-verified)')}
                className="text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
              >
                Change Loc
              </button>
            </div>

            {/* Camera / Photo verification */}
            {cameraActive ? (
              <div className="relative rounded-lg overflow-hidden border border-neutral-300 bg-black aspect-video flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="absolute bottom-3 bg-white text-neutral-900 px-3 py-1.5 rounded-lg text-xs font-semibold shadow hover:bg-neutral-100 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Capture Photo
                </button>
              </div>
            ) : capturedPhoto ? (
              <div className="relative rounded-lg overflow-hidden border border-neutral-300 aspect-video flex items-center justify-center bg-neutral-100">
                <img src={capturedPhoto} alt="Selfie capture" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCapturedPhoto(null)}
                  className="absolute top-2 right-2 bg-neutral-900/80 text-white p-1 rounded hover:bg-neutral-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-neutral-50/70 text-xs">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Camera className="w-4 h-4 text-neutral-500" />
                  <span>Photo / Selfie verification optional</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCameraActive(true)}
                  className="text-neutral-900 font-medium hover:underline text-xs"
                >
                  Enable Camera
                </button>
              </div>
            )}

            {/* Optional note */}
            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add optional note or client tag (e.g. WFH Morning)"
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Feedback Notice */}
          {feedback && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {!isClockedIn && !isOnBreak ? (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handlePunchAction('in')}
                className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-xs active:scale-[0.99] disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>Clock In Now</span>
              </button>
            ) : isOnBreak ? (
              <>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePunchAction('break_end')}
                  className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors shadow-xs active:scale-[0.99] disabled:opacity-50"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Resume Shift (End Break)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePunchAction('break_start')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded-lg font-medium text-xs transition-colors active:scale-[0.99] disabled:opacity-50"
                >
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span>Start Break</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePunchAction('out')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium text-xs transition-colors shadow-xs active:scale-[0.99] disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Clock Out</span>
                </button>
              </>
            )}
          </div>

          {/* Today's Punch Timeline in modal */}
          {todayRecord && todayRecord.punches.length > 0 && (
            <div className="border-t border-neutral-100 pt-3">
              <p className="text-xs font-medium text-neutral-700 mb-2">Today&apos;s Punch History</p>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {todayRecord.punches.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-neutral-50 text-neutral-600">
                    <span className="font-medium text-neutral-800 capitalize">
                      {p.type.replace('_', ' ')}
                    </span>
                    <span className="font-mono tabular-nums text-neutral-500">
                      {p.timeString}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

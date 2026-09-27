import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Fingerprint, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Employee, Shift } from '../types/attendance';
import { AttendanceStorage } from '../services/storage';

interface KioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  shifts: Shift[];
  onPunchSuccess: () => void;
}

export const KioskModal: React.FC<KioskModalProps> = ({
  isOpen,
  onClose,
  employees,
  shifts,
  onPunchSuccess
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [punchMode, setPunchMode] = useState<'in' | 'out' | 'break_start' | 'break_end'>('in');
  const [recentPunches, setRecentPunches] = useState<Array<{ name: string; time: string; type: string }>>([
    { name: 'Sarah Chen', time: '09:42 AM', type: 'Clock In' },
    { name: 'David O\'Connor', time: '07:22 AM', type: 'Clock In' },
    { name: 'Marcus Vance', time: '09:55 AM', type: 'Clock In' }
  ]);
  const [alert, setAlert] = useState<{ message: string; success: boolean } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const handleQuickKioskPunch = (emp: Employee) => {
    try {
      const res = AttendanceStorage.punch(
        emp.id,
        punchMode,
        'qr_kiosk',
        'Kiosk Tablet Terminal - Reception A'
      );

      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setRecentPunches(prev => [
        { name: emp.name, time: timeStr, type: punchMode === 'in' ? 'Clock In' : punchMode === 'out' ? 'Clock Out' : 'Break' },
        ...prev.slice(0, 4)
      ]);

      setAlert({ message: `${emp.name} marked ${punchMode.replace('_', ' ').toUpperCase()} successfully!`, success: true });
      onPunchSuccess();
      setTimeout(() => setAlert(null), 3000);
    } catch (e: any) {
      setAlert({ message: e.message || 'Error recording kiosk punch', success: false });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
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
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col justify-between overflow-y-auto">
      {/* Top Kiosk Bar */}
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono font-bold text-white text-base">
            CH
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Chronos Kiosk Terminal</h1>
            <p className="text-xs text-neutral-400">Reception Terminal A · Building 4, Floor 1</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>Exit Kiosk</span>
          </button>
        </div>
      </div>

      {/* Main Kiosk Content */}
      <div className="max-w-5xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        
        {/* Left Side: Clock & Mode Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
            <div className="text-neutral-400 text-xs font-mono tracking-wider uppercase mb-2">
              {formattedDate}
            </div>
            <div className="text-5xl font-mono font-bold tracking-tight text-white tabular-nums my-2">
              {formattedTime}
            </div>
            <div className="text-xs text-emerald-400 flex items-center justify-center gap-1.5 mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Biometric & Badge Sensor Active</span>
            </div>
          </div>

          {/* Punch Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Select Action
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPunchMode('in')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold transition-all border ${
                  punchMode === 'in' 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                Clock In
              </button>
              <button
                onClick={() => setPunchMode('out')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold transition-all border ${
                  punchMode === 'out' 
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                Clock Out
              </button>
              <button
                onClick={() => setPunchMode('break_start')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold transition-all border ${
                  punchMode === 'break_start' 
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                Start Break
              </button>
              <button
                onClick={() => setPunchMode('break_end')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold transition-all border ${
                  punchMode === 'break_end' 
                    ? 'bg-sky-600 border-sky-500 text-white shadow-lg' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                End Break
              </button>
            </div>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200 ${
              alert.success ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200' : 'bg-rose-950/80 border-rose-700 text-rose-200'
            }`}>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{alert.message}</span>
            </div>
          )}

          {/* Recent Kiosk Punches */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Recent Terminal Punches
            </h4>
            <div className="space-y-2">
              {recentPunches.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-neutral-800/50 last:border-0">
                  <span className="text-neutral-200 font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 font-mono tabular-nums">{item.time}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-emerald-400 text-[11px]">{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Employee Tap Grid or Scanner */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Tap Your Name to Punch</h3>
              <p className="text-xs text-neutral-400">Or scan your physical RFID / QR badge</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono">{employees.length} Staff Enrolled</span>
            </div>
          </div>

          {/* Quick Roster Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => handleQuickKioskPunch(emp)}
                className="flex flex-col items-start p-3 rounded-xl bg-neutral-800/70 border border-neutral-700/60 hover:bg-neutral-800 hover:border-neutral-500 transition-all text-left group"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center group-hover:bg-neutral-600 transition-colors">
                    {emp.avatarInitials}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {emp.employeeCode}
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate w-full">
                  {emp.name}
                </span>
                <span className="text-[11px] text-neutral-400 truncate w-full mt-0.5">
                  {emp.department}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-neutral-400" />
              <span>Biometric Sensor Ready</span>
            </span>
            <span className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-neutral-400" />
              <span>Badge Scanner Port 8080</span>
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Kiosk Status */}
      <div className="p-4 border-t border-neutral-800 text-center text-xs text-neutral-500">
        <span>Chronos Terminal OS · Enterprise Workforce Management System · Encrypted Local Ledger</span>
      </div>
    </div>
  );
};

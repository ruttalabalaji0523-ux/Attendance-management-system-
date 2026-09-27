import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Employee, AttendanceRecord, Shift } from '../types/attendance';
import { AttendanceStorage } from '../services/storage';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  records: AttendanceRecord[];
  shifts: Shift[];
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  employees,
  records,
  shifts
}) => {
  const [period, setPeriod] = useState<'month' | 'two_weeks'>('month');

  if (!isOpen) return null;

  // Aggregate stats
  const payrollRows = employees.map(emp => {
    const empRecords = records.filter(r => r.employeeId === emp.id && r.status !== 'weekend');
    const presentCount = empRecords.filter(r => r.status === 'present').length;
    const lateCount = empRecords.filter(r => r.status === 'late').length;
    const halfCount = empRecords.filter(r => r.status === 'half_day').length;
    const absentCount = empRecords.filter(r => r.status === 'absent').length;
    const leaveCount = empRecords.filter(r => r.status === 'on_leave').length;

    const totalWorkMins = empRecords.reduce((acc, curr) => acc + curr.totalWorkMinutes, 0);
    const totalOTMins = empRecords.reduce((acc, curr) => acc + curr.overtimeMinutes, 0);

    const totalDays = empRecords.length || 1;
    const effectivePresent = presentCount + lateCount + (halfCount * 0.5);
    const rate = ((effectivePresent / totalDays) * 100).toFixed(1);

    return {
      emp,
      totalDays,
      presentCount,
      lateCount,
      halfCount,
      absentCount,
      leaveCount,
      totalHours: (totalWorkMins / 60).toFixed(1),
      otHours: (totalOTMins / 60).toFixed(1),
      rate
    };
  });

  const grandTotalHours = payrollRows.reduce((acc, curr) => acc + Number(curr.totalHours), 0).toFixed(1);
  const grandTotalOT = payrollRows.reduce((acc, curr) => acc + Number(curr.otHours), 0).toFixed(1);

  const handleDownloadCSV = () => {
    AttendanceStorage.exportPayrollTimesheetCSV(
      employees,
      records,
      'September_2026'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Workforce Timesheet & Payroll Ledger Report
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              September 2026 Audit Period · Standard Hours & Overtime Accounting
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-neutral-600 hover:text-neutral-950 rounded hover:bg-neutral-100 transition-colors"
              title="Print Summary"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-neutral-50 border-b border-neutral-200 shrink-0">
          <div className="p-3 bg-white rounded-lg border border-neutral-200">
            <span className="text-[11px] font-medium text-neutral-500 block">Total Worked Hours</span>
            <span className="text-xl font-bold font-mono text-neutral-900 tabular-nums">{grandTotalHours} hrs</span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-neutral-200">
            <span className="text-[11px] font-medium text-neutral-500 block">Total Overtime Accrued</span>
            <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">+{grandTotalOT} hrs</span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-neutral-200">
            <span className="text-[11px] font-medium text-neutral-500 block">Workforce Count</span>
            <span className="text-xl font-bold font-mono text-neutral-900 tabular-nums">{employees.length} personnel</span>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="overflow-y-auto p-6 flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Staff Code</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-2 text-center">Present</th>
                <th className="py-2.5 px-2 text-center">Late</th>
                <th className="py-2.5 px-2 text-center">Absent</th>
                <th className="py-2.5 px-2 text-center">Leaves</th>
                <th className="py-2.5 px-3 text-right">Work Hours</th>
                <th className="py-2.5 px-3 text-right">Overtime</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {payrollRows.map(row => (
                <tr key={row.emp.id} className="hover:bg-neutral-50/60">
                  <td className="py-2.5 px-3 font-mono text-neutral-500">{row.emp.employeeCode}</td>
                  <td className="py-2.5 px-3 font-semibold text-neutral-900">{row.emp.name}</td>
                  <td className="py-2.5 px-3 text-neutral-600">{row.emp.department}</td>
                  <td className="py-2.5 px-2 text-center font-mono tabular-nums text-neutral-800">{row.presentCount}</td>
                  <td className="py-2.5 px-2 text-center font-mono tabular-nums text-amber-700">{row.lateCount}</td>
                  <td className="py-2.5 px-2 text-center font-mono tabular-nums text-rose-700">{row.absentCount}</td>
                  <td className="py-2.5 px-2 text-center font-mono tabular-nums text-sky-700">{row.leaveCount}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">{row.totalHours}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-emerald-700">+{row.otHours}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">{row.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

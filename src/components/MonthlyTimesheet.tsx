import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Search, 
  Filter, 
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { Employee, AttendanceRecord, Shift } from '../types/attendance';
import { AttendanceStorage } from '../services/storage';

interface MonthlyTimesheetProps {
  employees: Employee[];
  records: AttendanceRecord[];
  shifts: Shift[];
  onCellClick: (record: AttendanceRecord | null, employee: Employee, dateStr: string) => void;
  onOpenReports: () => void;
}

export const MonthlyTimesheet: React.FC<MonthlyTimesheetProps> = ({
  employees,
  records,
  shifts,
  onCellClick,
  onOpenReports
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 is September (0-indexed)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Month label
  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Export CSV
  const handleExportCSV = () => {
    AttendanceStorage.exportPayrollTimesheetCSV(
      employees,
      records,
      monthName
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Monthly Attendance Timesheet Matrix
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Workforce Ledger Matrix</span>
            <span aria-hidden="true">·</span>
            <span>{monthName}</span>
            <span aria-hidden="true">·</span>
            <span>{daysInMonth} calendar days</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-neutral-300 rounded-lg p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-neutral-600 hover:text-neutral-950 rounded hover:bg-neutral-100 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-neutral-800 px-3 py-1 font-mono">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-neutral-600 hover:text-neutral-950 rounded hover:bg-neutral-100 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-900 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-neutral-600" />
            <span>Export Payroll CSV</span>
          </button>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
        
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 font-medium">
          <span className="text-neutral-400">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold text-[10px]">P</span>
            <span>Present</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-amber-100 text-amber-800 font-bold text-[10px]">L</span>
            <span>Late</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-purple-100 text-purple-800 font-bold text-[10px]">H</span>
            <span>Half-Day</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-rose-100 text-rose-800 font-bold text-[10px]">A</span>
            <span>Absent</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-sky-100 text-sky-800 font-bold text-[10px]">LV</span>
            <span>Leave</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-neutral-100 text-neutral-400 font-medium text-[10px]">·</span>
            <span>Weekend</span>
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-neutral-900 bg-neutral-50/50"
            />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-700 focus:outline-neutral-900"
          >
            <option value="All">All Depts</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Operations">Operations</option>
            <option value="Human Resources">HR</option>
            <option value="Design">Design</option>
            <option value="Sales & Marketing">Sales</option>
          </select>
        </div>
      </div>

      {/* Full Monthly Matrix Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 sticky left-0 bg-neutral-50 z-10 w-48 shadow-xs">
                  Employee
                </th>
                {dayNumbers.map(d => {
                  const date = new Date(selectedYear, selectedMonth, d);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th 
                      key={d} 
                      className={`py-2 px-1 text-center font-mono tabular-nums text-[11px] min-w-[28px] ${
                        isWeekend ? 'bg-neutral-100/70 text-neutral-400' : 'text-neutral-700'
                      }`}
                    >
                      <div>{d}</div>
                      <div className="text-[9px] font-normal uppercase text-neutral-400">
                        {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </div>
                    </th>
                  );
                })}
                <th className="py-3 px-3 text-right sticky right-0 bg-neutral-50 z-10 shadow-xs">
                  Summary Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredEmployees.map(emp => {
                // Compute employee monthly stats
                let presentCount = 0;
                let lateCount = 0;
                let halfCount = 0;
                let absentCount = 0;
                let leaveCount = 0;
                let totalWorkMins = 0;
                let totalOvertimeMins = 0;
                let workingDaysCount = 0;

                const dayCells = dayNumbers.map(d => {
                  const dateStr = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                  const record = records.find(r => r.employeeId === emp.id && r.date === dateStr);
                  const date = new Date(selectedYear, selectedMonth, d);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  if (!isWeekend) {
                    workingDaysCount++;
                    if (record) {
                      totalWorkMins += record.totalWorkMinutes;
                      totalOvertimeMins += record.overtimeMinutes;
                      if (record.status === 'present') presentCount++;
                      else if (record.status === 'late') lateCount++;
                      else if (record.status === 'half_day') halfCount++;
                      else if (record.status === 'on_leave') leaveCount++;
                      else if (record.status === 'absent') absentCount++;
                    }
                  }

                  let cellContent = '·';
                  let cellClass = 'text-neutral-300';
                  let statusTitle = 'No record';

                  if (isWeekend) {
                    cellContent = '·';
                    cellClass = 'text-neutral-300 bg-neutral-50/50';
                    statusTitle = 'Weekend';
                  } else if (record) {
                    if (record.status === 'present') {
                      cellContent = 'P';
                      cellClass = 'bg-emerald-100 text-emerald-800 font-bold';
                      statusTitle = `Present (${record.firstIn} - ${record.lastOut || 'active'})`;
                    } else if (record.status === 'late') {
                      cellContent = 'L';
                      cellClass = 'bg-amber-100 text-amber-800 font-bold';
                      statusTitle = `Late Arrival (${record.firstIn})`;
                    } else if (record.status === 'half_day') {
                      cellContent = 'H';
                      cellClass = 'bg-purple-100 text-purple-800 font-bold';
                      statusTitle = 'Half-day worked';
                    } else if (record.status === 'on_leave') {
                      cellContent = 'LV';
                      cellClass = 'bg-sky-100 text-sky-800 font-bold text-[9px]';
                      statusTitle = 'Approved Leave';
                    } else if (record.status === 'absent') {
                      cellContent = 'A';
                      cellClass = 'bg-rose-100 text-rose-800 font-bold';
                      statusTitle = 'Unexcused Absence';
                    }
                  }

                  return (
                    <td 
                      key={d} 
                      onClick={() => onCellClick(record || null, emp, dateStr)}
                      title={`${emp.name} - ${dateStr}: ${statusTitle}`}
                      className="py-1 px-0.5 text-center cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-mono text-[10px] ${cellClass}`}>
                        {cellContent}
                      </div>
                    </td>
                  );
                });

                const effectivePresent = presentCount + lateCount + (halfCount * 0.5);
                const attRate = workingDaysCount > 0 ? ((effectivePresent / workingDaysCount) * 100).toFixed(0) : '0';
                const totalHours = (totalWorkMins / 60).toFixed(1);

                return (
                  <tr key={emp.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Employee sticky cell */}
                    <td className="py-2.5 px-4 sticky left-0 bg-white z-10 shadow-xs border-r border-neutral-150">
                      <div className="font-semibold text-neutral-900 truncate max-w-[160px]">
                        {emp.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {emp.employeeCode} · {emp.department}
                      </div>
                    </td>

                    {/* Matrix Day Cells */}
                    {dayCells}

                    {/* Summary Total sticky cell */}
                    <td className="py-2.5 px-3 text-right sticky right-0 bg-white z-10 shadow-xs border-l border-neutral-150">
                      <div className="font-mono tabular-nums font-semibold text-neutral-900 text-xs">
                        {totalHours}h <span className="text-neutral-400 font-normal">({attRate}%)</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {presentCount + lateCount}P · {absentCount}A · {leaveCount}L
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
};

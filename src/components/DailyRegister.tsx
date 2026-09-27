import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { Employee, AttendanceRecord, Shift, Department, AttendanceStatus } from '../types/attendance';
import { AttendanceStorage } from '../services/storage';

interface DailyRegisterProps {
  employees: Employee[];
  records: AttendanceRecord[];
  shifts: Shift[];
  currentDate: string;
  onDateChange: (newDate: string) => void;
  onViewPunches: (record: AttendanceRecord, employee: Employee) => void;
  onOpenRegularize: (empId: string, date: string) => void;
  onOpenAddEmployee: () => void;
  onRecordUpdated: () => void;
}

export const DailyRegister: React.FC<DailyRegisterProps> = ({
  employees,
  records,
  shifts,
  currentDate,
  onDateChange,
  onViewPunches,
  onOpenRegularize,
  onOpenAddEmployee,
  onRecordUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Navigate date
  const changeDateBy = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const jumpToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  // Get records for current date
  const dateRecords = records.filter(r => r.date === currentDate);

  // Build combined rows for all active employees
  const tableData = employees.map(emp => {
    const record = dateRecords.find(r => r.employeeId === emp.id);
    const shift = shifts.find(s => s.id === emp.shiftId) || shifts[0];

    if (record) {
      return {
        employee: emp,
        shift,
        record,
        status: record.status,
        firstIn: record.firstIn || '--:--',
        lastOut: record.lastOut || '--:--',
        workMinutes: record.totalWorkMinutes,
        breakMinutes: record.breakMinutes,
        overtimeMinutes: record.overtimeMinutes,
        method: record.punches[0]?.method || 'web',
        punchCount: record.punches.length
      };
    } else {
      // Employee has no record for this date yet
      return {
        employee: emp,
        shift,
        record: null,
        status: 'absent' as AttendanceStatus,
        firstIn: '--:--',
        lastOut: '--:--',
        workMinutes: 0,
        breakMinutes: 0,
        overtimeMinutes: 0,
        method: 'web' as const,
        punchCount: 0
      };
    }
  });

  // Filter rows
  const filteredData = tableData.filter(row => {
    const matchesSearch = 
      row.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.employee.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.employee.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || row.employee.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || row.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Summary counts
  const countPresent = tableData.filter(r => r.status === 'present').length;
  const countLate = tableData.filter(r => r.status === 'late').length;
  const countHalf = tableData.filter(r => r.status === 'half_day').length;
  const countAbsent = tableData.filter(r => r.status === 'absent').length;
  const countLeave = tableData.filter(r => r.status === 'on_leave').length;
  const totalWorkedMinutes = tableData.reduce((acc, curr) => acc + curr.workMinutes, 0);

  const handleExportCSV = () => {
    AttendanceStorage.exportAttendanceRegisterCSV(
      dateRecords,
      employees,
      shifts,
      currentDate
    );
  };

  const handleQuickMarkPresent = (empId: string) => {
    AttendanceStorage.punch(empId, 'in', 'web', 'Manual Admin Check-in');
    onRecordUpdated();
  };

  const dateObj = new Date(currentDate);
  const formattedHeaderDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Daily Attendance Register
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Operational Log</span>
            <span aria-hidden="true">·</span>
            <span>{filteredData.length} records listed</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{Math.floor(totalWorkedMinutes / 60)}h {totalWorkedMinutes % 60}m recorded work</span>
          </div>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-neutral-300 rounded-lg p-1 shadow-2xs">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 text-neutral-600 hover:text-neutral-950 rounded hover:bg-neutral-100 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="text-xs font-mono font-medium text-neutral-800 px-2 py-1 bg-transparent focus:outline-hidden"
            />
            <button
              onClick={() => changeDateBy(1)}
              className="p-1.5 text-neutral-600 hover:text-neutral-950 rounded hover:bg-neutral-100 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={jumpToToday}
            className="px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            Today
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-900 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-neutral-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddEmployee}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Date banner & Summary Metrics */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4 text-neutral-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">{formattedHeaderDate}</div>
            <div className="text-xs text-neutral-500">Official Daily Timesheet Records</div>
          </div>
        </div>

        {/* Quick status tabs/counts */}
        <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Present: <b className="font-mono text-neutral-900 tabular-nums">{countPresent}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Late: <b className="font-mono text-neutral-900 tabular-nums">{countLate}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Half-Day: <b className="font-mono text-neutral-900 tabular-nums">{countHalf}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Absent: <b className="font-mono text-neutral-900 tabular-nums">{countAbsent}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Leave: <b className="font-mono text-neutral-900 tabular-nums">{countLeave}</b></span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee name or code..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-neutral-900 bg-neutral-50/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-700 focus:outline-neutral-900"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Operations">Operations</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Design">Design</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-700 focus:outline-neutral-900"
          >
            <option value="All">All Statuses</option>
            <option value="present">Present (On Time)</option>
            <option value="late">Late Arrival</option>
            <option value="half_day">Half-Day</option>
            <option value="absent">Absent</option>
            <option value="on_leave">On Leave</option>
            <option value="weekend">Weekend</option>
          </select>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Shift Schedule</th>
                <th className="py-3 px-3">First In</th>
                <th className="py-3 px-3">Last Out</th>
                <th className="py-3 px-3 text-right">Work Hours</th>
                <th className="py-3 px-3 text-right">Break</th>
                <th className="py-3 px-3 text-right">Overtime</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400">
                    No matching attendance records found for this date.
                  </td>
                </tr>
              ) : (
                filteredData.map(({ employee, shift, record, status, firstIn, lastOut, workMinutes, breakMinutes, overtimeMinutes, method, punchCount }) => {
                  const workH = Math.floor(workMinutes / 60);
                  const workM = workMinutes % 60;
                  const otH = Math.floor(overtimeMinutes / 60);
                  const otM = overtimeMinutes % 60;

                  return (
                    <tr key={employee.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Employee */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-800 font-semibold flex items-center justify-center text-xs shrink-0">
                            {employee.avatarInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 leading-tight">
                              {employee.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono">{employee.employeeCode}</span>
                              <span aria-hidden="true">·</span>
                              <span>{employee.department}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Shift */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-neutral-800">{shift.name}</div>
                        <div className="font-mono tabular-nums text-[11px] text-neutral-500">
                          {shift.startTime} – {shift.endTime}
                        </div>
                      </td>

                      {/* First In */}
                      <td className="py-3 px-3">
                        <span className={`font-mono tabular-nums font-medium ${
                          status === 'late' ? 'text-amber-700' : 'text-neutral-800'
                        }`}>
                          {firstIn}
                        </span>
                        {status === 'late' && (
                          <span className="block text-[10px] text-amber-600 font-medium">Late Arrival</span>
                        )}
                      </td>

                      {/* Last Out */}
                      <td className="py-3 px-3">
                        <span className="font-mono tabular-nums text-neutral-800 font-medium">
                          {lastOut}
                        </span>
                      </td>

                      {/* Work Hours */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono tabular-nums font-semibold text-neutral-900">
                          {workMinutes > 0 ? `${workH.toString().padStart(2, '0')}:${workM.toString().padStart(2, '0')}` : '--:--'}
                        </span>
                      </td>

                      {/* Break */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono tabular-nums text-neutral-600">
                          {breakMinutes > 0 ? `${breakMinutes}m` : '0m'}
                        </span>
                      </td>

                      {/* Overtime */}
                      <td className="py-3 px-3 text-right">
                        <span className={`font-mono tabular-nums font-medium ${
                          overtimeMinutes > 0 ? 'text-emerald-700 font-semibold' : 'text-neutral-400'
                        }`}>
                          {overtimeMinutes > 0 ? `+${otH}h ${otM}m` : '0m'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className="text-xs font-medium capitalize">
                          {status === 'present' && (
                            <span className="text-emerald-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Present
                            </span>
                          )}
                          {status === 'late' && (
                            <span className="text-amber-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Late
                            </span>
                          )}
                          {status === 'half_day' && (
                            <span className="text-purple-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              Half-Day
                            </span>
                          )}
                          {status === 'absent' && (
                            <span className="text-rose-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Absent
                            </span>
                          )}
                          {status === 'on_leave' && (
                            <span className="text-sky-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              On Leave
                            </span>
                          )}
                          {status === 'weekend' && (
                            <span className="text-neutral-500 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                              Weekend
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="py-3 px-3 text-neutral-500 capitalize text-[11px]">
                        {record ? method.replace('_', ' ') : '--'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {record ? (
                            <button
                              onClick={() => onViewPunches(record, employee)}
                              title="Inspect Detailed Punch Timeline"
                              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickMarkPresent(employee.id)}
                              title="Mark Present Now"
                              className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                            >
                              Mark In
                            </button>
                          )}

                          <button
                            onClick={() => onOpenRegularize(employee.id, currentDate)}
                            title="Adjust / Regularize Punch"
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary bar */}
        <div className="p-4 bg-neutral-50/75 border-t border-neutral-200 flex flex-wrap items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span>Showing {filteredData.length} of {employees.length} workforce entries</span>
          </div>
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span>Cumulative Day Work: <b>{(totalWorkedMinutes / 60).toFixed(1)} hrs</b></span>
          </div>
        </div>
      </div>

    </div>
  );
};

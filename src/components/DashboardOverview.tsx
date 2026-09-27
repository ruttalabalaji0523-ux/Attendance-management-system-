import React from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  FileSpreadsheet, 
  ArrowUpRight,
  MapPin,
  Calendar,
  Laptop
} from 'lucide-react';
import { Employee, AttendanceRecord, Shift, UserRole } from '../types/attendance';

interface DashboardOverviewProps {
  employees: Employee[];
  records: AttendanceRecord[];
  shifts: Shift[];
  activeEmployee: Employee;
  userRole: UserRole;
  todayDate: string;
  onOpenPunchModal: () => void;
  onOpenLeaveModal: () => void;
  onOpenReports: () => void;
  onSelectTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  employees,
  records,
  shifts,
  activeEmployee,
  userRole,
  todayDate,
  onOpenPunchModal,
  onOpenLeaveModal,
  onOpenReports,
  onSelectTab
}) => {
  // Filter today's records
  const todayRecords = records.filter(r => r.date === todayDate);

  // Compute metrics
  const totalEmployees = employees.length;
  const presentRecords = todayRecords.filter(r => r.status === 'present');
  const lateRecords = todayRecords.filter(r => r.status === 'late');
  const halfDayRecords = todayRecords.filter(r => r.status === 'half_day');
  const onLeaveRecords = todayRecords.filter(r => r.status === 'on_leave');
  
  const totalPresentToday = presentRecords.length + lateRecords.length + halfDayRecords.length;
  const attendanceRate = totalEmployees > 0 ? ((totalPresentToday / totalEmployees) * 100).toFixed(0) : '0';
  const onTimeCount = presentRecords.length;
  const lateCount = lateRecords.length;
  const onLeaveCount = onLeaveRecords.length;
  const remoteCount = employees.filter(e => e.status === 'remote').length;

  // Active employee's record today
  const activeEmpRecord = todayRecords.find(r => r.employeeId === activeEmployee.id);
  const activeEmpLastPunch = activeEmpRecord?.punches[activeEmpRecord.punches.length - 1];
  const isClockedIn = activeEmpLastPunch && (activeEmpLastPunch.type === 'in' || activeEmpLastPunch.type === 'break_end');
  const isOnBreak = activeEmpLastPunch && activeEmpLastPunch.type === 'break_start';

  // Recent punch events
  const allTodayPunches = todayRecords.flatMap(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    return r.punches.map(p => ({
      ...p,
      employeeName: emp?.name || 'Unknown',
      department: emp?.department || '',
      avatarInitials: emp?.avatarInitials || 'CH'
    }));
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 7);

  // Currently in office staff
  const currentlyWorking = todayRecords.filter(r => {
    const lastP = r.punches[r.punches.length - 1];
    return lastP && (lastP.type === 'in' || lastP.type === 'break_start' || lastP.type === 'break_end');
  }).map(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    const lastP = r.punches[r.punches.length - 1];
    const isBreak = lastP?.type === 'break_start';
    return {
      record: r,
      employee: emp,
      isBreak,
      firstIn: r.firstIn,
      workMins: r.totalWorkMinutes
    };
  });

  // Department distribution
  const departments = ['Engineering', 'Product', 'Operations', 'Human Resources', 'Design', 'Sales & Marketing'] as const;
  const departmentStats = departments.map(dept => {
    const deptEmps = employees.filter(e => e.department === dept);
    const deptPresent = todayRecords.filter(r => {
      const emp = deptEmps.find(e => e.id === r.employeeId);
      return emp && (r.status === 'present' || r.status === 'late' || r.status === 'half_day');
    }).length;
    const rate = deptEmps.length > 0 ? Math.round((deptPresent / deptEmps.length) * 100) : 0;
    return { name: dept, total: deptEmps.length, present: deptPresent, rate };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Editorial Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Workforce Presence & Operations
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Live Workspace Roster</span>
            <span aria-hidden="true">·</span>
            <span>Today, {new Date(todayDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span aria-hidden="true">·</span>
            <span>{totalEmployees} Registered Workforce</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReports}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-neutral-500" />
            <span>Payroll & Reports</span>
          </button>
          <button
            onClick={() => onSelectTab('register')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <span>View Full Register</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Present Today */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Present Today</span>
            <span className="font-mono tabular-nums text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
              {attendanceRate}%
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 font-mono tabular-nums">
              {totalPresentToday}
            </span>
            <span className="text-xs text-neutral-500">/ {totalEmployees} on duty</span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{onTimeCount} on-time arrivals</span>
          </div>
        </div>

        {/* Late Arrivals */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Late Arrivals</span>
            <span className="font-mono tabular-nums text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
              Grace 15m
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 font-mono tabular-nums">
              {lateCount}
            </span>
            <span className="text-xs text-neutral-500">flagged tardy</span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Exceeded shift grace window</span>
          </div>
        </div>

        {/* On Leave / PTO */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>On Approved Leave</span>
            <span className="text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
              PTO
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 font-mono tabular-nums">
              {onLeaveCount}
            </span>
            <span className="text-xs text-neutral-500">absent with leave</span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Planned leave balance applied</span>
          </div>
        </div>

        {/* Remote Workers */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Remote / WFH</span>
            <span className="text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
              Off-site
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 font-mono tabular-nums">
              {remoteCount}
            </span>
            <span className="text-xs text-neutral-500">distributed team</span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>Web terminal geo-tagged</span>
          </div>
        </div>
      </div>

      {/* Interactive Self-Service Banner for current user */}
      <div className="bg-neutral-900 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 text-white flex items-center justify-center font-bold text-sm border border-neutral-700">
            {activeEmployee.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{activeEmployee.name}</span>
              <span className="text-xs text-neutral-400 font-mono">({activeEmployee.employeeCode})</span>
              <span className="text-xs text-neutral-400">· {activeEmployee.role}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-300 mt-1">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  isOnBreak ? 'bg-amber-400' : isClockedIn ? 'bg-emerald-400' : 'bg-neutral-500'
                }`} />
                {isOnBreak 
                  ? 'Currently taking break' 
                  : isClockedIn 
                  ? `Clocked in at ${activeEmpRecord?.firstIn}` 
                  : 'Not clocked in yet today'}
              </span>
              {activeEmpRecord && activeEmpRecord.totalWorkMinutes > 0 && (
                <>
                  <span className="text-neutral-600">|</span>
                  <span className="font-mono text-neutral-300 tabular-nums">
                    Logged today: {Math.floor(activeEmpRecord.totalWorkMinutes / 60)}h {activeEmpRecord.totalWorkMinutes % 60}m
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenLeaveModal}
            className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
          >
            Request Leave
          </button>
          <button
            onClick={onOpenPunchModal}
            className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{isClockedIn ? 'Manage Punch' : 'Clock In Now'}</span>
          </button>
        </div>
      </div>

      {/* Main Content 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Columns: Currently Working Staff & Department Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Workforce Roster */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Active On-Duty Personnel ({currentlyWorking.length})
                </h2>
                <p className="text-xs text-neutral-500">Currently clocked in and on premise or remote</p>
              </div>
              <button
                onClick={() => onSelectTab('register')}
                className="text-xs text-neutral-600 hover:text-neutral-950 font-medium"
              >
                All records &rarr;
              </button>
            </div>

            {currentlyWorking.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                No active staff clocked in at this moment.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {currentlyWorking.map(({ record, employee, isBreak, firstIn, workMins }) => (
                  <div key={record.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 font-medium flex items-center justify-center text-xs">
                        {employee?.avatarInitials || 'EM'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-900">{employee?.name}</span>
                          <span className="text-neutral-400 font-mono text-[11px]">{employee?.employeeCode}</span>
                        </div>
                        <div className="text-neutral-500 text-[11px]">
                          {employee?.role} · {employee?.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="font-mono text-neutral-900 font-medium tabular-nums">
                          {Math.floor(workMins / 60)}h {workMins % 60}m
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          In: {firstIn || '--'}
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        {isBreak ? (
                          <span className="text-amber-700 text-[11px] font-medium flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Break
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-[11px] font-medium flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Working
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <h2 className="text-sm font-semibold text-neutral-900 mb-1">
              Department Presence Rates
            </h2>
            <p className="text-xs text-neutral-500 mb-4">Daily percentage of department headcount accounted for</p>

            <div className="space-y-3.5">
              {departmentStats.map((dept) => (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800">{dept.name}</span>
                    <span className="font-mono tabular-nums text-neutral-600">
                      {dept.present} / {dept.total} ({dept.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        dept.rate >= 90 
                          ? 'bg-emerald-600' 
                          : dept.rate >= 60 
                          ? 'bg-neutral-800' 
                          : 'bg-amber-600'
                      }`}
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Live Activity Feed & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Punch Activity Feed */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Real-Time Punch Stream
                </h2>
                <p className="text-xs text-neutral-500">Live feed from kiosks, web terminals & turnstiles</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {allTodayPunches.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-xs">
                  No punches recorded today yet.
                </div>
              ) : (
                allTodayPunches.map((punch) => (
                  <div key={punch.id} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-150 flex items-start justify-between text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-neutral-200 text-neutral-800 font-semibold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                        {punch.avatarInitials}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 leading-tight">
                          {punch.employeeName}
                        </div>
                        <div className="text-neutral-500 text-[11px] mt-0.5 flex items-center gap-1.5">
                          <span className="capitalize font-medium text-neutral-700">
                            {punch.type.replace('_', ' ')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[140px]">{punch.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-neutral-800 font-medium tabular-nums text-xs">
                        {punch.timeString}
                      </div>
                      <div className="text-[10px] text-neutral-400 capitalize">
                        {punch.method.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-600 space-y-2">
            <h3 className="font-semibold text-neutral-900">Attendance Policies</h3>
            <p>
              Standard shifts begin at 09:00 with a 15-minute grace period. Check-ins after 09:15 are automatically tagged as Late. 
              Any missed punches can be regularized within 5 working days via the Regularizations queue.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onSelectTab('regularization')}
                className="text-neutral-900 font-medium hover:underline"
              >
                Go to Regularizations &rarr;
              </button>
              <button
                onClick={() => onSelectTab('shifts')}
                className="text-neutral-900 font-medium hover:underline"
              >
                View Shift Policies &rarr;
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

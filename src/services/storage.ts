import { 
  Employee, 
  Shift, 
  AttendanceRecord, 
  LeaveRequest, 
  RegularizationRequest, 
  PunchLog,
  PunchType, 
  PunchMethod 
} from '../types/attendance';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_SHIFTS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_REGULARIZATIONS,
  generateInitialAttendanceRecords 
} from '../data/initialData';

const STORAGE_KEYS = {
  EMPLOYEES: 'chronos_employees_v1',
  SHIFTS: 'chronos_shifts_v1',
  ATTENDANCE: 'chronos_attendance_v1',
  LEAVE_REQUESTS: 'chronos_leaves_v1',
  REGULARIZATIONS: 'chronos_regularizations_v1',
  CURRENT_USER_ID: 'chronos_active_emp_id_v1',
  USER_ROLE: 'chronos_user_role_v1',
};

export class AttendanceStorage {
  static getEmployees(): Employee[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  }

  static saveEmployees(employees: Employee[]): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }

  static getShifts(): Shift[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      return data ? JSON.parse(data) : INITIAL_SHIFTS;
    } catch {
      return INITIAL_SHIFTS;
    }
  }

  static saveShifts(shifts: Shift[]): void {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  }

  static getAttendanceRecords(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (data) {
        return JSON.parse(data);
      }
      const initial = generateInitialAttendanceRecords();
      this.saveAttendanceRecords(initial);
      return initial;
    } catch {
      const initial = generateInitialAttendanceRecords();
      return initial;
    }
  }

  static saveAttendanceRecords(records: AttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  }

  static getLeaveRequests(): LeaveRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
      return data ? JSON.parse(data) : INITIAL_LEAVE_REQUESTS;
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  }

  static saveLeaveRequests(leaves: LeaveRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaves));
  }

  static getRegularizations(): RegularizationRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGULARIZATIONS);
      return data ? JSON.parse(data) : INITIAL_REGULARIZATIONS;
    } catch {
      return INITIAL_REGULARIZATIONS;
    }
  }

  static saveRegularizations(requests: RegularizationRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.REGULARIZATIONS, JSON.stringify(requests));
  }

  static getActiveEmployeeId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'emp_02'; // Default Marcus Vance
  }

  static setActiveEmployeeId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  static getUserRole(): 'admin' | 'employee' {
    return (localStorage.getItem(STORAGE_KEYS.USER_ROLE) as 'admin' | 'employee') || 'admin';
  }

  static setUserRole(role: 'admin' | 'employee'): void {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  }

  static resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.LEAVE_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.REGULARIZATIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  }

  // Punch actions
  static punch(
    employeeId: string, 
    type: PunchType, 
    method: PunchMethod = 'web', 
    location: string = 'Web Terminal',
    photoUrl?: string,
    notes?: string
  ): { success: boolean; message: string; record: AttendanceRecord } {
    const records = this.getAttendanceRecords();
    const employees = this.getEmployees();
    const shifts = this.getShifts();

    const emp = employees.find(e => e.id === employeeId);
    if (!emp) {
      throw new Error('Employee not found');
    }

    const shift = shifts.find(s => s.id === emp.shiftId) || shifts[0];
    const now = new Date();
    // Default simulated date is today
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

    const newPunch: PunchLog = {
      id: `p_${Date.now()}`,
      timestamp: now.toISOString(),
      timeString: timeStr,
      type,
      method,
      location,
      photoUrl,
      notes
    };

    let recordIndex = records.findIndex(r => r.employeeId === employeeId && r.date === dateStr);
    let record: AttendanceRecord;

    if (recordIndex >= 0) {
      record = { ...records[recordIndex] };
      record.punches = [...record.punches, newPunch];
    } else {
      record = {
        id: `rec_${employeeId}_${dateStr}`,
        employeeId,
        date: dateStr,
        shiftId: shift.id,
        totalWorkMinutes: 0,
        breakMinutes: 0,
        overtimeMinutes: 0,
        status: 'present',
        punches: [newPunch]
      };
    }

    // Recalculate firstIn, lastOut, total minutes and status
    if (type === 'in' && !record.firstIn) {
      record.firstIn = timeStr;
      
      // Determine late or on-time
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [curH, curM] = timeStr.split(':').map(Number);
      const shiftStartInMins = startH * 60 + startM;
      const curInMins = curH * 60 + curM;

      if (curInMins > shiftStartInMins + shift.gracePeriodMinutes) {
        record.status = 'late';
      } else {
        record.status = 'present';
      }
    }

    if (type === 'out') {
      record.lastOut = timeStr;
    }

    // Calculate total worked time
    if (record.firstIn) {
      const [inH, inM, inS] = record.firstIn.split(':').map(Number);
      const inSeconds = inH * 3600 + inM * 60 + (inS || 0);

      const endTime = record.lastOut || timeStr;
      const [outH, outM, outS] = endTime.split(':').map(Number);
      const outSeconds = outH * 3600 + outM * 60 + (outS || 0);

      let diffSeconds = Math.max(0, outSeconds - inSeconds);
      
      // Calculate breaks
      let breakSeconds = 0;
      let breakStart: number | null = null;

      for (const p of record.punches) {
        const [pH, pM, pS] = p.timeString.split(':').map(Number);
        const pSec = pH * 3600 + pM * 60 + (pS || 0);

        if (p.type === 'break_start') {
          breakStart = pSec;
        } else if (p.type === 'break_end' && breakStart !== null) {
          breakSeconds += Math.max(0, pSec - breakStart);
          breakStart = null;
        }
      }

      const workedSeconds = Math.max(0, diffSeconds - breakSeconds);
      record.totalWorkMinutes = Math.floor(workedSeconds / 60);
      record.breakMinutes = Math.floor(breakSeconds / 60);

      if (record.totalWorkMinutes > shift.fullDayMinutes) {
        record.overtimeMinutes = record.totalWorkMinutes - shift.fullDayMinutes;
      } else {
        record.overtimeMinutes = 0;
      }

      if (record.totalWorkMinutes < shift.halfDayMinutes && record.lastOut) {
        record.status = 'half_day';
      }
    }

    if (recordIndex >= 0) {
      records[recordIndex] = record;
    } else {
      records.push(record);
    }

    this.saveAttendanceRecords(records);
    return {
      success: true,
      message: `Successfully clocked ${type.replace('_', ' ').toUpperCase()} at ${timeStr}`,
      record
    };
  }

  // Export to CSV
  static exportAttendanceRegisterCSV(records: AttendanceRecord[], employees: Employee[], shifts: Shift[], dateLabel: string): void {
    const headers = [
      'Date',
      'Employee Code',
      'Employee Name',
      'Department',
      'Shift',
      'First In',
      'Last Out',
      'Work Duration (HH:MM)',
      'Break (Mins)',
      'Overtime (Mins)',
      'Status'
    ];

    const rows = records.map(r => {
      const emp = employees.find(e => e.id === r.employeeId);
      const shift = shifts.find(s => s.id === r.shiftId);
      const workHours = Math.floor(r.totalWorkMinutes / 60);
      const workMins = r.totalWorkMinutes % 60;
      const formattedDuration = `${workHours.toString().padStart(2, '0')}:${workMins.toString().padStart(2, '0')}`;

      return [
        r.date,
        emp?.employeeCode || '',
        `"${emp?.name || 'Unknown'}"`,
        `"${emp?.department || ''}"`,
        `"${shift?.name || ''}"`,
        r.firstIn || '--:--',
        r.lastOut || '--:--',
        formattedDuration,
        r.breakMinutes,
        r.overtimeMinutes,
        r.status.toUpperCase()
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Chronos_Attendance_Register_${dateLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export Payroll Timesheet CSV
  static exportPayrollTimesheetCSV(employees: Employee[], records: AttendanceRecord[], monthLabel: string): void {
    const headers = [
      'Employee Code',
      'Name',
      'Department',
      'Total Days In Period',
      'Days Present',
      'Days Late',
      'Half Days',
      'Absences',
      'Leaves Taken',
      'Total Work Hours',
      'Overtime Hours',
      'Attendance Rate (%)'
    ];

    const rows = employees.map(emp => {
      const empRecords = records.filter(r => r.employeeId === emp.id && r.status !== 'weekend');
      const presentCount = empRecords.filter(r => r.status === 'present').length;
      const lateCount = empRecords.filter(r => r.status === 'late').length;
      const halfCount = empRecords.filter(r => r.status === 'half_day').length;
      const absentCount = empRecords.filter(r => r.status === 'absent').length;
      const leaveCount = empRecords.filter(r => r.status === 'on_leave').length;

      const totalWorkMins = empRecords.reduce((acc, curr) => acc + curr.totalWorkMinutes, 0);
      const totalOTMins = empRecords.reduce((acc, curr) => acc + curr.overtimeMinutes, 0);

      const totalWorkingDays = empRecords.length || 1;
      const effectivePresent = presentCount + lateCount + (halfCount * 0.5);
      const attendanceRate = ((effectivePresent / totalWorkingDays) * 100).toFixed(1);

      return [
        emp.employeeCode,
        `"${emp.name}"`,
        `"${emp.department}"`,
        totalWorkingDays,
        presentCount,
        lateCount,
        halfCount,
        absentCount,
        leaveCount,
        (totalWorkMins / 60).toFixed(1),
        (totalOTMins / 60).toFixed(1),
        `${attendanceRate}%`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Chronos_Payroll_Timesheet_${monthLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

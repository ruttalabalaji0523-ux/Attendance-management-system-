export type Department = 
  | 'Engineering' 
  | 'Product' 
  | 'Operations' 
  | 'Human Resources' 
  | 'Design' 
  | 'Sales & Marketing';

export type AttendanceStatus = 
  | 'present' 
  | 'late' 
  | 'half_day' 
  | 'absent' 
  | 'on_leave' 
  | 'holiday' 
  | 'weekend';

export type PunchType = 'in' | 'out' | 'break_start' | 'break_end';

export type PunchMethod = 'web' | 'qr_kiosk' | 'biometric' | 'manual_regularized';

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "18:00"
  gracePeriodMinutes: number; // e.g. 15
  halfDayMinutes: number; // e.g. 270 (4.5 hours)
  fullDayMinutes: number; // e.g. 480 (8 hours)
  breakDurationMinutes: number; // e.g. 60
  workDays: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  color: string;
}

export interface Employee {
  id: string;
  employeeCode: string; // e.g. "CHR-101"
  name: string;
  email: string;
  role: string;
  department: Department;
  shiftId: string;
  avatarColor: string;
  avatarInitials: string;
  location: string;
  phone: string;
  joinedDate: string;
  status: 'active' | 'on_leave' | 'remote';
  leaveBalance: {
    paid: number;
    sick: number;
    casual: number;
  };
}

export interface PunchLog {
  id: string;
  timestamp: string; // ISO string
  timeString: string; // "09:14:22"
  type: PunchType;
  method: PunchMethod;
  location: string;
  photoUrl?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // "YYYY-MM-DD"
  shiftId: string;
  firstIn?: string; // "09:04:12"
  lastOut?: string; // "18:02:45"
  totalWorkMinutes: number;
  breakMinutes: number;
  overtimeMinutes: number;
  status: AttendanceStatus;
  punches: PunchLog[];
  isRegularized?: boolean;
  regularizationReason?: string;
}

export type LeaveType = 'paid' | 'sick' | 'casual' | 'unpaid';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: RequestStatus;
  appliedOn: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface RegularizationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  requestedIn: string;
  requestedOut: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  reviewedBy?: string;
}

export type UserRole = 'admin' | 'employee';

import { Shift, Employee, AttendanceRecord, LeaveRequest, RegularizationRequest } from '../types/attendance';

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift_gen',
    name: 'General Corporate',
    code: 'GEN-01',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMinutes: 15,
    halfDayMinutes: 270,
    fullDayMinutes: 480,
    breakDurationMinutes: 60,
    workDays: [1, 2, 3, 4, 5],
    color: '#2563EB', // Blue
  },
  {
    id: 'shift_early',
    name: 'Morning Operations',
    code: 'OPS-01',
    startTime: '07:30',
    endTime: '16:30',
    gracePeriodMinutes: 10,
    halfDayMinutes: 270,
    fullDayMinutes: 480,
    breakDurationMinutes: 60,
    workDays: [1, 2, 3, 4, 5],
    color: '#059669', // Emerald
  },
  {
    id: 'shift_flex',
    name: 'Engineering Flexible',
    code: 'ENG-FLX',
    startTime: '10:00',
    endTime: '19:00',
    gracePeriodMinutes: 30,
    halfDayMinutes: 240,
    fullDayMinutes: 480,
    breakDurationMinutes: 60,
    workDays: [1, 2, 3, 4, 5],
    color: '#7C3AED', // Purple
  },
  {
    id: 'shift_night',
    name: 'Tech Support Night',
    code: 'SUP-NGT',
    startTime: '21:00',
    endTime: '05:00',
    gracePeriodMinutes: 15,
    halfDayMinutes: 240,
    fullDayMinutes: 480,
    breakDurationMinutes: 45,
    workDays: [1, 2, 3, 4, 5],
    color: '#EA580C', // Orange
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_01',
    employeeCode: 'CHR-1001',
    name: 'Sarah Chen',
    email: 'sarah.chen@chronos.io',
    role: 'VP of Engineering',
    department: 'Engineering',
    shiftId: 'shift_flex',
    avatarColor: 'bg-indigo-600',
    avatarInitials: 'SC',
    location: 'San Francisco HQ - Floor 5',
    phone: '+1 (415) 890-2101',
    joinedDate: '2023-03-15',
    status: 'active',
    leaveBalance: { paid: 14, sick: 7, casual: 3 }
  },
  {
    id: 'emp_02',
    employeeCode: 'CHR-1002',
    name: 'Marcus Vance',
    email: 'marcus.vance@chronos.io',
    role: 'Principal Staff Engineer',
    department: 'Engineering',
    shiftId: 'shift_flex',
    avatarColor: 'bg-emerald-600',
    avatarInitials: 'MV',
    location: 'San Francisco HQ - Floor 5',
    phone: '+1 (415) 890-2102',
    joinedDate: '2022-08-01',
    status: 'active',
    leaveBalance: { paid: 18, sick: 9, casual: 4 }
  },
  {
    id: 'emp_03',
    employeeCode: 'CHR-1003',
    name: 'Elena Rostova',
    email: 'elena.rostova@chronos.io',
    role: 'Lead UX Architect',
    department: 'Design',
    shiftId: 'shift_gen',
    avatarColor: 'bg-rose-600',
    avatarInitials: 'ER',
    location: 'San Francisco HQ - Floor 4',
    phone: '+1 (415) 890-2103',
    joinedDate: '2023-01-10',
    status: 'active',
    leaveBalance: { paid: 12, sick: 6, casual: 2 }
  },
  {
    id: 'emp_04',
    employeeCode: 'CHR-1004',
    name: 'David O\'Connor',
    email: 'david.oc@chronos.io',
    role: 'Director of Operations',
    department: 'Operations',
    shiftId: 'shift_early',
    avatarColor: 'bg-amber-600',
    avatarInitials: 'DO',
    location: 'San Francisco HQ - Floor 3',
    phone: '+1 (415) 890-2104',
    joinedDate: '2021-11-15',
    status: 'active',
    leaveBalance: { paid: 20, sick: 10, casual: 5 }
  },
  {
    id: 'emp_05',
    employeeCode: 'CHR-1005',
    name: 'Priya Sharma',
    email: 'priya.sharma@chronos.io',
    role: 'HR People & Talent Lead',
    department: 'Human Resources',
    shiftId: 'shift_gen',
    avatarColor: 'bg-sky-600',
    avatarInitials: 'PS',
    location: 'San Francisco HQ - Floor 2',
    phone: '+1 (415) 890-2105',
    joinedDate: '2022-05-20',
    status: 'active',
    leaveBalance: { paid: 15, sick: 8, casual: 4 }
  },
  {
    id: 'emp_06',
    employeeCode: 'CHR-1006',
    name: 'Kenji Takahashi',
    email: 'kenji.t@chronos.io',
    role: 'Senior Product Manager',
    department: 'Product',
    shiftId: 'shift_gen',
    avatarColor: 'bg-teal-600',
    avatarInitials: 'KT',
    location: 'Remote - Seattle, WA',
    phone: '+1 (206) 555-0198',
    joinedDate: '2023-07-12',
    status: 'remote',
    leaveBalance: { paid: 10, sick: 6, casual: 3 }
  },
  {
    id: 'emp_07',
    employeeCode: 'CHR-1007',
    name: 'Amara Diallo',
    email: 'amara.diallo@chronos.io',
    role: 'Cloud Infrastructure Lead',
    department: 'Engineering',
    shiftId: 'shift_flex',
    avatarColor: 'bg-violet-600',
    avatarInitials: 'AD',
    location: 'San Francisco HQ - Floor 5',
    phone: '+1 (415) 890-2107',
    joinedDate: '2023-09-01',
    status: 'active',
    leaveBalance: { paid: 16, sick: 5, casual: 2 }
  },
  {
    id: 'emp_08',
    employeeCode: 'CHR-1008',
    name: 'Lucas Morales',
    email: 'lucas.morales@chronos.io',
    role: 'Senior Sales Account Exec',
    department: 'Sales & Marketing',
    shiftId: 'shift_gen',
    avatarColor: 'bg-emerald-700',
    avatarInitials: 'LM',
    location: 'San Francisco HQ - Floor 3',
    phone: '+1 (415) 890-2108',
    joinedDate: '2024-02-15',
    status: 'active',
    leaveBalance: { paid: 11, sick: 8, casual: 3 }
  },
  {
    id: 'emp_09',
    employeeCode: 'CHR-1009',
    name: 'Hanna Lindqvist',
    email: 'hanna.l@chronos.io',
    role: 'Lead Data Analyst',
    department: 'Product',
    shiftId: 'shift_gen',
    avatarColor: 'bg-pink-600',
    avatarInitials: 'HL',
    location: 'Remote - Austin, TX',
    phone: '+1 (512) 555-0143',
    joinedDate: '2023-11-01',
    status: 'on_leave',
    leaveBalance: { paid: 8, sick: 4, casual: 1 }
  },
  {
    id: 'emp_10',
    employeeCode: 'CHR-1010',
    name: 'Julian Reyes',
    email: 'julian.reyes@chronos.io',
    role: 'Site Reliability Engineer',
    department: 'Engineering',
    shiftId: 'shift_night',
    avatarColor: 'bg-cyan-600',
    avatarInitials: 'JR',
    location: 'San Francisco HQ - Floor 5',
    phone: '+1 (415) 890-2110',
    joinedDate: '2024-04-10',
    status: 'active',
    leaveBalance: { paid: 14, sick: 8, casual: 4 }
  }
];

// Helper to generate past records
export function generateInitialAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const baseDate = new Date('2026-09-26T12:00:00'); // current simulated date

  // Generate 25 days backwards
  for (let offset = 25; offset >= 0; offset--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - offset);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = offset === 0;

    INITIAL_EMPLOYEES.forEach((emp, index) => {
      const shift = INITIAL_SHIFTS.find(s => s.id === emp.shiftId) || INITIAL_SHIFTS[0];

      if (isWeekend) {
        records.push({
          id: `rec_${emp.id}_${dateStr}`,
          employeeId: emp.id,
          date: dateStr,
          shiftId: shift.id,
          totalWorkMinutes: 0,
          breakMinutes: 0,
          overtimeMinutes: 0,
          status: 'weekend',
          punches: []
        });
        return;
      }

      // Check if employee is Hanna Lindqvist on leave today and yesterday
      if (emp.id === 'emp_09' && (offset === 0 || offset === 1 || offset === 2)) {
        records.push({
          id: `rec_${emp.id}_${dateStr}`,
          employeeId: emp.id,
          date: dateStr,
          shiftId: shift.id,
          totalWorkMinutes: 0,
          breakMinutes: 0,
          overtimeMinutes: 0,
          status: 'on_leave',
          punches: []
        });
        return;
      }

      if (isToday) {
        // Today's live records
        // Some employees checked in early, some on time, some late, some out for lunch, 1 absent
        if (emp.id === 'emp_01') {
          // Sarah Chen - checked in early
          records.push({
            id: `rec_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftId: shift.id,
            firstIn: '09:42:10',
            totalWorkMinutes: 380,
            breakMinutes: 45,
            overtimeMinutes: 0,
            status: 'present',
            punches: [
              {
                id: `p_${emp.id}_1`,
                timestamp: `${dateStr}T09:42:10`,
                timeString: '09:42:10',
                type: 'in',
                method: 'web',
                location: emp.location
              },
              {
                id: `p_${emp.id}_2`,
                timestamp: `${dateStr}T13:00:00`,
                timeString: '13:00:00',
                type: 'break_start',
                method: 'web',
                location: emp.location
              },
              {
                id: `p_${emp.id}_3`,
                timestamp: `${dateStr}T13:45:00`,
                timeString: '13:45:00',
                type: 'break_end',
                method: 'web',
                location: emp.location
              }
            ]
          });
        } else if (emp.id === 'emp_02') {
          // Marcus Vance - currently in office, checked in 09:55
          records.push({
            id: `rec_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftId: shift.id,
            firstIn: '09:55:18',
            totalWorkMinutes: 365,
            breakMinutes: 30,
            overtimeMinutes: 0,
            status: 'present',
            punches: [
              {
                id: `p_${emp.id}_1`,
                timestamp: `${dateStr}T09:55:18`,
                timeString: '09:55:18',
                type: 'in',
                method: 'qr_kiosk',
                location: 'Kiosk Reception Tablet A'
              }
            ]
          });
        } else if (emp.id === 'emp_03') {
          // Elena Rostova - Arrived late (09:28, grace was 09:15)
          records.push({
            id: `rec_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftId: shift.id,
            firstIn: '09:28:44',
            totalWorkMinutes: 390,
            breakMinutes: 50,
            overtimeMinutes: 0,
            status: 'late',
            punches: [
              {
                id: `p_${emp.id}_1`,
                timestamp: `${dateStr}T09:28:44`,
                timeString: '09:28:44',
                type: 'in',
                method: 'biometric',
                location: 'Main Turnstile Gate 2'
              }
            ]
          });
        } else if (emp.id === 'emp_04') {
          // David O'Connor - Early ops shift (07:30 start, checked in 07:22)
          records.push({
            id: `rec_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftId: shift.id,
            firstIn: '07:22:15',
            lastOut: '16:35:40',
            totalWorkMinutes: 495,
            breakMinutes: 60,
            overtimeMinutes: 15,
            status: 'present',
            punches: [
              {
                id: `p_${emp.id}_1`,
                timestamp: `${dateStr}T07:22:15`,
                timeString: '07:22:15',
                type: 'in',
                method: 'biometric',
                location: 'Facility Gate 1'
              },
              {
                id: `p_${emp.id}_2`,
                timestamp: `${dateStr}T16:35:40`,
                timeString: '16:35:40',
                type: 'out',
                method: 'biometric',
                location: 'Facility Gate 1'
              }
            ]
          });
        } else if (emp.id === 'emp_05') {
          // Priya Sharma - HR Lead, present on time 08:58
          records.push({
            id: `rec_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftId: shift.id,
            firstIn: '08:58:02',
            totalWorkMinutes: 420,
            breakMinutes: 45,
            overtimeMinutes: 0,
            status: 'present',
            punches: [
              {
                id: `p_${emp.id}_1`,
                timestamp: `${dateStr}T08:58:02`,
                timeString: '08:58:02',
                type: 'in',
                method: 'web',
                location: emp.location
              }
            ]
          });
        } else if (emp.id === 'emp_06') {
          // Kenji Takahashi - Remote punch in Seattle 09:05
          records.push({
            id: `rec_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftId: shift.id,
            firstIn: '09:05:12',
            totalWorkMinutes: 410,
            breakMinutes: 60,
            overtimeMinutes: 0,
            status: 'present',
            punches: [
              {
                id: `p_${emp.id}_1`,
                timestamp: `${dateStr}T09:05:12`,
                timeString: '09:05:12',
                type: 'in',
                method: 'web',
                location: 'Remote Workstation (Seattle, WA)'
              }
            ]
          });
        } else if (emp.id === 'emp_07') {
          // Amara Diallo - Present 09:50
          records.push({
            id: `rec_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftId: shift.id,
            firstIn: '09:50:00',
            totalWorkMinutes: 370,
            breakMinutes: 40,
            overtimeMinutes: 0,
            status: 'present',
            punches: [
              {
                id: `p_${emp.id}_1`,
                timestamp: `${dateStr}T09:50:00`,
                timeString: '09:50:00',
                type: 'in',
                method: 'web',
                location: emp.location
              }
            ]
          });
        } else if (emp.id === 'emp_08') {
          // Lucas Morales - Late 09:35
          records.push({
            id: `rec_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftId: shift.id,
            firstIn: '09:35:45',
            totalWorkMinutes: 380,
            breakMinutes: 45,
            overtimeMinutes: 0,
            status: 'late',
            punches: [
              {
                id: `p_${emp.id}_1`,
                timestamp: `${dateStr}T09:35:45`,
                timeString: '09:35:45',
                type: 'in',
                method: 'qr_kiosk',
                location: 'Reception Kiosk B'
              }
            ]
          });
        } else if (emp.id === 'emp_10') {
          // Julian Reyes - Night shift starting 21:00
          records.push({
            id: `rec_${emp.id}_${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
            shiftId: shift.id,
            firstIn: '20:54:10',
            totalWorkMinutes: 120,
            breakMinutes: 0,
            overtimeMinutes: 0,
            status: 'present',
            punches: [
              {
                id: `p_${emp.id}_1`,
                timestamp: `${dateStr}T20:54:10`,
                timeString: '20:54:10',
                type: 'in',
                method: 'biometric',
                location: 'NOC Data Center Entry'
              }
            ]
          });
        }
        return;
      }

      // Past weekdays (offsets 1 to 25)
      // Deterministic simulation based on index and offset
      const hash = (index * 13 + offset * 7) % 20;

      if (hash === 1) {
        // Absent
        records.push({
          id: `rec_${emp.id}_${dateStr}`,
          employeeId: emp.id,
          date: dateStr,
          shiftId: shift.id,
          totalWorkMinutes: 0,
          breakMinutes: 0,
          overtimeMinutes: 0,
          status: 'absent',
          punches: []
        });
      } else if (hash === 2 || hash === 3) {
        // Late arrival
        const lateMinutes = 18 + (hash * 5);
        const [startH, startM] = shift.startTime.split(':').map(Number);
        const inMinute = startM + lateMinutes;
        const inHour = inMinute >= 60 ? startH + 1 : startH;
        const formattedInMin = (inMinute % 60).toString().padStart(2, '0');
        const inTime = `${inHour.toString().padStart(2, '0')}:${formattedInMin}:12`;
        const outTime = `${shift.endTime}:15`;

        records.push({
          id: `rec_${emp.id}_${dateStr}`,
          employeeId: emp.id,
          date: dateStr,
          shiftId: shift.id,
          firstIn: inTime,
          lastOut: outTime,
          totalWorkMinutes: 460,
          breakMinutes: 60,
          overtimeMinutes: 0,
          status: 'late',
          punches: [
            {
              id: `p_${emp.id}_${dateStr}_1`,
              timestamp: `${dateStr}T${inTime}`,
              timeString: inTime,
              type: 'in',
              method: 'web',
              location: emp.location
            },
            {
              id: `p_${emp.id}_${dateStr}_2`,
              timestamp: `${dateStr}T${outTime}`,
              timeString: outTime,
              type: 'out',
              method: 'web',
              location: emp.location
            }
          ]
        });
      } else if (hash === 4) {
        // Half-day
        const inTime = `${shift.startTime}:05`;
        const outTime = `13:30:00`;
        records.push({
          id: `rec_${emp.id}_${dateStr}`,
          employeeId: emp.id,
          date: dateStr,
          shiftId: shift.id,
          firstIn: inTime,
          lastOut: outTime,
          totalWorkMinutes: 265,
          breakMinutes: 30,
          overtimeMinutes: 0,
          status: 'half_day',
          punches: [
            {
              id: `p_${emp.id}_${dateStr}_1`,
              timestamp: `${dateStr}T${inTime}`,
              timeString: inTime,
              type: 'in',
              method: 'qr_kiosk',
              location: 'Kiosk Reception Tablet A'
            },
            {
              id: `p_${emp.id}_${dateStr}_2`,
              timestamp: `${dateStr}T${outTime}`,
              timeString: outTime,
              type: 'out',
              method: 'qr_kiosk',
              location: 'Kiosk Reception Tablet A'
            }
          ]
        });
      } else {
        // Normal On-Time Present with standard 8 hours + occasional overtime
        const earlyDelta = (hash % 10) - 5; // -5 to +4 mins from shift start
        const [startH, startM] = shift.startTime.split(':').map(Number);
        const actualMin = Math.max(0, startM + earlyDelta);
        const inTime = `${startH.toString().padStart(2, '0')}:${actualMin.toString().padStart(2, '0')}:24`;
        
        const hasOvertime = hash >= 15;
        const otMins = hasOvertime ? 45 + (hash * 2) : 0;
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const outMin = endM + (hasOvertime ? 30 : 5);
        const outHour = outMin >= 60 ? endH + 1 : endH;
        const outTime = `${outHour.toString().padStart(2, '0')}:${(outMin % 60).toString().padStart(2, '0')}:40`;

        records.push({
          id: `rec_${emp.id}_${dateStr}`,
          employeeId: emp.id,
          date: dateStr,
          shiftId: shift.id,
          firstIn: inTime,
          lastOut: outTime,
          totalWorkMinutes: 480 + otMins,
          breakMinutes: 60,
          overtimeMinutes: otMins,
          status: 'present',
          punches: [
            {
              id: `p_${emp.id}_${dateStr}_1`,
              timestamp: `${dateStr}T${inTime}`,
              timeString: inTime,
              type: 'in',
              method: hash % 2 === 0 ? 'web' : 'biometric',
              location: emp.location
            },
            {
              id: `p_${emp.id}_${dateStr}_2`,
              timestamp: `${dateStr}T${outTime}`,
              timeString: outTime,
              type: 'out',
              method: hash % 2 === 0 ? 'web' : 'biometric',
              location: emp.location
            }
          ]
        });
      }
    });
  }

  return records;
}

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr_101',
    employeeId: 'emp_09',
    employeeName: 'Hanna Lindqvist',
    department: 'Product',
    type: 'paid',
    startDate: '2026-09-24',
    endDate: '2026-09-28',
    days: 3,
    reason: 'Family wedding attendance and annual travel',
    status: 'approved',
    appliedOn: '2026-09-18',
    reviewedBy: 'Priya Sharma',
    reviewedAt: '2026-09-19 11:20'
  },
  {
    id: 'lr_102',
    employeeId: 'emp_03',
    employeeName: 'Elena Rostova',
    department: 'Design',
    type: 'casual',
    startDate: '2026-10-02',
    endDate: '2026-10-02',
    days: 1,
    reason: 'Personal administrative appointment and vehicle inspection',
    status: 'pending',
    appliedOn: '2026-09-25'
  },
  {
    id: 'lr_103',
    employeeId: 'emp_08',
    employeeName: 'Lucas Morales',
    department: 'Sales & Marketing',
    type: 'sick',
    startDate: '2026-09-29',
    endDate: '2026-09-30',
    days: 2,
    reason: 'Scheduled dental oral surgery recovery',
    status: 'pending',
    appliedOn: '2026-09-26'
  },
  {
    id: 'lr_104',
    employeeId: 'emp_02',
    employeeName: 'Marcus Vance',
    department: 'Engineering',
    type: 'paid',
    startDate: '2026-10-15',
    endDate: '2026-10-19',
    days: 3,
    reason: 'Fall vacation getaway',
    status: 'pending',
    appliedOn: '2026-09-26'
  }
];

export const INITIAL_REGULARIZATIONS: RegularizationRequest[] = [
  {
    id: 'reg_201',
    employeeId: 'emp_07',
    employeeName: 'Amara Diallo',
    date: '2026-09-22',
    requestedIn: '09:45:00',
    requestedOut: '19:15:00',
    reason: 'Badge scanner was down during client server maintenance rollout',
    status: 'pending',
    createdAt: '2026-09-23 09:10'
  },
  {
    id: 'reg_202',
    employeeId: 'emp_08',
    employeeName: 'Lucas Morales',
    date: '2026-09-18',
    requestedIn: '09:00:00',
    requestedOut: '18:00:00',
    reason: 'Client on-site meeting in Palo Alto, forgot mobile web clock-out',
    status: 'approved',
    createdAt: '2026-09-19 08:30',
    reviewedBy: 'Priya Sharma'
  }
];

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { DailyRegister } from './components/DailyRegister';
import { MonthlyTimesheet } from './components/MonthlyTimesheet';
import { LeaveManagement } from './components/LeaveManagement';
import { RegularizationQueue } from './components/RegularizationQueue';
import { ShiftManager } from './components/ShiftManager';
import { PunchClock } from './components/PunchClock';
import { KioskModal } from './components/KioskModal';
import { ReportsModal } from './components/ReportsModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { PunchDetailModal } from './components/PunchDetailModal';

import { Employee, Shift, AttendanceRecord, LeaveRequest, RegularizationRequest, UserRole } from './types/attendance';
import { AttendanceStorage } from './services/storage';
import { CheckCircle2, RotateCcw, ShieldCheck, User } from 'lucide-react';

export default function App() {
  // Core state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [regularizations, setRegularizations] = useState<RegularizationRequest[]>([]);

  // User & view state
  const [activeEmpId, setActiveEmpId] = useState<string>('emp_02');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [currentDate, setCurrentDate] = useState<string>('2026-09-26');

  // Modals
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detail Modal
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    record: AttendanceRecord | null;
    employee: Employee | null;
  }>({
    isOpen: false,
    record: null,
    employee: null
  });

  // Regularize prefill
  const [regularizePrefill, setRegularizePrefill] = useState<{ date?: string; empId?: string }>({});

  // Initial load
  const reloadData = () => {
    const emps = AttendanceStorage.getEmployees();
    const sfts = AttendanceStorage.getShifts();
    const recs = AttendanceStorage.getAttendanceRecords();
    const lvs = AttendanceStorage.getLeaveRequests();
    const regs = AttendanceStorage.getRegularizations();
    const storedActiveEmp = AttendanceStorage.getActiveEmployeeId();
    const storedRole = AttendanceStorage.getUserRole();

    setEmployees(emps);
    setShifts(sfts);
    setRecords(recs);
    setLeaveRequests(lvs);
    setRegularizations(regs);
    setActiveEmpId(storedActiveEmp);
    setUserRole(storedRole);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectEmployee = (empId: string) => {
    setActiveEmpId(empId);
    AttendanceStorage.setActiveEmployeeId(empId);
  };

  const handleToggleRole = () => {
    const newRole: UserRole = userRole === 'admin' ? 'employee' : 'admin';
    setUserRole(newRole);
    AttendanceStorage.setUserRole(newRole);
    showToast(`Switched view to ${newRole === 'admin' ? 'Administrator' : 'Employee Self-Service'}`);
  };

  const handleResetDemo = () => {
    if (confirm('Reset all attendance data, shifts, leaves, and records to original demo state?')) {
      AttendanceStorage.resetToDemo();
      reloadData();
      showToast('All records successfully restored to demo baseline.');
    }
  };

  const activeEmployee = employees.find(e => e.id === activeEmpId) || employees[0] || {
    id: 'emp_01',
    employeeCode: 'CHR-1001',
    name: 'Sarah Chen',
    email: 'sarah.chen@chronos.io',
    role: 'VP of Engineering',
    department: 'Engineering',
    shiftId: 'shift_flex',
    avatarColor: 'bg-indigo-600',
    avatarInitials: 'SC',
    location: 'San Francisco HQ',
    phone: '',
    joinedDate: '2023-01-01',
    status: 'active',
    leaveBalance: { paid: 14, sick: 7, casual: 3 }
  };

  const todayRecord = records.find(r => r.employeeId === activeEmployee.id && r.date === currentDate);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col selection:bg-neutral-900 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        activeEmployee={activeEmployee}
        allEmployees={employees}
        onSelectEmployee={handleSelectEmployee}
        onOpenPunchModal={() => setIsPunchModalOpen(true)}
        onOpenKiosk={() => setIsKioskOpen(true)}
      />

      {/* Role Notice Banner (Subtle indicator) */}
      <div className="border-b border-neutral-200 bg-white/70 backdrop-blur-xs py-2 px-4 sm:px-6 lg:px-8 text-xs text-neutral-600 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="flex items-center gap-1.5 font-medium text-neutral-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Mode: {userRole === 'admin' ? 'Organization Admin / HR Director' : 'Employee Self-Service'}
          </span>
          <span className="text-neutral-400">·</span>
          <span>Logged in as <b>{activeEmployee.name}</b> ({activeEmployee.role})</span>
          <span className="text-neutral-400">·</span>
          <button
            onClick={handleToggleRole}
            className="text-neutral-900 underline underline-offset-2 hover:text-black font-medium ml-1"
          >
            Switch to {userRole === 'admin' ? 'Employee View' : 'Admin View'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'overview' && (
          <DashboardOverview
            employees={employees}
            records={records}
            shifts={shifts}
            activeEmployee={activeEmployee}
            userRole={userRole}
            todayDate={currentDate}
            onOpenPunchModal={() => setIsPunchModalOpen(true)}
            onOpenLeaveModal={() => setCurrentTab('leaves')}
            onOpenReports={() => setIsReportsOpen(true)}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'register' && (
          <DailyRegister
            employees={employees}
            records={records}
            shifts={shifts}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onViewPunches={(rec, emp) => {
              setDetailModal({ isOpen: true, record: rec, employee: emp });
            }}
            onOpenRegularize={(empId, dt) => {
              setRegularizePrefill({ date: dt, empId });
              setCurrentTab('regularization');
            }}
            onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
            onRecordUpdated={() => {
              reloadData();
              showToast('Attendance record updated successfully');
            }}
          />
        )}

        {currentTab === 'timesheet' && (
          <MonthlyTimesheet
            employees={employees}
            records={records}
            shifts={shifts}
            onCellClick={(rec, emp, dt) => {
              setDetailModal({ isOpen: true, record: rec, employee: emp });
            }}
            onOpenReports={() => setIsReportsOpen(true)}
          />
        )}

        {currentTab === 'leaves' && (
          <LeaveManagement
            employees={employees}
            leaveRequests={leaveRequests}
            activeEmployee={activeEmployee}
            userRole={userRole}
            onLeavesUpdated={() => {
              reloadData();
              showToast('Leave request updated');
            }}
          />
        )}

        {currentTab === 'regularization' && (
          <RegularizationQueue
            employees={employees}
            regularizations={regularizations}
            shifts={shifts}
            activeEmployee={activeEmployee}
            prefillDate={regularizePrefill.date}
            prefillEmpId={regularizePrefill.empId}
            onRegularizationsUpdated={() => {
              reloadData();
              setRegularizePrefill({});
              showToast('Regularization updated successfully');
            }}
          />
        )}

        {currentTab === 'shifts' && (
          <ShiftManager
            shifts={shifts}
            employees={employees}
            onShiftsUpdated={() => {
              reloadData();
              showToast('Shifts roster saved');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-800">Chronos Attendance</span>
            <span>·</span>
            <span>Enterprise Workforce Management & Timesheet Ledger</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-950 transition-colors"
              title="Reset all test records to original demo state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Baseline</span>
            </button>
            <span>·</span>
            <span>Local Vault Sync: Active</span>
          </div>
        </div>
      </footer>

      {/* Punch Clock Modal */}
      <PunchClock
        isOpen={isPunchModalOpen}
        onClose={() => setIsPunchModalOpen(false)}
        activeEmployee={activeEmployee}
        employees={employees}
        shifts={shifts}
        todayRecord={todayRecord}
        onPunchSuccess={() => {
          reloadData();
          showToast('Attendance recorded successfully!');
        }}
        onSelectEmployee={handleSelectEmployee}
      />

      {/* Kiosk Mode */}
      <KioskModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        employees={employees}
        shifts={shifts}
        onPunchSuccess={() => {
          reloadData();
          showToast('Kiosk punch recorded!');
        }}
      />

      {/* Reports & Payroll Modal */}
      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        employees={employees}
        records={records}
        shifts={shifts}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        shifts={shifts}
        onEmployeeAdded={() => {
          reloadData();
          showToast('New staff member enrolled');
        }}
      />

      {/* Punch Detail Modal */}
      {detailModal.employee && (
        <PunchDetailModal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, record: null, employee: null })}
          record={detailModal.record}
          employee={detailModal.employee}
          shifts={shifts}
          onOpenRegularize={(empId, dt) => {
            setRegularizePrefill({ date: dt, empId });
            setCurrentTab('regularization');
          }}
        />
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { Employee, LeaveRequest, LeaveType, UserRole } from '../types/attendance';
import { AttendanceStorage } from '../services/storage';

interface LeaveManagementProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  activeEmployee: Employee;
  userRole: UserRole;
  onLeavesUpdated: () => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  employees,
  leaveRequests,
  activeEmployee,
  userRole,
  onLeavesUpdated
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form states
  const [selectedEmpId, setSelectedEmpId] = useState(activeEmployee.id);
  const [leaveType, setLeaveType] = useState<LeaveType>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  const targetEmp = employees.find(e => e.id === selectedEmpId) || activeEmployee;

  // Calculate days between start and end
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 0;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const daysRequested = calculateDays(startDate, endDate);

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setFormError('Please select both start and end dates.');
      return;
    }
    if (daysRequested <= 0) {
      setFormError('End date must be on or after start date.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please enter a reason for this leave request.');
      return;
    }

    const newRequest: LeaveRequest = {
      id: `lr_${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      department: targetEmp.department,
      type: leaveType,
      startDate,
      endDate,
      days: daysRequested,
      reason,
      status: userRole === 'admin' ? 'approved' : 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
      reviewedBy: userRole === 'admin' ? 'Admin / Auto-approved' : undefined,
      reviewedAt: userRole === 'admin' ? new Date().toISOString() : undefined
    };

    const currentRequests = AttendanceStorage.getLeaveRequests();
    AttendanceStorage.saveLeaveRequests([newRequest, ...currentRequests]);

    // If approved immediately by admin, adjust leave balance
    if (userRole === 'admin') {
      const allEmps = AttendanceStorage.getEmployees();
      const updatedEmps = allEmps.map(emp => {
        if (emp.id === targetEmp.id) {
          return {
            ...emp,
            leaveBalance: {
              ...emp.leaveBalance,
              [leaveType]: Math.max(0, emp.leaveBalance[leaveType as keyof typeof emp.leaveBalance] - daysRequested)
            }
          };
        }
        return emp;
      });
      AttendanceStorage.saveEmployees(updatedEmps);
    }

    onLeavesUpdated();
    setIsApplyModalOpen(false);
    setReason('');
    setStartDate('');
    setEndDate('');
    setFormError('');
  };

  const handleReview = (requestId: string, newStatus: 'approved' | 'rejected') => {
    const currentRequests = AttendanceStorage.getLeaveRequests();
    const targetReq = currentRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updated = currentRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: newStatus,
          reviewedBy: activeEmployee.name,
          reviewedAt: new Date().toLocaleString()
        };
      }
      return r;
    });

    AttendanceStorage.saveLeaveRequests(updated);

    // If approved, deduct leave balance
    if (newStatus === 'approved' && (targetReq.type === 'paid' || targetReq.type === 'sick' || targetReq.type === 'casual')) {
      const allEmps = AttendanceStorage.getEmployees();
      const updatedEmps = allEmps.map(emp => {
        if (emp.id === targetReq.employeeId) {
          const key = targetReq.type as 'paid' | 'sick' | 'casual';
          return {
            ...emp,
            leaveBalance: {
              ...emp.leaveBalance,
              [key]: Math.max(0, emp.leaveBalance[key] - targetReq.days)
            }
          };
        }
        return emp;
      });
      AttendanceStorage.saveEmployees(updatedEmps);
    }

    onLeavesUpdated();
  };

  const filteredRequests = leaveRequests.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Leave & Time-Off Management
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Workforce Absence Governance</span>
            <span aria-hidden="true">·</span>
            <span>{leaveRequests.filter(r => r.status === 'pending').length} Pending Approvals</span>
          </div>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Grid for Active Employee */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Leave Balances: {activeEmployee.name}
            </h2>
            <p className="text-xs text-neutral-500">Available annual quota for {activeEmployee.role} ({activeEmployee.department})</p>
          </div>
          <span className="text-xs font-mono text-neutral-500">CY 2026 Plan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
            <div className="text-xs font-medium text-neutral-600">Paid Annual Leave (PTO)</div>
            <div className="mt-2 text-3xl font-bold font-mono text-neutral-900 tabular-nums">
              {activeEmployee.leaveBalance.paid} <span className="text-xs font-normal text-neutral-500">days left</span>
            </div>
            <div className="mt-2 text-[11px] text-neutral-500">Accrues 1.75 days / month</div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
            <div className="text-xs font-medium text-neutral-600">Sick & Medical Leave</div>
            <div className="mt-2 text-3xl font-bold font-mono text-neutral-900 tabular-nums">
              {activeEmployee.leaveBalance.sick} <span className="text-xs font-normal text-neutral-500">days left</span>
            </div>
            <div className="mt-2 text-[11px] text-neutral-500">Requires medical slip if &gt; 2 days</div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
            <div className="text-xs font-medium text-neutral-600">Casual / Personal Days</div>
            <div className="mt-2 text-3xl font-bold font-mono text-neutral-900 tabular-nums">
              {activeEmployee.leaveBalance.casual} <span className="text-xs font-normal text-neutral-500">days left</span>
            </div>
            <div className="mt-2 text-[11px] text-neutral-500">Unused days do not carry over</div>
          </div>
        </div>
      </div>

      {/* Leave Requests Queue */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Leave Requests & Approvals Queue
            </h3>
            <p className="text-xs text-neutral-500">Review employee time-off requests</p>
          </div>

          <div className="flex items-center gap-2">
            {['All', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                  filterStatus === status 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-400">
                    No leave requests found matching filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{req.employeeName}</div>
                      <div className="text-[11px] text-neutral-500">{req.department}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium capitalize text-neutral-800">
                        {req.type} Leave
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono tabular-nums text-neutral-800">
                        {req.startDate} to {req.endDate}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Applied {req.appliedOn}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums font-semibold text-neutral-900">
                      {req.days} {req.days === 1 ? 'day' : 'days'}
                    </td>

                    <td className="py-3 px-4 text-neutral-700 max-w-xs">
                      <p className="truncate" title={req.reason}>{req.reason}</p>
                    </td>

                    <td className="py-3 px-3">
                      {req.status === 'pending' && (
                        <span className="text-amber-700 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Pending Review
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Approved
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="text-rose-700 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReview(req.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(req.id, 'rejected')}
                            className="px-2.5 py-1 bg-neutral-200 hover:bg-rose-100 hover:text-rose-700 text-neutral-700 rounded text-[11px] font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400">
                          {req.reviewedBy ? `By ${req.reviewedBy}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply for Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-base font-semibold text-neutral-900">Apply for Time Off</h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="p-6 space-y-4">
              {/* Employee selection (admin can apply for anyone) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Employee
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 bg-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 bg-white"
                >
                  <option value="paid">Paid Annual Leave (PTO)</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual / Personal Leave</option>
                  <option value="unpaid">Unpaid Leave of Absence</option>
                </select>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-600 flex items-center justify-between">
                  <span>Duration calculated:</span>
                  <span className="font-mono font-bold text-neutral-900">{daysRequested} days</span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Reason / Handover Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detail the reason and any colleague covering urgent tasks..."
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
                />
              </div>

              {formError && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

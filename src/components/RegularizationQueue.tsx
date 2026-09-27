import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Employee, RegularizationRequest, AttendanceRecord, Shift } from '../types/attendance';
import { AttendanceStorage } from '../services/storage';

interface RegularizationQueueProps {
  employees: Employee[];
  regularizations: RegularizationRequest[];
  shifts: Shift[];
  activeEmployee: Employee;
  prefillDate?: string;
  prefillEmpId?: string;
  onRegularizationsUpdated: () => void;
}

export const RegularizationQueue: React.FC<RegularizationQueueProps> = ({
  employees,
  regularizations,
  shifts,
  activeEmployee,
  prefillDate,
  prefillEmpId,
  onRegularizationsUpdated
}) => {
  const [isModalOpen, setIsModalOpen] = useState(Boolean(prefillDate));
  const [selectedEmpId, setSelectedEmpId] = useState(prefillEmpId || activeEmployee.id);
  const [date, setDate] = useState(prefillDate || new Date().toISOString().split('T')[0]);
  const [requestedIn, setRequestedIn] = useState('09:00:00');
  const [requestedOut, setRequestedOut] = useState('18:00:00');
  const [reason, setReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [formError, setFormError] = useState('');

  const targetEmp = employees.find(e => e.id === selectedEmpId) || activeEmployee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setFormError('Please enter a justification reason.');
      return;
    }

    const newReq: RegularizationRequest = {
      id: `reg_${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      date,
      requestedIn,
      requestedOut,
      reason,
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };

    const current = AttendanceStorage.getRegularizations();
    AttendanceStorage.saveRegularizations([newReq, ...current]);

    onRegularizationsUpdated();
    setIsModalOpen(false);
    setReason('');
    setFormError('');
  };

  const handleApprove = (req: RegularizationRequest) => {
    // 1. Update regularization status
    const allReqs = AttendanceStorage.getRegularizations();
    const updatedReqs = allReqs.map(r => r.id === req.id ? { ...r, status: 'approved' as const, reviewedBy: activeEmployee.name } : r);
    AttendanceStorage.saveRegularizations(updatedReqs);

    // 2. Adjust attendance record for that employee and date
    const allRecords = AttendanceStorage.getAttendanceRecords();
    const targetEmp = employees.find(e => e.id === req.employeeId);
    const shift = shifts.find(s => s.id === targetEmp?.shiftId) || shifts[0];

    const existingIdx = allRecords.findIndex(r => r.employeeId === req.employeeId && r.date === req.date);

    // Compute duration
    const [inH, inM] = req.requestedIn.split(':').map(Number);
    const [outH, outM] = req.requestedOut.split(':').map(Number);
    const totalMinutes = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM) - 60);

    const updatedRecord: AttendanceRecord = {
      id: existingIdx >= 0 ? allRecords[existingIdx].id : `rec_${req.employeeId}_${req.date}`,
      employeeId: req.employeeId,
      date: req.date,
      shiftId: shift.id,
      firstIn: req.requestedIn,
      lastOut: req.requestedOut,
      totalWorkMinutes: totalMinutes,
      breakMinutes: 60,
      overtimeMinutes: Math.max(0, totalMinutes - shift.fullDayMinutes),
      status: 'present',
      isRegularized: true,
      regularizationReason: req.reason,
      punches: [
        {
          id: `p_reg_in_${Date.now()}`,
          timestamp: `${req.date}T${req.requestedIn}`,
          timeString: req.requestedIn,
          type: 'in',
          method: 'manual_regularized',
          location: 'Regularized Attendance Entry',
          notes: req.reason
        },
        {
          id: `p_reg_out_${Date.now()}`,
          timestamp: `${req.date}T${req.requestedOut}`,
          timeString: req.requestedOut,
          type: 'out',
          method: 'manual_regularized',
          location: 'Regularized Attendance Entry',
          notes: req.reason
        }
      ]
    };

    if (existingIdx >= 0) {
      allRecords[existingIdx] = updatedRecord;
    } else {
      allRecords.push(updatedRecord);
    }

    AttendanceStorage.saveAttendanceRecords(allRecords);
    onRegularizationsUpdated();
  };

  const handleReject = (reqId: string) => {
    const allReqs = AttendanceStorage.getRegularizations();
    const updatedReqs = allReqs.map(r => r.id === reqId ? { ...r, status: 'rejected' as const, reviewedBy: activeEmployee.name } : r);
    AttendanceStorage.saveRegularizations(updatedReqs);
    onRegularizationsUpdated();
  };

  const filteredRequests = regularizations.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Attendance Regularization & Audit
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Punch Correction Workflow</span>
            <span aria-hidden="true">·</span>
            <span>{regularizations.filter(r => r.status === 'pending').length} Pending Audits</span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Regularization</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-600 flex items-start gap-3">
        <FileCheck className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-neutral-900">Why Regularize Attendance?</h3>
          <p className="mt-0.5">
            Regularizations rectify biometric scanner glitches, forgot-to-clock incidents, or official on-site assignments.
            Upon HR approval, the corrected hours are reflected across all attendance registers and payroll calculations.
          </p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Adjustment History & Requests
            </h3>
            <p className="text-xs text-neutral-500">Chronological ledger of regularized attendance adjustments</p>
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
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Requested In</th>
                <th className="py-3 px-3">Requested Out</th>
                <th className="py-3 px-4">Justification Reason</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-400">
                    No regularization requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      {req.employeeName}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums text-neutral-700">
                      {req.date}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums text-neutral-800 font-medium">
                      {req.requestedIn}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums text-neutral-800 font-medium">
                      {req.requestedOut}
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
                            onClick={() => handleApprove(req)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-2.5 py-1 bg-neutral-200 hover:bg-rose-100 hover:text-rose-700 text-neutral-700 rounded text-[11px] font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400">
                          {req.reviewedBy ? `Approved by ${req.reviewedBy}` : 'Audited'}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-base font-semibold text-neutral-900">Attendance Regularization Request</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    <option key={e.id} value={e.id}>{e.name} ({e.employeeCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Date to Regularize
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Requested Check-In (HH:MM:SS)
                  </label>
                  <input
                    type="time"
                    step="1"
                    required
                    value={requestedIn}
                    onChange={(e) => setRequestedIn(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Requested Check-Out (HH:MM:SS)
                  </label>
                  <input
                    type="time"
                    step="1"
                    required
                    value={requestedOut}
                    onChange={(e) => setRequestedOut(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Reason / Operational Justification
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. On-site client demo at customer headquarters, forgot terminal punch..."
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Employee, Department, Shift } from '../types/attendance';
import { AttendanceStorage } from '../services/storage';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  onEmployeeAdded: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  shifts,
  onEmployeeAdded
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [shiftId, setShiftId] = useState(shifts[0]?.id || 'shift_gen');
  const [location, setLocation] = useState('San Francisco HQ - Floor 5');
  const [phone, setPhone] = useState('+1 (415) 890-2199');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'EM';
    const allEmps = AttendanceStorage.getEmployees();
    const nextCodeNumber = 1000 + allEmps.length + 1;

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      employeeCode: `CHR-${nextCodeNumber}`,
      name,
      email,
      role,
      department,
      shiftId,
      avatarColor: 'bg-neutral-800',
      avatarInitials: initials,
      location,
      phone,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      leaveBalance: { paid: 15, sick: 10, casual: 5 }
    };

    AttendanceStorage.saveEmployees([...allEmps, newEmp]);
    onEmployeeAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <h3 className="text-base font-semibold text-neutral-900">Enrol New Staff Member</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.m@chronos.io"
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Role Title
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Operations">Operations</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Assigned Shift
              </label>
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900 bg-white"
              >
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Default Location / Facility
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
            >
              Enrol Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

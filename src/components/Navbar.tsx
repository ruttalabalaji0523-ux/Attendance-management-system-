import React from 'react';
import { Clock, ShieldCheck, User } from 'lucide-react';
import { Employee, UserRole } from '../types/attendance';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  activeEmployee: Employee;
  allEmployees: Employee[];
  onSelectEmployee: (empId: string) => void;
  onOpenPunchModal: () => void;
  onOpenKiosk: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onToggleRole,
  activeEmployee,
  allEmployees,
  onOpenPunchModal,
  onOpenKiosk
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'register', label: 'Daily Register' },
    { id: 'timesheet', label: 'Monthly Timesheet' },
    { id: 'leaves', label: 'Leaves & PTO' },
    { id: 'regularization', label: 'Regularizations' },
    { id: 'shifts', label: 'Shifts & Roster' }
  ];

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onSelectTab('overview'); }}
            className="text-lg font-bold tracking-tight text-neutral-900 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-mono font-semibold text-sm">
              CH
            </div>
            Chronos Attendance
          </a>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-neutral-600">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`transition-colors whitespace-nowrap pb-1 relative ${
                currentTab === item.id
                  ? 'text-neutral-950 font-semibold'
                  : 'hover:text-neutral-950'
              }`}
            >
              {item.label}
              {currentTab === item.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-900 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* Quick Clock Button */}
          <button
            onClick={onOpenPunchModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Clock In / Out</span>
          </button>

          {/* Kiosk Terminal Mode */}
          <button
            onClick={onOpenKiosk}
            title="Open Tablet Kiosk Terminal"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <span>Kiosk Terminal</span>
          </button>

          {/* Role switcher indicator */}
          <div className="relative flex items-center pl-2 border-l border-neutral-200">
            <button
              onClick={onToggleRole}
              title={`Switch role. Current: ${userRole === 'admin' ? 'Admin / HR' : 'Employee'}`}
              className="flex items-center gap-2 p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors text-xs"
            >
              <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-800 flex items-center justify-center font-medium text-xs">
                {activeEmployee.avatarInitials}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-medium text-neutral-900 leading-tight">
                  {userRole === 'admin' ? 'Admin View' : activeEmployee.name}
                </span>
                <span className="text-[11px] text-neutral-500 leading-tight">
                  {userRole === 'admin' ? 'Full Authority' : 'Self-Service'}
                </span>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Mobile nav bar for small screens */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-neutral-100 bg-neutral-50/50 space-x-4 text-xs font-medium text-neutral-600 no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap px-2 py-1 rounded-md transition-colors ${
              currentTab === item.id
                ? 'bg-neutral-900 text-white font-semibold'
                : 'hover:text-neutral-950'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

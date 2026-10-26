import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  FlaskConical,
  FileText,
  CreditCard,
  Milestone,
  Clock,
  Pill,
  User,
  Users,
  ShieldCheck,
  Package,
  Layers,
  Settings,
  HelpCircle,
  Stethoscope,
  ClipboardList,
  UploadCloud,
  CheckCircle2,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'patient';

  // Navigation schema per role
  const getNavLinks = () => {
    switch (role) {
      case 'patient':
        return [
          { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/patient/book-test', label: 'Book Diagnostic Test', icon: FlaskConical },
          { to: '/patient/appointments', label: 'Doctor Appointments', icon: Calendar },
          { to: '/patient/tracker', label: 'Journey Tracker', icon: Milestone },
          { to: '/patient/reports', label: 'My Reports', icon: FileText },
          { to: '/patient/payments', label: 'Payment History', icon: CreditCard },
          { to: '/patient/health-history', label: 'Health Timeline', icon: Clock },
          { to: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
          { to: '/patient/profile', label: 'My Profile', icon: User },
          { to: '/patient/support', label: 'Reviews & Support', icon: HelpCircle },
        ];
      case 'doctor':
        return [
          { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
          { to: '/doctor/patients', label: 'Patient Records', icon: Users },
          { to: '/doctor/availability', label: 'Availability & Slots', icon: Clock },
        ];
      case 'lab_staff':
        return [
          { to: '/lab/dashboard', label: 'Lab Dashboard', icon: LayoutDashboard },
          { to: '/lab/bookings', label: 'Assigned Bookings', icon: ClipboardList },
          { to: '/lab/upload-report', label: 'Upload Report', icon: UploadCloud },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { to: '/admin/users', label: 'User Directory', icon: Users },
          { to: '/admin/doctor-approvals', label: 'Doctor Approvals', icon: ShieldCheck },
          { to: '/admin/tests', label: 'Tests & Packages', icon: Package },
          { to: '/admin/slots', label: 'Slot Capacity', icon: Clock },
          { to: '/admin/payments', label: 'Payments & Revenue', icon: CreditCard },
          { to: '/admin/complaints', label: 'Complaints & Support', icon: HelpCircle },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Medi<span className="text-teal-400">Track</span>
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-teal-400/80 -mt-0.5">
                Healthcare OS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-900/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Quick Info Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center font-bold text-xs uppercase border border-teal-500/30">
              {role.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-teal-400 capitalize truncate">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

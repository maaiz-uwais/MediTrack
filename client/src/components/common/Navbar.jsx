import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  LogOut,
  User as UserIcon,
  Activity,
  Menu,
  ShieldCheck,
  Stethoscope,
  FlaskConical,
  HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar, notifications = [], unreadCount = 0, onOpenNotifications }) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'doctor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Stethoscope className="w-3.5 h-3.5" /> Doctor
          </span>
        );
      case 'lab_staff':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <FlaskConical className="w-3.5 h-3.5" /> Lab Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            <HeartPulse className="w-3.5 h-3.5" /> Patient
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Brand indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Connected to Live Healthcare Node
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Badge */}
        {getRoleBadge(user?.role)}

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-semibold text-sm flex items-center justify-center shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {user?.name}
            </span>
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              {user?.role === 'patient' && (
                <Link
                  to="/patient/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  <UserIcon className="w-4 h-4" /> My Profile
                </Link>
              )}

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

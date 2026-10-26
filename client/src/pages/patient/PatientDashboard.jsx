import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientDashboard } from '../../services/patientService';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  FlaskConical,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Video,
  MapPin,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getPatientDashboard();
        if (res.data.success) {
          setDashboardData(res.data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const {
    profile,
    activeBookings = [],
    upcomingAppointments = [],
    recentReports = [],
    pendingPaymentsCount = 0,
  } = dashboardData || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Report Ready':
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            {status}
          </span>
        );
      case 'Processing':
      case 'Sample Collected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
            {status}
          </span>
        );
      case 'Paid':
      case 'Confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
            {status}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white p-6 sm:p-8 shadow-xl shadow-teal-950/20">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-teal-100 mb-3">
            <HeartPulse className="w-3.5 h-3.5" /> Patient Wellness Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-sm text-teal-100/90 leading-relaxed">
            Manage your diagnostic lab appointments, consult with verified medical specialists, track sample processing stages in real time, and download verified clinical reports.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/patient/book-test"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-800 font-bold text-xs sm:text-sm hover:bg-teal-50 transition-all shadow-md"
            >
              <FlaskConical className="w-4 h-4 text-teal-600" /> Book Diagnostic Test
            </Link>
            <Link
              to="/patient/appointments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all"
            >
              <Calendar className="w-4 h-4" /> Book Doctor Appointment
            </Link>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Pending Payment Alert if any */}
      {pendingPaymentsCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                You have {pendingPaymentsCount} pending checkout(s)
              </h4>
              <p className="text-xs text-amber-700">
                Complete Razorpay digital payment to confirm your scheduled slot and sample collection.
              </p>
            </div>
          </div>
          <Link
            to="/patient/payments"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs text-center shadow-sm"
          >
            Review & Pay Now
          </Link>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Tests</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{activeBookings.length}</p>
          <p className="text-xs text-teal-600 font-semibold mt-1">
            <Link to="/patient/tracker" className="hover:underline flex items-center gap-1">
              Live journey tracking <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Upcoming Consults</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{upcomingAppointments.length}</p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">
            <Link to="/patient/appointments" className="hover:underline flex items-center gap-1">
              Manage schedule <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Lab Reports</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{recentReports.length}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            <Link to="/patient/reports" className="hover:underline flex items-center gap-1">
              Digital PDF downloads <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Blood Group</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{profile?.bloodGroup || 'A+'}</p>
          <p className="text-xs text-slate-400 mt-1">
            <Link to="/patient/profile" className="hover:underline text-teal-600 font-semibold">
              Update Health Profile
            </Link>
          </p>
        </div>
      </div>

      {/* Main Grid: Active Journey Tracking & Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Test Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Test Bookings</h3>
                <p className="text-xs text-slate-500">Live phlebotomy and diagnostic progress</p>
              </div>
              <Link
                to="/patient/tracker"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                Track All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeBookings.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No tests currently in progress</p>
                <Link
                  to="/patient/book-test"
                  className="mt-2 inline-block text-xs font-bold text-teal-600 underline"
                >
                  Book a diagnostic investigation
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((b) => (
                  <div
                    key={b._id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {b.bookingId}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 truncate max-w-xs">
                        {b.tests?.map((t) => t.name).join(', ') ||
                          b.packages?.map((p) => p.title).join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(b.scheduledDate).toLocaleDateString()} ({b.slot})
                      </p>
                    </div>

                    <Link
                      to="/patient/tracker"
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shrink-0"
                    >
                      Track
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Doctor Visits */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upcoming Consultations</h3>
                <p className="text-xs text-slate-500">Scheduled appointments with specialists</p>
              </div>
              <Link
                to="/patient/appointments"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No upcoming consultations</p>
                <Link
                  to="/patient/appointments"
                  className="mt-2 inline-block text-xs font-bold text-indigo-600 underline"
                >
                  Schedule a doctor appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {apt.doctor?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{apt.doctor?.name}</h4>
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {apt.doctorProfile?.specialization}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{new Date(apt.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{apt.slot}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            {apt.consultationType}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

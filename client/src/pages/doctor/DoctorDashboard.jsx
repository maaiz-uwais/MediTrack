import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { getDoctorStats, getDoctorAppointments } from '../../services/doctorService';
import {
  Stethoscope,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Star,
  Sparkles,
  RefreshCw,
  User,
  Pill,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, apptsRes] = await Promise.all([
        getDoctorStats(),
        getDoctorAppointments({ status: 'all' }),
      ]);
      setStats(statsRes.data.stats || {});
      setProfile(statsRes.data.profile || {});
      setUpcomingAppointments((apptsRes.data.appointments || []).slice(0, 5));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctor dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const activityData = [
    { name: "Today's Consults", count: stats?.todayAppointments || 0 },
    { name: 'Pending Requests', count: stats?.pendingRequests || 0 },
    { name: 'Completed Visits', count: stats?.completedTotal || 0 },
    { name: 'Unique Patients', count: stats?.totalPatientsTreated || 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-indigo-200 mb-3 border border-white/10">
            <Stethoscope className="w-3.5 h-3.5 text-indigo-300" />
            Medical Practitioner Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, Dr. {user?.name}!
          </h1>
          <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed max-w-2xl">
            {profile?.specialization || 'Clinical Specialist'} • {profile?.experience || 5} Years Experience • License: {profile?.licenseNumber || 'Active Verification'} • Consultation Fee: ₹{profile?.fee || 500}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/doctor/appointments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm hover:bg-indigo-50 shadow-md transition-colors"
            >
              <Calendar className="w-4 h-4 text-indigo-700" />
              Manage Consultations
            </Link>
            <Link
              to="/doctor/patients"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 text-white border border-white/20 font-bold text-xs sm:text-sm transition-colors"
            >
              <Users className="w-4 h-4" />
              Patient Dossiers & Lab Results
            </Link>
            <Link
              to="/doctor/availability"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold text-xs sm:text-sm transition-colors"
            >
              <Clock className="w-4 h-4" />
              Weekly Schedule
            </Link>
            <button
              type="button"
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Consultations
            </span>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">
              {stats?.todayAppointments ?? '--'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Scheduled for today</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Consults
            </span>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              {stats?.completedTotal ?? '--'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total treated & prescribed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unique Patients
            </span>
            <p className="text-3xl font-extrabold text-teal-600 mt-1">
              {stats?.totalPatientsTreated ?? '--'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Under clinical care</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Patient Rating
            </span>
            <p className="text-3xl font-extrabold text-amber-500 mt-1 flex items-center gap-1">
              {stats?.ratingsAverage ?? 4.9} <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </p>
            <p className="text-xs text-slate-400 mt-1">Verified patient feedback</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Clinical Practice Activity</h3>
              <p className="text-xs text-slate-500">Overview of patient appointments and treatment volume</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Profile Summary Card */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Practitioner Dossier</h3>
            <div className="space-y-3 text-xs text-slate-600 mt-4">
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-400">Specialization:</span>
                <span className="font-bold text-slate-800">{profile?.specialization || 'Consultant'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-400">Consultation Fee:</span>
                <span className="font-bold text-slate-800">₹{profile?.fee || 500}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-400">Admin Approval:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {profile?.isApproved ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-400">Working Days:</span>
                <span className="font-bold text-slate-800">
                  {profile?.availability?.workingDays?.slice(0, 3).join(', ') || 'Mon - Fri'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <Link
              to="/doctor/availability"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1"
            >
              Update Availability & Slot Times <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Consultations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Upcoming Consultations</h3>
            <p className="text-xs text-slate-500">Patients scheduled for clinical evaluation</p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All Consultations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading consults...</div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No consultations scheduled at the moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Appointment ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Chief Complaint / Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                      {apt.appointmentId || apt._id.substring(0, 8)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{apt.patient?.name}</div>
                      <div className="text-slate-400 text-[11px]">{apt.patient?.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{new Date(apt.date).toLocaleDateString('en-IN')}</div>
                      <div className="text-indigo-600 font-medium">{apt.slot}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {apt.reason || 'General Health Consultation'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : apt.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/doctor/appointments"
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        Open Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

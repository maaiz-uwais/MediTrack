import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/adminService';
import {
  Users,
  Stethoscope,
  FlaskConical,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Package,
  Calendar,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await getAdminStats();
      if (res.data.success) {
        setData(res.data);
      }
    } catch {
      toast.error('Failed to load administrative analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold mt-3 text-xs tracking-wider uppercase">
          Aggregating Platform Health Data...
        </p>
      </div>
    );
  }

  const { stats, bookingsTrend = [], testDistribution = [], recentComplaints = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-800 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl shadow-rose-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/20 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Medical Administration Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              MediTrack Control Center
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Live monitoring of multi-center clinical diagnostics, doctor accreditations, patient volumes, and financial reconciliation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {stats?.pendingDoctorApprovals > 0 && (
              <Link
                to="/admin/doctor-approvals"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all animate-pulse"
              >
                <AlertCircle className="w-4 h-4 text-slate-950" />
                {stats.pendingDoctorApprovals} Doctor(s) Pending Approval
              </Link>
            )}
            <Link
              to="/admin/tests"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all"
            >
              <Package className="w-4 h-4 text-teal-400" /> Test Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Patients
            </span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats?.totalPatients || 0}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14% month-over-month
            </p>
          </div>
        </div>

        {/* Doctors Active vs Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Doctors
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900">{stats?.totalDoctors || 0}</h3>
              <span className="text-xs font-semibold text-slate-500">Verified</span>
            </div>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              {stats?.pendingDoctorApprovals || 0} awaiting approval
            </p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Diagnostic Bookings
            </span>
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats?.totalBookings || 0}</h3>
            <p className="text-xs text-slate-400 mt-1">Across lab visit & home sample routes</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Platform Revenue
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900">
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Razorpay Test Mode Verified
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings & Revenue Area Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Diagnostic Bookings Trend</h3>
              <p className="text-xs text-slate-500">Daily appointment and test sample volume</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingsTrend}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#0d9488"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  name="Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Tests Donut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Most Popular Diagnostics</h3>
            <p className="text-xs text-slate-500 mb-2">Demand breakdown by investigation</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={testDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {testDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            {testDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Doctor Approval Alert & Recent Grievances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doctor Verification Queue Quick Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                Medical Credential Approvals
              </h3>
              <Link
                to="/admin/doctor-approvals"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Medical Council regulations require administrative license validation before practitioners can interact with patients and prescribe treatments.
            </p>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">
                {stats?.pendingDoctorApprovals || 0} Doctors Awaiting Verification
              </p>
              <p className="text-[11px] text-slate-500">
                Includes license number, degrees & experience checks
              </p>
            </div>
            <Link
              to="/admin/doctor-approvals"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              Review Now
            </Link>
          </div>
        </div>

        {/* Complaints and Feedback Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Patient Grievances & Tickets
              </h3>
              <Link
                to="/admin/complaints"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                Manage All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitor patient escalations regarding billing, phlebotomist home visits, report turn-around times, or clinic consultations.
            </p>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Customer Support Status</p>
              <p className="text-[11px] text-slate-500">
                {recentComplaints.length} recent support cases logged
              </p>
            </div>
            <Link
              to="/admin/complaints"
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
            >
              Inspect
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

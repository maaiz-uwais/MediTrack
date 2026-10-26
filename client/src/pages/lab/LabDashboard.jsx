import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { getLabDashboardStats, getLabBookings, updateSampleStatus } from '../../services/labService';
import {
  FlaskConical,
  ClipboardList,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Truck,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const LabDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes] = await Promise.all([
        getLabDashboardStats(),
        getLabBookings({ status: 'all' }),
      ]);
      setStats(statsRes.data.stats || {});
      setRecentBookings((bookingsRes.data.bookings || []).slice(0, 6));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load laboratory metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (bookingId, nextStatus) => {
    try {
      setActionLoading(bookingId);
      await updateSampleStatus(bookingId, { status: nextStatus });
      toast.success(`Booking advanced to '${nextStatus}'`);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update sample status');
    } finally {
      setActionLoading(null);
    }
  };

  // Recharts data
  const pipelineData = [
    { name: 'Pending Collection', count: stats?.pendingCollection || 0, color: '#f59e0b' },
    { name: 'In Processing', count: stats?.inProcessing || 0, color: '#6366f1' },
    { name: 'Reports Ready Today', count: stats?.reportsReadyToday || 0, color: '#10b981' },
    { name: 'Home Visits Today', count: stats?.homeCollectionsToday || 0, color: '#0d9488' },
  ];

  const pieData = [
    { name: 'Pending', value: stats?.pendingCollection || 1, color: '#f59e0b' },
    { name: 'Processing', value: stats?.inProcessing || 1, color: '#6366f1' },
    { name: 'Delivered', value: stats?.reportsReadyToday || 1, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-teal-200 mb-3 border border-white/10">
            <FlaskConical className="w-3.5 h-3.5 text-teal-300" />
            MediTrack Diagnostic Laboratory Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-sm text-teal-100/90 leading-relaxed max-w-2xl">
            Monitor active phlebotomy requests, transition patient samples through the diagnostic pipeline, and deliver verified clinical reports with digital signatures.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/lab/bookings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs sm:text-sm hover:bg-teal-50 shadow-md transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-teal-700" />
              Diagnostic Queue
            </Link>
            <Link
              to="/lab/upload-report"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600/40 hover:bg-teal-600/60 text-white border border-white/20 font-bold text-xs sm:text-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Diagnostic PDF
            </Link>
            <button
              type="button"
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Collection
            </span>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">
              {stats?.pendingCollection ?? '--'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Awaiting phlebotomy or check-in</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Samples In Processing
            </span>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">
              {stats?.inProcessing ?? '--'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Pathology & biochemistry</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reports Ready Today
            </span>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              {stats?.reportsReadyToday ?? '--'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Uploaded & patient-ready</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Home Visits Today
            </span>
            <p className="text-3xl font-extrabold text-teal-600 mt-1">
              {stats?.homeCollectionsToday ?? '--'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Doorstep phlebotomist routes</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Diagnostic Pipeline Breakdown
              </h3>
              <p className="text-xs text-slate-500">Live tally of tests across operating stages</p>
            </div>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Operational Distribution</h3>
            <p className="text-xs text-slate-500">Pending vs Processing vs Delivered</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              to="/lab/bookings"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center justify-center gap-1"
            >
              Open Full Diagnostic Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Diagnostic Bookings</h3>
            <p className="text-xs text-slate-500">Quickly transition test status or upload report</p>
          </div>
          <Link
            to="/lab/bookings"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            View All Bookings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading queue...</div>
        ) : recentBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No diagnostic bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Tests / Package</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((b) => {
                  const testsSummary =
                    b.tests?.map((t) => t.name).join(', ') ||
                    b.packages?.map((p) => p.title).join(', ') ||
                    'General Test';

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {b.bookingId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{b.patient?.name}</div>
                        <div className="text-slate-400 text-[11px]">{b.patient?.phone}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-700" title={testsSummary}>
                        {testsSummary}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.collectionType === 'home_collection'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}
                        >
                          {b.collectionType === 'home_collection' ? 'Home' : 'Lab Visit'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            b.status === 'Report Ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'Processing'
                              ? 'bg-indigo-100 text-indigo-800'
                              : b.status === 'Sample Collected'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {b.status === 'Paid' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(b._id, 'Sample Collected')}
                            disabled={actionLoading === b._id}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Mark Collected
                          </button>
                        )}
                        {b.status === 'Sample Collected' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(b._id, 'Processing')}
                            disabled={actionLoading === b._id}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Process Sample
                          </button>
                        )}
                        {b.status === 'Processing' && (
                          <Link
                            to="/lab/upload-report"
                            state={{ preselectBookingId: b._id }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                          >
                            <UploadCloud className="w-3.5 h-3.5" /> Upload PDF
                          </Link>
                        )}
                        {b.status === 'Report Ready' && (
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabDashboard;

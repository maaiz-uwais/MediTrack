import React, { useState, useEffect } from 'react';
import { getMyTestBookings } from '../../services/bookingService';
import { getMyReports } from '../../services/reportService';
import {
  Milestone,
  CheckCircle2,
  Clock,
  FlaskConical,
  CreditCard,
  Droplets,
  Microscope,
  FileCheck2,
  Download,
  AlertCircle,
  Truck,
  Building2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = [
  { key: 'Booked', label: 'Booked', icon: Calendar, desc: 'Test booking scheduled' },
  { key: 'Paid', label: 'Paid', icon: CreditCard, desc: 'Payment verified via Razorpay' },
  { key: 'Sample Collected', label: 'Sample Collected', icon: Droplets, desc: 'Phlebotomist collected sample' },
  { key: 'Processing', label: 'Processing', icon: Microscope, desc: 'Automated clinical analysis' },
  { key: 'Report Ready', label: 'Report Ready', icon: FileCheck2, desc: 'Pathologist verified PDF report' },
];

const JourneyTracker = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, reportsRes] = await Promise.all([
          getMyTestBookings(),
          getMyReports(),
        ]);
        if (bookingsRes.data.success) {
          setBookings(bookingsRes.data.bookings || []);
          if (bookingsRes.data.bookings?.length > 0) {
            setSelectedBooking(bookingsRes.data.bookings[0]);
          }
        }
        if (reportsRes.data.success) {
          setReports(reportsRes.data.reports || []);
        }
      } catch {
        toast.error('Failed to load healthcare journey.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Determine stage progression index (0 to 4)
  const getStageIndex = (status) => {
    const idx = STAGES.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIndex = selectedBooking ? getStageIndex(selectedBooking.status) : 0;

  // Find associated report if Report Ready
  const associatedReport = selectedBooking
    ? reports.find((r) => r.booking?._id === selectedBooking._id || r.booking === selectedBooking._id)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Live Diagnostic Sample Journey Tracker
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Follow your diagnostic investigation in real time from online scheduling to final digital report delivery.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80">
          <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-semibold">Tracing diagnostic journey...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No active test bookings found</p>
          <p className="text-xs text-slate-400 mt-1">
            Book a diagnostic test to follow its end-to-end sample lifecycle.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Booking Picker Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Select Booking:
            </span>
            {bookings.map((b) => (
              <button
                key={b._id}
                onClick={() => setSelectedBooking(b)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                  selectedBooking?._id === b._id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="font-mono">{b.bookingId}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    b.status === 'Report Ready'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'Processing'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {b.status}
                </span>
              </button>
            ))}
          </div>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Stepper Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                {/* Booking Header Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
                      Active Investigation Order
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {selectedBooking.tests?.map((t) => t.name).join(', ') ||
                        selectedBooking.packages?.map((p) => p.title).join(', ')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700">
                        #{selectedBooking.bookingId}
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        {selectedBooking.collectionType.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>
                        Scheduled: {new Date(selectedBooking.scheduledDate).toLocaleDateString()} (
                        {selectedBooking.slot})
                      </span>
                    </p>
                  </div>

                  {selectedBooking.status === 'Report Ready' && (
                    <a
                      href={associatedReport?.fileUrl || '/uploads/sample_diagnostic_report.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all shrink-0"
                    >
                      <Download className="w-4 h-4" /> Download Report PDF
                    </a>
                  )}
                </div>

                {/* Visual 5-Stage Stepper Component */}
                <div className="py-8">
                  <div className="relative">
                    {/* Connecting progress bar */}
                    <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 -z-0">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700 ease-in-out"
                        style={{
                          width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Stage nodes */}
                    <div className="relative z-10 flex justify-between">
                      {STAGES.map((stage, idx) => {
                        const Icon = stage.icon;
                        const isDone = idx <= currentStageIndex;
                        const isCurrent = idx === currentStageIndex;

                        return (
                          <div
                            key={stage.key}
                            className="flex flex-col items-center max-w-[120px] text-center"
                          >
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                                isCurrent
                                  ? 'bg-teal-600 text-white ring-4 ring-teal-500/20 shadow-lg shadow-teal-600/30 animate-pulse-glow scale-110'
                                  : isDone
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}
                            >
                              {isDone && !isCurrent ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                            </div>

                            <p
                              className={`text-xs mt-3 font-bold ${
                                isCurrent
                                  ? 'text-teal-700 font-extrabold'
                                  : isDone
                                  ? 'text-slate-900'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stage.label}
                            </p>
                            <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                              {stage.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Audit History Timeline */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" /> Audit Log & Phlebotomist Notes
                </h4>

                <div className="space-y-4">
                  {selectedBooking.statusHistory?.map((step, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            {step.status}
                          </span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date(step.changedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {step.notes || 'Status updated in diagnostic workflow.'}
                        </p>
                      </div>

                      {step.changedBy && (
                        <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                          Updated by: {step.changedBy.name || 'MediTrack System'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JourneyTracker;

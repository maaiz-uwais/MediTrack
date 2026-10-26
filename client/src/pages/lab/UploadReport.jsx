import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getLabBookings, uploadReport } from '../../services/labService';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  FlaskConical,
  ArrowLeft,
  X,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const UploadReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedId = location.state?.preselectBookingId || '';

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState(preselectedId);

  // Form Fields
  const [summary, setSummary] = useState(
    'All biochemical and pathological parameters evaluated within standard clinical tolerances. Verified by Pathologist.'
  );
  const [criticalFlag, setCriticalFlag] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await getLabBookings({ status: 'all' });
      // Filter bookings that can receive reports: Paid, Sample Collected, Processing, or preselected
      const eligible = (res.data.bookings || []).filter(
        (b) =>
          b.status === 'Processing' ||
          b.status === 'Sample Collected' ||
          b.status === 'Paid' ||
          b._id === preselectedId
      );
      setBookings(eligible);
      if (preselectedId) {
        setSelectedBookingId(preselectedId);
      } else if (eligible.length > 0) {
        setSelectedBookingId(eligible[0]._id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load active test bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        toast.error('Only official PDF reports are permitted');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      toast.error('Please select a diagnostic booking');
      return;
    }
    if (!selectedFile) {
      toast.error('Please attach a PDF diagnostic report');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('bookingId', selectedBookingId);
      formData.append('reportFile', selectedFile);
      formData.append('summary', summary);
      formData.append('criticalFlag', criticalFlag ? 'true' : 'false');

      const res = await uploadReport(formData);
      toast.success('Diagnostic report uploaded and delivered successfully!');
      setUploadSuccess(res.data.report);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload diagnostic report');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBooking = bookings.find((b) => b._id === selectedBookingId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          to="/lab/bookings"
          className="text-xs font-semibold text-slate-500 hover:text-teal-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Diagnostic Queue
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3 text-teal-200">
          <UploadCloud className="w-3.5 h-3.5" />
          Laboratory Result Dispatch
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Upload Diagnostic PDF Report
        </h1>
        <p className="text-teal-100/90 text-sm mt-1 max-w-xl">
          Attach verified diagnostic results to transition patient bookings to 'Report Ready' and trigger real-time patient alerts.
        </p>
      </div>

      {/* Success Notification Banner */}
      {uploadSuccess ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Diagnostic Report Uploaded!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Report <strong>{uploadSuccess.reportId}</strong> has been bound to the booking. The patient can now view and download their results directly.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              to="/lab/bookings"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Return to Diagnostic Queue
            </Link>
            <button
              type="button"
              onClick={() => {
                setUploadSuccess(null);
                setSelectedFile(null);
                fetchBookings();
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Upload Another Report
            </button>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs space-y-6">
            {/* Booking Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Select Diagnostic Test Booking
              </label>
              {loadingBookings ? (
                <div className="text-xs text-slate-400 py-2">Loading active bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  No bookings are currently pending report upload. Samples must be booked or processed first.
                </div>
              ) : (
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-teal-500"
                  required
                >
                  {bookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.bookingId} — {b.patient?.name} ({b.status}) —{' '}
                      {b.tests?.map((t) => t.name).join(', ') || 'Package'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Booking Info Card */}
            {selectedBooking && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Patient:</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedBooking.patient?.name}</div>
                  <div className="text-slate-500">{selectedBooking.patient?.phone}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Collection Slot:</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {new Date(selectedBooking.scheduledDate).toLocaleDateString('en-IN')}
                  </div>
                  <div className="text-slate-500">{selectedBooking.timeSlot}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Current Status:</span>
                  <div className="mt-0.5">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-full">
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Drag & Drop File Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Diagnostic PDF Document
              </label>

              {!selectedFile ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 hover:bg-teal-50/20 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-slate-700">
                      Click to browse or drop diagnostic PDF here
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      Official signed pathology or radiology reports in PDF format (up to 15MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{selectedFile.name}</div>
                      <div className="text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Pathologist Summary */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Pathologist Observations & Clinical Summary
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key diagnostic findings, abnormal markers, or follow-up recommendations..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-teal-500 resize-none"
                required
              />
            </div>

            {/* Critical Flag Alert Toggle */}
            <div className="flex items-start gap-3 p-4 bg-rose-50/60 border border-rose-200/80 rounded-xl">
              <input
                id="critical"
                type="checkbox"
                checked={criticalFlag}
                onChange={(e) => setCriticalFlag(e.target.checked)}
                className="mt-1 w-4 h-4 text-rose-600 border-rose-300 rounded focus:ring-rose-500"
              />
              <label htmlFor="critical" className="text-xs cursor-pointer">
                <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Flag as Critical / Urgent Pathology Finding
                </span>
                <span className="text-rose-700/80 mt-0.5 block">
                  Checking this adds a prominent critical alert badge on the patient's dashboard and alerts consulting physicians.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedFile || !selectedBookingId}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading & Disagreeing Status...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Publish & Deliver Diagnostic Report
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UploadReport;

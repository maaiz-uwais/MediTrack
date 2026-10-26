import React, { useState, useEffect } from 'react';
import { getLabBookings, updateSampleStatus } from '../../services/labService';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FlaskConical,
  UploadCloud,
  MapPin,
  Calendar,
  User,
  Phone,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Truck,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AssignedBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  // Status update modal / notes
  const [updatingId, setUpdatingId] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, collectionFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getLabBookings({
        status: statusFilter,
        collectionType: collectionFilter,
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load lab bookings queue');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (booking, nextStatus) => {
    setUpdatingId(booking._id);
    setTargetStatus(nextStatus);
    setStatusNotes(
      nextStatus === 'Sample Collected'
        ? 'Sample accessioned and barcoded successfully.'
        : nextStatus === 'Processing'
        ? 'Transferred to automated analyzer for diagnostic evaluation.'
        : ''
    );
  };

  const handleConfirmStatusUpdate = async () => {
    if (!updatingId || !targetStatus) return;

    try {
      setActionLoading(true);
      await updateSampleStatus(updatingId, {
        status: targetStatus,
        notes: statusNotes,
      });
      toast.success(`Booking transitioned to '${targetStatus}'!`);
      setUpdatingId(null);
      setTargetStatus('');
      setStatusNotes('');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update sample status');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    const idMatch = b.bookingId?.toLowerCase().includes(term);
    const patientMatch = b.patient?.name?.toLowerCase().includes(term);
    const phoneMatch = b.patient?.phone?.includes(term);
    const testMatch = b.tests?.some((t) => t.name.toLowerCase().includes(term));
    return idMatch || patientMatch || phoneMatch || testMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3 text-teal-200">
            <ClipboardList className="w-3.5 h-3.5" />
            Diagnostic Workbench
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Assigned Diagnostic Bookings
          </h1>
          <p className="text-teal-100/90 text-sm mt-1 max-w-xl">
            Manage phlebotomist pickups, accession biological samples, and transition tests through lab analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/lab/upload-report"
            className="px-4 py-2.5 bg-white text-teal-800 hover:bg-teal-50 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-teal-600" />
            Upload PDF Report
          </Link>
          <button
            type="button"
            onClick={fetchBookings}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ID, Patient, Phone, or Test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid (Pending Collection)</option>
              <option value="Sample Collected">Sample Collected</option>
              <option value="Processing">In Processing</option>
              <option value="Report Ready">Report Ready</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Type:</span>
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-teal-500"
            >
              <option value="all">All Types</option>
              <option value="home_collection">Home Collection</option>
              <option value="lab_visit">Lab Visit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Queue */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Loading Diagnostic Queue...
          </p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Bookings Found</h3>
          <p className="text-sm text-slate-500 mt-2">
            No diagnostic test bookings match the selected filters or search terms.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isExpanded = expandedId === b._id;
            const dateStr = new Date(b.scheduledDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Header */}
                <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                        b.collectionType === 'home_collection'
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          : 'bg-teal-50 border-teal-100 text-teal-600'
                      }`}
                    >
                      {b.collectionType === 'home_collection' ? (
                        <Truck className="w-6 h-6" />
                      ) : (
                        <Building2 className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {b.bookingId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            b.collectionType === 'home_collection'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}
                        >
                          {b.collectionType === 'home_collection' ? 'Home Collection' : 'Lab Visit'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">{b.patient?.name}</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Phone className="w-3.5 h-3.5" />
                          {b.patient?.phone || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr} ({b.timeSlot})
                        </span>
                      </div>

                      {/* Tests badges */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {b.tests?.map((t) => (
                          <span
                            key={t._id}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                          >
                            {t.name}
                            {t.sampleType ? ` (${t.sampleType})` : ''}
                          </span>
                        ))}
                        {b.packages?.map((p) => (
                          <span
                            key={p._id}
                            className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[11px] font-medium"
                          >
                            Pkg: {p.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex flex-wrap items-center gap-2.5 lg:self-center">
                    {b.status === 'Paid' && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(b, 'Sample Collected')}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Collect Sample
                      </button>
                    )}

                    {b.status === 'Sample Collected' && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(b, 'Processing')}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                        Send to Processing
                      </button>
                    )}

                    {(b.status === 'Processing' || b.status === 'Sample Collected') && (
                      <Link
                        to="/lab/upload-report"
                        state={{ preselectBookingId: b._id }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        Upload PDF Report
                      </Link>
                    )}

                    {b.status === 'Report Ready' && (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Report Published
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(b._id)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Home collection address & Status History */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 md:p-6 bg-slate-50/70 space-y-4">
                    {b.collectionType === 'home_collection' && b.address && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          Patient Doorstep Collection Address
                        </div>
                        <p className="text-xs text-slate-700">
                          {b.address.street}, {b.address.city}, {b.address.state} -{' '}
                          {b.address.pincode}
                        </p>
                      </div>
                    )}

                    {/* Status History Audit Trail */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Status History Audit Trail
                      </div>
                      <div className="space-y-2">
                        {b.statusHistory?.map((step, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                              <span className="font-bold text-slate-800">{step.status}</span>
                              <span className="text-slate-500">— {step.notes}</span>
                            </div>
                            <span className="text-slate-400">
                              {new Date(step.changedAt).toLocaleString('en-IN', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Status Transition Notes */}
      {updatingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Confirm Status Transition to '{targetStatus}'
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Advancing this booking updates the patient's live Journey Tracker and dispatches an automated notification.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Lab Staff / Phlebotomist Notes
              </label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="e.g. Barcode: TUBE-7729 accessioned at 10:15 AM..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-teal-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUpdatingId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                disabled={actionLoading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : `Confirm ${targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedBookings;

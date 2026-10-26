import React, { useState, useEffect } from 'react';
import { getComplaints, resolveComplaint } from '../../services/adminService';
import {
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  User,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const ComplaintsSupport = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingItem, setResolvingItem] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusVal, setStatusVal] = useState('Resolved');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await getComplaints();
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch {
      toast.error('Failed to load support grievances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolvingItem) return;
    try {
      const res = await resolveComplaint(resolvingItem._id, {
        resolutionNotes,
        status: statusVal,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setResolvingItem(null);
        setResolutionNotes('');
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resolution update failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Patient Support & Grievance Tickets
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review clinical discrepancies, billing disputes, and phlebotomy home collection feedback.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Loading grievances...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Zero Open Complaints!</p>
            <p className="text-xs text-slate-400 mt-1">
              All clinical tickets and inquiries have been resolved.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((item) => (
              <div key={item._id} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                      #{item.complaintId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-slate-900">{item.subject}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <User className="w-3.5 h-3.5" />
                    <span>
                      Reported by <strong className="text-slate-700">{item.user?.name}</strong> (
                      {item.user?.email})
                    </span>
                  </div>

                  {item.status !== 'Resolved' ? (
                    <button
                      onClick={() => {
                        setResolvingItem(item);
                        setResolutionNotes(item.resolutionNotes || '');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs self-start sm:self-auto"
                    >
                      Resolve Grievance
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-semibold italic">
                      Resolution: {item.resolutionNotes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Resolve Ticket #{resolvingItem.complaintId}
              </h3>
              <button
                onClick={() => setResolvingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Resolved">Resolved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Resolution Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain actions taken (e.g. contacted phlebotomist, recalculated invoice, reissued sample collection)..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingItem(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsSupport;

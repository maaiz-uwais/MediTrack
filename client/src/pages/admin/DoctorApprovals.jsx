import React, { useState, useEffect } from 'react';
import {
  getDoctorApprovals,
  approveDoctor,
  rejectDoctor,
} from '../../services/adminService';
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  FileCheck2,
  Clock,
  AlertCircle,
  CreditCard,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorApprovals = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingDoctor, setRejectingDoctor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await getDoctorApprovals();
      if (res.data.success) {
        setPendingDoctors(res.data.pendingDoctors || []);
        setApprovedDoctors(res.data.approvedDoctors || []);
      }
    } catch {
      toast.error('Failed to load doctor applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (docId, docName) => {
    try {
      const res = await approveDoctor(docId);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchApprovals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval action failed.');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingDoctor) return;
    try {
      const res = await rejectDoctor(rejectingDoctor._id, rejectReason);
      if (res.data.success) {
        toast.success(res.data.message);
        setRejectingDoctor(null);
        setRejectReason('');
        fetchApprovals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Doctor Licensure & Credential Verification
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review medical council licenses, clinical experience, and approve doctor practitioner accounts.
        </p>
      </div>

      {/* Pending Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              {pendingDoctors.length > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <h3 className="text-base font-bold text-slate-800">
              Pending Applications ({pendingDoctors.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Doctors cannot log in or accept appointments until verified
          </span>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Validating doctor records...</p>
          </div>
        ) : pendingDoctors.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">All Doctor Applications Processed!</p>
            <p className="text-xs text-slate-400 mt-1">
              There are currently no physician accounts waiting in the approval queue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDoctors.map(({ user: doc, profile }) => (
              <div
                key={doc._id}
                className="bg-white rounded-3xl border border-amber-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-base shadow-md">
                        {doc.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{doc.name}</h4>
                        <p className="text-xs text-indigo-600 font-semibold">
                          {profile?.specialization || 'General Physician'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                      Pending
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Medical License
                      </span>
                      <p className="font-mono font-bold text-slate-800 mt-0.5">
                        {profile?.licenseNumber || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Experience
                      </span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {profile?.experience || 1} Years
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Consultation Fee
                      </span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        ₹{profile?.fee || 500}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Qualifications
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5 truncate">
                        {Array.isArray(profile?.qualifications)
                          ? profile.qualifications.join(', ')
                          : profile?.qualifications || 'MBBS'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-700">Contact & Application Info:</p>
                    <p className="text-[11px] mt-0.5">Email: {doc.email} • Phone: {doc.phone}</p>
                    {profile?.bio && (
                      <p className="text-[11px] mt-1 text-slate-600 italic line-clamp-2">
                        "{profile.bio}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(doc._id, doc.name)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Activate
                  </button>
                  <button
                    onClick={() => setRejectingDoctor(doc)}
                    className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Doctors Directory */}
      <div className="pt-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Active Verified Doctors ({approvedDoctors.length})
        </h3>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Doctor</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">License Reg #</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Fee</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {approvedDoctors.map(({ user: doc, profile }) => (
                  <tr key={doc._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {doc.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{doc.name}</p>
                          <p className="text-slate-400 text-[11px]">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {profile?.specialization || 'General Physician'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600 text-[11px]">
                      {profile?.licenseNumber || 'Active'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{profile?.experience || 5} Years</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">₹{profile?.fee || 500}</td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Verified Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Reject Dr. {rejectingDoctor.name}'s Application
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Specify the reason for credential rejection. This application will be removed from the registry.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Invalid medical registration number or unverified qualification documents."
              className="mt-3 w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setRejectingDoctor(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorApprovals;

import React, { useState, useEffect } from 'react';
import { submitDoctorReview, createComplaintTicket } from '../../services/feedbackService';
import { getMyAppointments } from '../../services/appointmentService';
import api from '../../services/api';
import {
  Star,
  LifeBuoy,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  User,
  Calendar,
  FileQuestion,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SupportReviews = () => {
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'complaints'
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // Review Form state
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Complaint Form state
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('Report Delay');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintReferenceId, setComplaintReferenceId] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Patient's past complaints
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchMyComplaints();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoadingAppts(true);
      const res = await getMyAppointments();
      const appts = res.data.appointments || [];
      setAppointments(appts);
      // Preselect first appointment with doctor if any
      const completed = appts.find((a) => a.status === 'Completed' || a.status === 'Confirmed');
      if (completed) {
        setSelectedDoctorId(completed.doctor?._id || '');
        setSelectedAppointmentId(completed._id || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppts(false);
    }
  };

  const fetchMyComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const res = await api.get('/feedback/complaints/my');
      setMyComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      toast.error('Please select a doctor to review');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a brief feedback comment');
      return;
    }

    try {
      setSubmittingReview(true);
      await submitDoctorReview({
        doctorId: selectedDoctorId,
        appointmentId: selectedAppointmentId || undefined,
        rating,
        comment: reviewComment,
      });
      toast.success('Thank you! Your doctor review has been published.');
      setReviewComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDescription.trim()) {
      toast.error('Please complete subject and description');
      return;
    }

    try {
      setSubmittingComplaint(true);
      await createComplaintTicket({
        subject: complaintSubject,
        category: complaintCategory,
        description: complaintDescription,
        referenceId: complaintReferenceId || undefined,
      });
      toast.success('Support ticket created. Our medical operations desk will follow up.');
      setComplaintSubject('');
      setComplaintDescription('');
      setComplaintReferenceId('');
      fetchMyComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit support ticket');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3 text-teal-100">
            <LifeBuoy className="w-3.5 h-3.5 text-teal-300" />
            Patient Experience & Care
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Reviews & Support Center
          </h1>
          <p className="text-teal-100/90 text-sm mt-1 max-w-xl">
            Rate your doctor consultations and submit clinical service or billing inquiries directly to MediTrack support desk.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Doctor Reviews & Ratings</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('complaints')}
          className={`pb-4 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'complaints'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Support & Complaints Tickets</span>
          {myComplaints.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-semibold">
              {myComplaints.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Doctor Reviews */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Share Your Consultation Feedback</h2>
            <p className="text-xs text-slate-500 mb-6">
              Your candid review helps fellow patients choose the best specialists and helps doctors improve care quality.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              {/* Doctor Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Doctor Consulted
                </label>
                {appointments.length > 0 ? (
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => {
                      setSelectedDoctorId(e.target.value);
                      const matching = appointments.find((a) => a.doctor?._id === e.target.value);
                      if (matching) setSelectedAppointmentId(matching._id);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-teal-500"
                    required
                  >
                    <option value="">-- Choose Doctor from Recent Appointments --</option>
                    {appointments.map((a) => (
                      <option key={a._id} value={a.doctor?._id}>
                        {a.doctor?.name} ({a.doctor?.doctorProfile?.specialization || 'Specialist'}) —{' '}
                        {new Date(a.date).toLocaleDateString('en-IN')}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    You have no previous appointments recorded yet. Once you complete a doctor consultation, you can leave a review.
                  </p>
                )}
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-slate-700 ml-2">
                    {rating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Detailed Experience & Recommendations
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe doctor punctuality, bedside manner, clarity of prescription advice..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-teal-500 focus:bg-white resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview || !selectedDoctorId}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {submittingReview ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Doctor Review
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Guide Card */}
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Review Guidelines
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  Focus on clinical communication and care experience.
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  Avoid disclosing personal medical history or sensitive data.
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  All reviews are verified against confirmed consultation slots.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Complaints & Support */}
      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* New Ticket Form */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Open a Support Ticket</h2>
              <p className="text-xs text-slate-500 mb-6">
                Encountered an issue with sample collection, billing, or delayed report delivery? Let us know.
              </p>

              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Category
                    </label>
                    <select
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-teal-500"
                    >
                      <option value="Report Delay">Report Delivery Delay</option>
                      <option value="Phlebotomist Issue">Phlebotomist / Home Collection</option>
                      <option value="Payment Issue">Payment & Billing Inquiry</option>
                      <option value="Doctor Consultation">Doctor Consultation Quality</option>
                      <option value="General Support">General Platform Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Booking / Reference ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MT-TEST-2026-4503"
                      value={complaintReferenceId}
                      onChange={(e) => setComplaintReferenceId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of your issue"
                    value={complaintSubject}
                    onChange={(e) => setComplaintSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    placeholder="Provide specific details regarding date, location, or phlebotomist..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-teal-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {submittingComplaint ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      Submit Support Ticket
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* List of Previous Tickets */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-4">Your Recent Support Tickets</h3>
              {loadingComplaints ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading tickets...</div>
              ) : myComplaints.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No active support tickets found. Everything is running smoothly!
                </p>
              ) : (
                <div className="space-y-3">
                  {myComplaints.map((c) => (
                    <div
                      key={c._id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{c.subject}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                        {c.adminNotes && (
                          <div className="mt-2 text-xs bg-white p-2 rounded border border-slate-200 text-teal-800">
                            <strong>Support Desk Response:</strong> {c.adminNotes}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 shrink-0">
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Help Info Card */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 to-teal-50 rounded-2xl border border-indigo-100 p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-indigo-600" />
                MediTrack Clinical Operations
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Our support team and lab supervisors actively resolve patient tickets within 2-4 hours during clinic operating hours.
              </p>
              <div className="text-xs space-y-2 border-t border-indigo-200/50 pt-3">
                <div className="text-slate-500">
                  Emergency Helpline: <span className="font-bold text-slate-700">+91 1800-MEDITRACK</span>
                </div>
                <div className="text-slate-500">
                  Email Desk: <span className="font-bold text-slate-700">support@meditrack.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportReviews;

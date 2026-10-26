import React, { useState, useEffect } from 'react';
import {
  getDoctorsDirectory,
  getDoctorAvailability,
  createAppointment,
  getMyAppointments,
  cancelAppointment,
} from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Calendar,
  Clock,
  Search,
  Star,
  CheckCircle2,
  XCircle,
  Video,
  User,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = [
  'All',
  'Cardiologist',
  'Neurologist',
  'Dermatologist',
  'General Physician',
  'Pediatrician',
  'Orthopedic Surgeon',
  'Gynecologist',
  'Endocrinologist',
];

const BookAppointment = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my_appointments'
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState('In-Person');
  const [symptoms, setSymptoms] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [doctorScheduleMessage, setDoctorScheduleMessage] = useState('');

  // Fetch doctors and patient appointments
  const fetchData = async () => {
    try {
      setLoading(true);
      const [docRes, aptRes] = await Promise.all([
        getDoctorsDirectory({ specialization: selectedSpecialization, search }),
        getMyAppointments(),
      ]);
      if (docRes.data.success) setDoctors(docRes.data.doctors || []);
      if (aptRes.data.success) setMyAppointments(aptRes.data.appointments || []);
    } catch {
      toast.error('Failed to load doctor directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSpecialization]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    getDoctorsDirectory({ specialization: selectedSpecialization, search }).then((res) => {
      if (res.data.success) setDoctors(res.data.doctors || []);
    });
  };

  // Open booking modal for a doctor
  const handleOpenBookModal = (doc) => {
    setSelectedDoctor(doc);
    setSelectedSlot('');
    setSymptoms('');
    setAppointmentModalOpen(true);
    fetchDoctorSlots(doc._id, appointmentDate);
  };

  // Fetch slots for selected date
  const fetchDoctorSlots = async (doctorId, date) => {
    try {
      setSlotsLoading(true);
      setSelectedSlot('');
      setDoctorScheduleMessage('');
      const res = await getDoctorAvailability(doctorId, date);
      if (res.data.success) {
        if (!res.data.isAvailable) {
          setDoctorScheduleMessage(res.data.message);
          setAvailableSlots([]);
        } else {
          setAvailableSlots(res.data.slots || []);
        }
      }
    } catch {
      toast.error('Could not check doctor availability.');
    } finally {
      setSlotsLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setAppointmentDate(newDate);
    if (selectedDoctor) {
      fetchDoctorSlots(selectedDoctor._id, newDate);
    }
  };

  // Submit appointment creation
  const handleConfirmAppointment = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error('Please select an available consultation time slot.');
      return;
    }
    setBookingSubmitting(true);
    try {
      const payload = {
        doctorId: selectedDoctor._id,
        date: appointmentDate,
        slot: selectedSlot,
        consultationType,
        symptoms,
      };

      const res = await createAppointment(payload);
      if (res.data.success) {
        toast.success('Consultation appointment booked successfully!');
        setAppointmentModalOpen(false);
        fetchData();
        setActiveTab('my_appointments');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Appointment scheduling failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this consultation?')) return;
    try {
      const res = await cancelAppointment(aptId);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-indigo-200 mb-3">
              <Stethoscope className="w-3.5 h-3.5" /> Clinical Specialist Consultations
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Schedule Doctor Consultations
            </h1>
            <p className="mt-1 text-sm text-indigo-200/90 max-w-xl">
              Connect with top board-certified physicians, view verified schedules with zero double-booking, and receive digital prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'browse'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Doctor Directory
            </button>
            <button
              onClick={() => setActiveTab('my_appointments')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'my_appointments'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              My Consultations ({myAppointments.length})
            </button>
          </div>
        </div>
      </div>

      {/* ===================== BROWSE DIRECTORY TAB ===================== */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSpecialization === spec
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search doctor by name..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Find
              </button>
            </form>
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 mt-2 font-semibold">Finding medical specialists...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No doctors found</p>
              <p className="text-xs text-slate-400 mt-1">Try another specialization filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => {
                const profile = doc.profile || {};
                return (
                  <div
                    key={doc._id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-base shadow-md">
                            {doc.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                            <p className="text-xs text-indigo-600 font-semibold">
                              {profile.specialization || 'General Physician'}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {profile.ratingsAverage || 4.9}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            Experience
                          </span>
                          <p className="font-bold text-slate-800">{profile.experience || 5} Years</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            Consultation Fee
                          </span>
                          <p className="font-extrabold text-slate-900">₹{profile.fee || 500}</p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {profile.bio ||
                          'Experienced clinical physician dedicated to evidence-based patient diagnosis and compassionate care.'}
                      </p>

                      <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>License Reg: {profile.licenseNumber || 'Verified'}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Slots Available
                      </span>

                      <button
                        onClick={() => handleOpenBookModal(doc)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book Visit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== MY APPOINTMENTS TAB ===================== */}
      {activeTab === 'my_appointments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {myAppointments.length === 0 ? (
              <div className="py-16 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No appointments scheduled</p>
                <p className="text-xs text-slate-400 mt-1">Browse doctors and book your first consult.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
                        {apt.doctor?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{apt.doctor?.name}</h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                            {apt.doctorProfile?.specialization || 'Consultant'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              apt.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.status === 'Completed'
                                ? 'bg-slate-100 text-slate-700'
                                : apt.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(apt.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {apt.slot}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            {apt.consultationType === 'Video' ? (
                              <Video className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-teal-600" />
                            )}
                            {apt.consultationType}
                          </span>
                        </p>

                        {apt.symptoms && (
                          <p className="text-xs text-slate-600 mt-1 italic">
                            Symptoms: "{apt.symptoms}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Consultation Fee</span>
                        <span className="text-sm font-bold text-slate-900">₹{apt.fee}</span>
                      </div>

                      {['Scheduled', 'Confirmed'].includes(apt.status) && (
                        <button
                          onClick={() => handleCancelAppointment(apt._id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== APPOINTMENT BOOKING MODAL ===================== */}
      {appointmentModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Book Doctor Appointment</h3>
                <p className="text-xs text-indigo-600 font-semibold">
                  {selectedDoctor.name} • {selectedDoctor.profile?.specialization}
                </p>
              </div>
              <button
                onClick={() => setAppointmentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAppointment} className="space-y-4 mt-4">
              {/* Consultation Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Consultation Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationType('In-Person')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      consultationType === 'In-Person'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs">In-Person Clinic Visit</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('Video')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      consultationType === 'Video'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs">Telehealth Video Call</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Consultation Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Choose Consultation Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Real-time Time Slots Selection with Double-booking Guard */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Available Time Slots (Strict Anti-Double-Booking Guard)
                </label>

                {slotsLoading ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[11px] text-slate-400 mt-1">Verifying physician schedule...</p>
                  </div>
                ) : doctorScheduleMessage ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{doctorScheduleMessage}</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl text-center">
                    No open slots found for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map(({ slot, isAvailable }) => (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          !isAvailable
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : selectedSlot === slot
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {slot}
                        {!isAvailable && (
                          <span className="block text-[9px] uppercase font-bold text-rose-500">
                            Booked
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Symptoms / Chief Complaint */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Symptoms & Clinical Concerns (Optional)
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild headache, chest tightness, fever for 2 days..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Fee notice */}
              <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-600">Consultation Fee:</span>
                <span className="font-extrabold text-indigo-900 text-sm">
                  ₹{selectedDoctor.profile?.fee || 500}
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAppointmentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting || !selectedSlot}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;

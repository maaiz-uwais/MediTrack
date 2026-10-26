import React, { useState, useEffect } from 'react';
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  issuePrescription,
} from '../../services/doctorService';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  FileText,
  Pill,
  Plus,
  Trash2,
  Activity,
  AlertCircle,
  Stethoscope,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Prescription Modal State
  const [prescribingApt, setPrescribingApt] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80',
    heartRate: '72',
    weight: '68',
    temperature: '98.6',
  });
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After meals' },
  ]);
  const [recommendedTests, setRecommendedTests] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [issuingRx, setIssuingRx] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getDoctorAppointments({
        status: statusFilter,
      });
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, notes) => {
    try {
      await updateAppointmentStatus(id, { status, notes });
      toast.success(`Appointment marked as '${status}'!`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handleOpenPrescriptionModal = (apt) => {
    setPrescribingApt(apt);
    setDiagnosis('');
    setMedicines([
      { name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After meals' },
    ]);
    setRecommendedTests('');
    setAdvice('Adequate hydration and 7-8 hours restful sleep. Return if symptoms persist.');
    // Default follow up in 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFollowUpDate(nextWeek.toISOString().split('T')[0]);
  };

  const handleAddMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      { name: '', dosage: '', frequency: '1-0-1', duration: '5 days', instructions: 'After meals' },
    ]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length === 1) return;
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error('Please enter a clinical diagnosis');
      return;
    }
    const validMedicines = medicines.filter((m) => m.name.trim() !== '');
    if (validMedicines.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    try {
      setIssuingRx(true);
      const testsArray = recommendedTests
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await issuePrescription({
        appointmentId: prescribingApt._id,
        diagnosis,
        vitals,
        medicines: validMedicines,
        recommendedTests: testsArray,
        advice,
        followUpDate: followUpDate || null,
      });

      toast.success('Digital prescription issued and consultation completed!');
      setPrescribingApt(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue prescription');
    } finally {
      setIssuingRx(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const term = searchTerm.toLowerCase();
    const idMatch = a.appointmentId?.toLowerCase().includes(term);
    const nameMatch = a.patient?.name?.toLowerCase().includes(term);
    const phoneMatch = a.patient?.phone?.includes(term);
    const reasonMatch = a.reason?.toLowerCase().includes(term);
    return idMatch || nameMatch || phoneMatch || reasonMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3 text-indigo-200">
            <Stethoscope className="w-3.5 h-3.5" />
            Clinical Consultations
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Doctor Appointments & Prescriptions
          </h1>
          <p className="text-indigo-100/90 text-sm mt-1 max-w-xl">
            Confirm patient appointments, perform clinical evaluations, and issue digital prescriptions with integrated test orders.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Patient, Phone, or Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['all', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab === 'all' ? 'All Consultations' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Consultations List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Loading Appointments...
          </p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Appointments Found</h3>
          <p className="text-sm text-slate-500 mt-2">
            No patient appointments match the selected status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const dateStr = new Date(apt.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={apt._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {apt.appointmentId || apt._id.substring(0, 8)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mt-1">
                      {apt.patient?.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {apt.patient?.phone || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-indigo-700">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {dateStr} • {apt.slot}
                      </span>
                      {apt.patientProfile?.bloodGroup && (
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">
                          Blood: {apt.patientProfile.bloodGroup}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 max-w-xl">
                      <strong className="text-slate-700">Chief Complaint:</strong>{' '}
                      {apt.reason || 'General physician checkup and assessment.'}
                    </div>
                  </div>
                </div>

                {/* Actions Right */}
                <div className="flex flex-wrap items-center gap-2.5 lg:self-center">
                  {apt.status === 'Scheduled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(apt._id, 'Confirmed')}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirm Slot
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(apt._id, 'Cancelled', 'Slot rescheduled/declined by doctor')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </>
                  )}

                  {apt.status === 'Confirmed' && (
                    <button
                      type="button"
                      onClick={() => handleOpenPrescriptionModal(apt)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Pill className="w-4 h-4" />
                      Issue Digital Prescription
                    </button>
                  )}

                  {apt.status === 'Completed' && (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Consultation Completed
                    </span>
                  )}

                  <Link
                    to={`/doctor/patients?patientId=${apt.patient?._id}`}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Patient Dossier
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Issue Digital Prescription */}
      {prescribingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Issue Digital Prescription (Rx)
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{prescribingApt.patient?.name}</strong> • Slot: {prescribingApt.slot}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPrescribingApt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePrescriptionSubmit} className="mt-5 space-y-5">
              {/* Clinical Diagnosis */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acute upper respiratory infection, Stage 1 Hypertension..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-indigo-500"
                  required
                />
              </div>

              {/* Recorded Vitals */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Clinical Vitals
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500">Blood Pressure</span>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Heart Rate (bpm)</span>
                    <input
                      type="text"
                      placeholder="72"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Weight (kg)</span>
                    <input
                      type="text"
                      placeholder="68"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Temp (°F)</span>
                    <input
                      type="text"
                      placeholder="98.6"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Medicines List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Prescribed Medications (Rx) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-2.5">
                  {medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 items-center"
                    >
                      <div className="col-span-12 sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Medicine Name (e.g. Paracetamol)"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          required
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Dosage (500mg)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Freq (1-0-1)"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Instructions (After meals)"
                          value={med.instructions}
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Lab Tests */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Recommended Diagnostic Tests (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC), Lipid Profile, Fasting Blood Sugar"
                  value={recommendedTests}
                  onChange={(e) => setRecommendedTests(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-indigo-500"
                />
              </div>

              {/* Advice & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Physician Advice & Lifestyle Notes
                  </label>
                  <textarea
                    rows={2}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPrescribingApt(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuingRx}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {issuingRx ? 'Delivering Prescription...' : 'Issue Prescription & Complete Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;

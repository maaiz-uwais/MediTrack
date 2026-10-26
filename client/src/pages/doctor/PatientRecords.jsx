import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  getDoctorAppointments,
  getDoctorPatientRecord,
} from '../../services/doctorService';
import {
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Activity,
  AlertTriangle,
  Download,
  ShieldAlert,
  Search,
  Pill,
  Clock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PatientRecords = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';

  const [consultingPatients, setConsultingPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);
  const [patientData, setPatientData] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [privacyError, setPrivacyError] = useState(null);

  useEffect(() => {
    fetchConsultingPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientRecord(selectedPatientId);
    }
  }, [selectedPatientId]);

  const fetchConsultingPatients = async () => {
    try {
      setLoadingPatients(true);
      const res = await getDoctorAppointments({ status: 'all' });
      const appts = res.data.appointments || [];

      // Extract unique patients
      const patientMap = new Map();
      appts.forEach((a) => {
        if (a.patient && !patientMap.has(a.patient._id)) {
          patientMap.set(a.patient._id, {
            ...a.patient,
            lastVisit: a.date,
          });
        }
      });
      const unique = Array.from(patientMap.values());
      setConsultingPatients(unique);

      if (!selectedPatientId && unique.length > 0) {
        setSelectedPatientId(unique[0]._id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patient records');
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchPatientRecord = async (id) => {
    try {
      setLoadingRecord(true);
      setPrivacyError(null);
      const res = await getDoctorPatientRecord(id);
      setPatientData(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setPrivacyError(
          err.response?.data?.message ||
            'Privacy Guard: You may only access clinical records for patients holding an appointment with you.'
        );
      } else {
        toast.error('Failed to fetch patient records');
      }
      setPatientData(null);
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
    setSearchParams({ patientId: id });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3 text-indigo-200">
          <Activity className="w-3.5 h-3.5" />
          HIPAA & Clinical Confidentiality
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Patient Medical Dossiers & Lab Results
        </h1>
        <p className="text-indigo-100/90 text-sm mt-1 max-w-xl">
          Inspect past digital prescriptions, vital trends, and laboratory pathology reports for your consulting patients.
        </p>
      </div>

      {/* Main Grid: Left Patient Selector & Right Records */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Consulting Patients ({consultingPatients.length})
            </h3>

            {loadingPatients ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading directory...</div>
            ) : consultingPatients.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No patient consultations found yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {consultingPatients.map((p) => {
                  const isSelected = selectedPatientId === p._id;
                  return (
                    <div
                      key={p._id}
                      onClick={() => handleSelectPatient(p._id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.phone}</div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dossier Details */}
        <div className="lg:col-span-8 space-y-6">
          {privacyError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
              <h3 className="text-base font-bold text-rose-900">Medical Privacy Guard Active</h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">{privacyError}</p>
            </div>
          ) : loadingRecord ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Loading Medical Dossier...
              </p>
            </div>
          ) : !patientData ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              Select a patient from the left column to view their medical records.
            </div>
          ) : (
            <>
              {/* Demographics Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-black">
                      {patientData.patient?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {patientData.patient?.name}
                      </h2>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                        <span>{patientData.patient?.email}</span>
                        <span>•</span>
                        <span>{patientData.patient?.phone}</span>
                      </div>
                    </div>
                  </div>

                  {patientData.profile?.bloodGroup && (
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-semibold uppercase">Blood Group</div>
                      <span className="text-lg font-black text-rose-600">
                        {patientData.profile.bloodGroup}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-slate-400">Gender:</span>{' '}
                    <span className="font-semibold text-slate-700 capitalize">
                      {patientData.profile?.gender || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">DOB:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {patientData.profile?.dob
                        ? new Date(patientData.profile.dob).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Allergies:</span>{' '}
                    <span className="font-semibold text-rose-600">
                      {patientData.profile?.allergies?.join(', ') || 'None noted'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Emergency:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {patientData.profile?.emergencyContact?.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lab Reports Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Diagnostic Laboratory Reports ({patientData.reports?.length || 0})
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Official clinical test results uploaded and verified by laboratory staff
                </p>

                {patientData.reports?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">No laboratory reports uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {patientData.reports.map((r) => {
                      const fullUrl = r.fileUrl?.startsWith('http')
                        ? r.fileUrl
                        : `http://localhost:5000${r.fileUrl}`;

                      return (
                        <div
                          key={r._id}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-800">
                                {r.reportId}
                              </span>
                              {r.criticalFlag && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Critical Marker
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              <strong>Summary:</strong> {r.summary}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Uploaded on {new Date(r.uploadedAt).toLocaleDateString('en-IN')}
                            </div>
                          </div>

                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-center transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View PDF
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Prescriptions Issued by this Doctor */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  Prescriptions Issued ({patientData.prescriptions?.length || 0})
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Past treatment plans and medications prescribed to this patient
                </p>

                {patientData.prescriptions?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">
                    You haven't issued any prescriptions to this patient yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {patientData.prescriptions.map((rx) => (
                      <div
                        key={rx._id}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">Diagnosis:</span>{' '}
                            <span className="font-semibold text-indigo-700">{rx.diagnosis}</span>
                          </div>
                          <span className="text-slate-400">
                            {new Date(rx.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        {/* Medicines summary */}
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                          {rx.medicines?.map((m, i) => (
                            <div key={i} className="flex justify-between text-slate-700">
                              <span className="font-semibold">
                                {m.name} ({m.dosage})
                              </span>
                              <span className="text-slate-500">
                                {m.frequency} • {m.duration}
                              </span>
                            </div>
                          ))}
                        </div>

                        {rx.advice && (
                          <div className="text-xs text-slate-600">
                            <strong>Advice:</strong> {rx.advice}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;

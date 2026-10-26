import React, { useState, useEffect } from 'react';
import { getMyPrescriptions } from '../../services/feedbackService';
import {
  FileText,
  User,
  Calendar,
  Pill,
  Activity,
  AlertCircle,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Clock,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await getMyPrescriptions();
      setPrescriptions(res.data.prescriptions || []);
      if (res.data.prescriptions?.length > 0) {
        setExpandedId(res.data.prescriptions[0]._id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handlePrint = (item) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print prescription');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - MediTrack</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #0d9488; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
            .doctor-info { text-align: right; }
            .badge { display: inline-block; padding: 4px 10px; background: #ccfbf1; color: #0f766e; border-radius: 9999px; font-size: 12px; font-weight: 600; }
            .section { margin-top: 24px; }
            .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.05em; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; padding: 10px; background: #f8fafc; border-bottom: 1px solid #cbd5e1; font-size: 12px; color: #475569; }
            td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
            .sig-line { border-top: 1px solid #94a3b8; width: 200px; text-align: center; padding-top: 6px; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">MediTrack Healthcare</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Digital Clinical Prescription</div>
              <div style="font-size: 13px; font-weight: 600; margin-top: 12px;">Rx ID: ${item._id}</div>
              <div style="font-size: 13px; color: #475569;">Date: ${new Date(item.createdAt || item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            <div class="doctor-info">
              <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${item.doctor?.name || 'Dr. Specialist'}</div>
              <div style="font-size: 13px; color: #0d9488; font-weight: 600;">${item.doctor?.doctorProfile?.specialization || 'Medical Consultant'}</div>
              <div style="font-size: 12px; color: #64748b;">Reg No: ${item.doctor?.doctorProfile?.licenseNumber || 'MED-REG-IND'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Clinical Diagnosis</div>
            <div style="font-size: 15px; font-weight: 600; color: #1e293b; background: #f0fdfa; padding: 12px 16px; border-left: 4px solid #0d9488; border-radius: 4px;">
              ${item.diagnosis || 'Clinical evaluation completed'}
            </div>
          </div>

          ${
            item.vitals && Object.keys(item.vitals).length > 0
              ? `
            <div class="section">
              <div class="section-title">Recorded Vitals</div>
              <div style="display: flex; gap: 20px; font-size: 13px;">
                ${item.vitals.bloodPressure ? `<div><strong>BP:</strong> ${item.vitals.bloodPressure}</div>` : ''}
                ${item.vitals.heartRate ? `<div><strong>Heart Rate:</strong> ${item.vitals.heartRate} bpm</div>` : ''}
                ${item.vitals.weight ? `<div><strong>Weight:</strong> ${item.vitals.weight} kg</div>` : ''}
                ${item.vitals.temperature ? `<div><strong>Temp:</strong> ${item.vitals.temperature} °F</div>` : ''}
              </div>
            </div>
          `
              : ''
          }

          <div class="section">
            <div class="section-title">Prescribed Medications (Rx)</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine Name</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${
                  item.medicines?.map((med, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td><strong>${med.name}</strong></td>
                      <td>${med.dosage || '-'}</td>
                      <td>${med.frequency || '-'}</td>
                      <td>${med.duration || '-'}</td>
                      <td>${med.instructions || 'As advised'}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="6">No medications listed</td></tr>'
                }
              </tbody>
            </table>
          </div>

          ${
            item.recommendedTests && item.recommendedTests.length > 0
              ? `
            <div class="section">
              <div class="section-title">Recommended Diagnostic Tests</div>
              <ul style="padding-left: 20px; font-size: 14px; color: #0f766e;">
                ${item.recommendedTests.map((t) => `<li><strong>${t}</strong></li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }

          ${
            item.advice
              ? `
            <div class="section">
              <div class="section-title">Physician Advice & Lifestyle Notes</div>
              <p style="font-size: 14px; color: #475569; line-height: 1.5;">${item.advice}</p>
            </div>
          `
              : ''
          }

          <div class="footer">
            <div style="font-size: 11px; color: #94a3b8;">
              Electronically generated by MediTrack Telehealth Systems.<br />
              Authorized clinical prescription under Telemedicine Practice Guidelines.
            </div>
            <div class="sig-line">
              Doctor's Signature / Seal<br />
              <strong>${item.doctor?.name || 'Authorized Medical Officer'}</strong>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3 text-teal-100">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Digital Health Records
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Doctor Prescriptions
          </h1>
          <p className="text-teal-100/90 text-sm mt-1 max-w-xl">
            Access, print, and securely review digital prescriptions, dosages, and physician lab test recommendations.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-center">
            <div className="text-2xl font-bold">{prescriptions.length}</div>
            <div className="text-xs text-teal-200">Prescriptions</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Loading Prescriptions...
          </p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Prescriptions Yet</h3>
          <p className="text-sm text-slate-500 mt-2">
            When your consulting doctors issue digital prescriptions after consultations, they will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => {
            const isExpanded = expandedId === rx._id;
            const rxDate = new Date(rx.createdAt || rx.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={rx._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(rx._id)}
                  className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-800">
                          {rx.doctor?.name || 'Dr. Specialist'}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                          {rx.doctor?.doctorProfile?.specialization || 'Medical Consultant'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {rxDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5 text-slate-400" />
                          {rx.medicines?.length || 0} Medicines
                        </span>
                        {rx.recommendedTests?.length > 0 && (
                          <span className="flex items-center gap-1 text-indigo-600 font-medium">
                            <Activity className="w-3.5 h-3.5" />
                            {rx.recommendedTests.length} Tests Advised
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(rx);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Print Rx</span>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-6 md:p-8 bg-gradient-to-b from-slate-50/50 to-white space-y-6">
                    {/* Diagnosis & Vitals */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200/80">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Diagnosis
                        </div>
                        <div className="text-sm font-semibold text-slate-800">
                          {rx.diagnosis || 'Clinical assessment completed.'}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Vitals
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">BP:</span>{' '}
                            <span className="font-semibold text-slate-700">
                              {rx.vitals?.bloodPressure || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Pulse:</span>{' '}
                            <span className="font-semibold text-slate-700">
                              {rx.vitals?.heartRate ? `${rx.vitals.heartRate} bpm` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Weight:</span>{' '}
                            <span className="font-semibold text-slate-700">
                              {rx.vitals?.weight ? `${rx.vitals.weight} kg` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Temp:</span>{' '}
                            <span className="font-semibold text-slate-700">
                              {rx.vitals?.temperature ? `${rx.vitals.temperature} °F` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Medicines Table */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-600" />
                        Prescribed Medicines
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4">Medicine Name</th>
                              <th className="py-3 px-4">Dosage</th>
                              <th className="py-3 px-4">Frequency</th>
                              <th className="py-3 px-4">Duration</th>
                              <th className="py-3 px-4">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rx.medicines?.map((med, i) => (
                              <tr key={i} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-bold text-slate-800">
                                  {med.name}
                                </td>
                                <td className="py-3 px-4 text-slate-600 font-medium">
                                  {med.dosage || '-'}
                                </td>
                                <td className="py-3 px-4 text-teal-700 font-semibold">
                                  {med.frequency || '-'}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {med.duration || '-'}
                                </td>
                                <td className="py-3 px-4 text-slate-500 italic">
                                  {med.instructions || 'As advised'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recommended Tests */}
                    {rx.recommendedTests?.length > 0 && (
                      <div className="bg-teal-50/70 border border-teal-200/70 rounded-xl p-4">
                        <div className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-teal-600" />
                          Recommended Diagnostic Tests
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rx.recommendedTests.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-white border border-teal-200 text-teal-800 rounded-lg text-xs font-medium shadow-xs"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Advice & Notes */}
                    {rx.advice && (
                      <div className="bg-white rounded-xl border border-slate-200/80 p-4">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Doctor Advice & Instructions
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{rx.advice}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;

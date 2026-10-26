import React, { useState, useEffect } from 'react';
import { getHealthHistory } from '../../services/patientService';
import {
  Clock,
  FlaskConical,
  Stethoscope,
  Pill,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const HealthHistory = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getHealthHistory();
        if (res.data.success) {
          setTimeline(res.data.timeline || []);
        }
      } catch {
        toast.error('Failed to load health timeline.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'test_booking':
        return <FlaskConical className="w-4 h-4 text-teal-600" />;
      case 'doctor_visit':
        return <Stethoscope className="w-4 h-4 text-indigo-600" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-rose-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Unified Healthcare Journey Timeline
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          A single chronological record of diagnostic investigations, specialist consults, and clinical prescriptions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">
              Compiling medical timeline...
            </p>
          </div>
        ) : timeline.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No medical milestones logged yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Your test bookings and clinical visits will populate automatically here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-teal-100 space-y-8 my-4">
            {timeline.map((event, idx) => (
              <div key={idx} className="relative group">
                {/* Node icon circle */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-white border-2 border-teal-500 shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                  {getTypeIcon(event.type)}
                </div>

                {/* Event Card */}
                <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">{event.subtitle}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{event.details}</span>
                    <span className="px-2 py-0.5 rounded-md font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthHistory;

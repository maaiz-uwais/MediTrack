import React, { useState, useEffect } from 'react';
import { getDoctorStats, updateDoctorAvailability } from '../../services/doctorService';
import {
  Clock,
  Calendar,
  IndianRupee,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const AvailabilitySchedule = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [fee, setFee] = useState(500);
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getDoctorStats();
      const prof = res.data.profile || {};
      if (prof.availability) {
        if (prof.availability.workingDays?.length > 0) {
          setWorkingDays(prof.availability.workingDays);
        }
        if (prof.availability.startTime) setStartTime(prof.availability.startTime);
        if (prof.availability.endTime) setEndTime(prof.availability.endTime);
        if (prof.availability.slotDuration) setSlotDuration(prof.availability.slotDuration);
      }
      if (prof.fee !== undefined) setFee(prof.fee);
      if (prof.bio) setBio(prof.bio);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile availability');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (workingDays.length === 0) {
      toast.error('Please select at least one active working day');
      return;
    }
    if (Number(fee) < 0) {
      toast.error('Consultation fee cannot be negative');
      return;
    }

    try {
      setSaving(true);
      await updateDoctorAvailability({
        availability: {
          workingDays,
          startTime,
          endTime,
          slotDuration: Number(slotDuration),
        },
        fee: Number(fee),
        bio,
      });
      toast.success('Weekly availability schedule and consultation fee updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3 text-indigo-200">
          <Clock className="w-3.5 h-3.5" />
          Clinical Practice Calendar
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Consultation Availability & Schedule
        </h1>
        <p className="text-indigo-100/90 text-sm mt-1 max-w-xl">
          Define your clinic operating hours, consultation slot intervals, and professional consultation fee for patient bookings.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Loading Schedule...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs space-y-6">
            {/* Working Days */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Active Consulting Days
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Select the days of the week when you are available for patient appointments.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {ALL_DAYS.map((day) => {
                  const isActive = workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours & Slot Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Shift Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Shift End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Slot Interval
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-indigo-500"
                >
                  <option value={15}>15 Minutes (Brief)</option>
                  <option value={20}>20 Minutes (Standard)</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={45}>45 Minutes (Extended)</option>
                  <option value={60}>60 Minutes (Comprehensive)</option>
                </select>
              </div>
            </div>

            {/* Consultation Fee */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Consultation Fee (₹ INR)
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-indigo-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Patients will be billed this fee per appointment via Razorpay checkout.
              </p>
            </div>

            {/* Professional Bio */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Clinical Bio & Credentials Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly state your medical training, board certifications, and areas of expertise..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-indigo-500 resize-none"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Schedule...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Availability Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AvailabilitySchedule;

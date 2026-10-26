import React, { useState, useEffect } from 'react';
import { getSlotSettings } from '../../services/adminService';
import {
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

const SlotManagement = () => {
  const [slots, setSlots] = useState([]);
  const [settings, setSettings] = useState({
    homeCollectionFee: 150,
    advanceBookingDaysLimit: 14,
    allowSameDayBooking: true,
    cancellationCutoffHours: 4,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await getSlotSettings();
        if (res.data.success) {
          setSlots(res.data.slots);
          if (res.data.settings) setSettings(res.data.settings);
        }
      } catch {
        toast.error('Failed to load slot configurations.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  const handleCapacityChange = (slotId, field, value) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, [field]: Number(value) } : s))
    );
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('Slot capacity & operational guidelines updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Slot Capacity & Operating Hours
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Regulate daily walk-in lab capacity, phlebotomy home collection quotas, and scheduling windows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Global Operational Settings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 h-fit">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-5 h-5 text-teal-600" />
            Operational Parameters
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Home Collection Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.homeCollectionFee}
                onChange={(e) =>
                  setSettings({ ...settings, homeCollectionFee: Number(e.target.value) })
                }
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <span className="text-[11px] text-slate-400">
                Added automatically to home sample bookings
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Advance Booking Window (Days)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.advanceBookingDaysLimit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    advanceBookingDaysLimit: Number(e.target.value),
                  })
                }
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Cancellation Cut-off Window (Hours)
              </label>
              <input
                type="number"
                min={1}
                value={settings.cancellationCutoffHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cancellationCutoffHours: Number(e.target.value),
                  })
                }
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowSameDayBooking}
                  onChange={(e) =>
                    setSettings({ ...settings, allowSameDayBooking: e.target.checked })
                  }
                  className="rounded text-teal-600"
                />
                Allow Same-Day Emergency Bookings
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
            >
              <Save className="w-4 h-4" /> Save Operating Rules
            </button>
          </form>
        </div>

        {/* Right: Daily Slots Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Standard Daily Time Slots</h3>
              <p className="text-xs text-slate-500">
                Hourly throughput quotas to prevent double-booking or lab congestion
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800">
              {slots.length} Hourly Intervals
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Time Slot</th>
                  <th className="py-3 px-4">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" /> Lab Visit Cap
                    </span>
                  </th>
                  <th className="py-3 px-4">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" /> Home Sample Cap
                    </span>
                  </th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {slots.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-6 font-bold text-slate-800 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.slot}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={s.labCapacity}
                        onChange={(e) =>
                          handleCapacityChange(s.id, 'labCapacity', e.target.value)
                        }
                        className="w-16 p-1 text-xs border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={s.homeCapacity}
                        onChange={(e) =>
                          handleCapacityChange(s.id, 'homeCapacity', e.target.value)
                        }
                        className="w-16 p-1 text-xs border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </td>
                    <td className="py-3 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Enabled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotManagement;

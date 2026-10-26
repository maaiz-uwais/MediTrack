import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePatientProfile } from '../../services/patientService';
import {
  User,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Save,
  CheckCircle2,
  ShieldCheck,
  Plus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, profile, setProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    gender: 'Prefer not to say',
    bloodGroup: 'Unknown',
    dob: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
    },
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
    },
    medicalHistory: [],
    allergies: [],
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        gender: profile.gender || 'Prefer not to say',
        bloodGroup: profile.bloodGroup || 'Unknown',
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          postalCode: profile.address?.postalCode || '',
        },
        emergencyContact: {
          name: profile.emergencyContact?.name || '',
          relation: profile.emergencyContact?.relation || '',
          phone: profile.emergencyContact?.phone || '',
        },
        medicalHistory: profile.medicalHistory || [],
        allergies: profile.allergies || [],
      });
    }
  }, [profile]);

  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (!newAllergy.trim()) return;
    if (formData.allergies.includes(newAllergy.trim())) return;
    setFormData((prev) => ({
      ...prev,
      allergies: [...prev.allergies, newAllergy.trim()],
    }));
    setNewAllergy('');
  };

  const handleRemoveAllergy = (item) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== item),
    }));
  };

  const handleAddCondition = (e) => {
    e.preventDefault();
    if (!newCondition.trim()) return;
    if (formData.medicalHistory.includes(newCondition.trim())) return;
    setFormData((prev) => ({
      ...prev,
      medicalHistory: [...prev.medicalHistory, newCondition.trim()],
    }));
    setNewCondition('');
  };

  const handleRemoveCondition = (item) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((c) => c !== item),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updatePatientProfile(formData);
      if (res.data.success) {
        toast.success('Medical profile updated successfully!');
        if (setProfile) setProfile(res.data.profile);
      }
    } catch {
      toast.error('Failed to update medical profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Patient Clinical Profile & Emergency Info
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Maintain your clinical emergency contacts, blood group, allergies, and permanent address for home diagnostic collections.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Clinical Demographics */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" /> Personal & Medical Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Email Address
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                {['Unknown', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Address and Emergency Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Residential Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" /> Default Home Collection Address
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                placeholder="42 Lotus Enclave, 4th Block"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  placeholder="Bengaluru"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                  placeholder="Karnataka"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, postalCode: e.target.value },
                    })
                  }
                  placeholder="560034"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-600" /> Emergency Contact
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: {
                      ...formData.emergencyContact,
                      name: e.target.value,
                    },
                  })
                }
                placeholder="e.g. Sunita Gupta"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.relation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        relation: e.target.value,
                      },
                    })
                  }
                  placeholder="Spouse / Parent / Sibling"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        phone: e.target.value,
                      },
                    })
                  }
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical History & Known Allergies */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" /> Allergies & Chronic Conditions
          </h3>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Known Drug / Environmental Allergies
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.allergies.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No allergies reported.</span>
              ) : (
                formData.allergies.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(item)}
                      className="text-rose-400 hover:text-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, Dust"
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Past Medical Conditions & Chronic History
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.medicalHistory.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No conditions reported.</span>
              ) : (
                formData.medicalHistory.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(item)}
                      className="text-indigo-400 hover:text-indigo-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="e.g. Hypertension, Asthma"
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shrink-0"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Medical Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

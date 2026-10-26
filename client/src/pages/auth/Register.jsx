import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  HeartPulse,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  Award,
  CreditCard,
  FileCheck2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Patient
    gender: 'Prefer not to say',
    bloodGroup: 'Unknown',
    dob: '',
    // Doctor
    specialization: 'General Physician',
    experience: 3,
    licenseNumber: '',
    fee: 500,
    qualifications: 'MBBS, MD',
  });
  const [loading, setLoading] = useState(false);
  const [infoAlert, setInfoAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert('');
    setInfoAlert('');
    setLoading(true);

    const payload = {
      ...formData,
      role,
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      if (res.pendingApproval) {
        setInfoAlert(res.message);
      } else {
        navigate('/patient/dashboard');
      }
    } else {
      setErrorAlert(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 shadow-xl shadow-teal-500/20 mb-3">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Create MediTrack Account
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Join India's advanced diagnostic and clinical care platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          {/* Role selector tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('patient');
                setErrorAlert('');
                setInfoAlert('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                role === 'patient'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-teal-600" /> Patient Account
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('doctor');
                setErrorAlert('');
                setInfoAlert('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                role === 'doctor'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-indigo-600" /> Doctor Practitioner
            </button>
          </div>

          {infoAlert && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-emerald-800 font-semibold">{infoAlert}</p>
                <Link
                  to="/login"
                  className="mt-2 inline-block text-xs font-bold text-teal-700 underline"
                >
                  Return to sign in
                </Link>
              </div>
            </div>
          )}

          {errorAlert && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium leading-relaxed">{errorAlert}</p>
            </div>
          )}

          {role === 'doctor' && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>Medical Board Notice:</strong> Doctor registrations require credential verification by MediTrack Admin before login is activated.
              </p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={role === 'doctor' ? 'Dr. Sarah Connor' : 'Rahul Sharma'}
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Patient Specifics */}
            {role === 'patient' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Doctor Specifics */}
            {role === 'doctor' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Specialization
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Psychiatrist">Psychiatrist</option>
                      <option value="Endocrinologist">Endocrinologist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Medical License / Reg No.
                    </label>
                    <input
                      type="text"
                      required
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="e.g. MCI-2018-9941"
                      className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Experience (Yrs)
                    </label>
                    <input
                      type="number"
                      min={0}
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      name="fee"
                      value={formData.fee}
                      onChange={handleChange}
                      className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Qualifications
                    </label>
                    <input
                      type="text"
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                      placeholder="MBBS, MD"
                      className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-600/30 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering account...
                </>
              ) : (
                <>
                  {role === 'doctor' ? 'Submit for Admin Approval' : 'Create Patient Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

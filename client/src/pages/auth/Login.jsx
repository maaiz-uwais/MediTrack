import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  HeartPulse,
  UserCheck,
  AlertCircle
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const role = result.user.role;
      if (from) {
        navigate(from, { replace: true });
      } else {
        const defaultRoutes = {
          patient: '/patient/dashboard',
          doctor: '/doctor/dashboard',
          lab_staff: '/lab/dashboard',
          admin: '/admin/dashboard',
        };
        navigate(defaultRoutes[role] || '/patient/dashboard', { replace: true });
      }
    } else {
      setErrorMessage(result.message);
    }
  };

  // Demo user fast-fill helper
  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Emblem */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 shadow-xl shadow-teal-500/20 mb-4 animate-bounce-slow">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Medi<span className="text-teal-400">Track</span>
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Unified Healthcare Operations, Diagnostics & Consultation Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@meditrack.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-600/30 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Role Demo Sign In
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('patient@meditrack.com', 'patient123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                <HeartPulse className="w-3.5 h-3.5 text-teal-600" /> Patient
              </button>
              <button
                type="button"
                onClick={() => fillDemo('dr.sharma@meditrack.com', 'doctor123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-indigo-600" /> Doctor
              </button>
              <button
                type="button"
                onClick={() => fillDemo('lab@meditrack.com', 'labstaff123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <FlaskConical className="w-3.5 h-3.5 text-amber-600" /> Lab Staff
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@meditrack.com', 'admin123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
                Register as Patient or Doctor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

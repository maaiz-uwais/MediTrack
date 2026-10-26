import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Validating MediTrack session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to the user's role-specific default dashboard
    const roleDashboards = {
      patient: '/patient/dashboard',
      doctor: '/doctor/dashboard',
      lab_staff: '/lab/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={roleDashboards[user?.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;

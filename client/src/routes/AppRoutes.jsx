import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import BookTest from '../pages/patient/BookTest';
import BookAppointment from '../pages/patient/BookAppointment';
import JourneyTracker from '../pages/patient/JourneyTracker';
import MyReports from '../pages/patient/MyReports';
import HealthHistory from '../pages/patient/HealthHistory';
import Prescriptions from '../pages/patient/Prescriptions';
import Profile from '../pages/patient/Profile';
import PaymentHistory from '../pages/patient/PaymentHistory';
import SupportReviews from '../pages/patient/SupportReviews';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import PatientRecords from '../pages/doctor/PatientRecords';
import AvailabilitySchedule from '../pages/doctor/AvailabilitySchedule';

// Lab Staff Pages
import LabDashboard from '../pages/lab/LabDashboard';
import AssignedBookings from '../pages/lab/AssignedBookings';
import UploadReport from '../pages/lab/UploadReport';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import DoctorApprovals from '../pages/admin/DoctorApprovals';
import TestPackageManagement from '../pages/admin/TestPackageManagement';
import SlotManagement from '../pages/admin/SlotManagement';
import PaymentManagement from '../pages/admin/PaymentManagement';
import ComplaintsSupport from '../pages/admin/ComplaintsSupport';

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading MediTrack...</p>
        </div>
      </div>
    );
  }

  // Root redirect logic
  const getRootRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    switch (user?.role) {
      case 'doctor':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'lab_staff':
        return <Navigate to="/lab/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/patient/dashboard" replace />;
    }
  };

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? getRootRedirect() : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? getRootRedirect() : <Register />}
      />

      {/* Patient Protected Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="book-test" element={<BookTest />} />
        <Route path="appointments" element={<BookAppointment />} />
        <Route path="tracker" element={<JourneyTracker />} />
        <Route path="reports" element={<MyReports />} />
        <Route path="payments" element={<PaymentHistory />} />
        <Route path="health-history" element={<HealthHistory />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="profile" element={<Profile />} />
        <Route path="support" element={<SupportReviews />} />
      </Route>

      {/* Doctor Protected Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<PatientRecords />} />
        <Route path="availability" element={<AvailabilitySchedule />} />
      </Route>

      {/* Lab Staff Protected Routes */}
      <Route
        path="/lab"
        element={
          <ProtectedRoute allowedRoles={['lab_staff']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/lab/dashboard" replace />} />
        <Route path="dashboard" element={<LabDashboard />} />
        <Route path="bookings" element={<AssignedBookings />} />
        <Route path="upload-report" element={<UploadReport />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="doctor-approvals" element={<DoctorApprovals />} />
        <Route path="tests" element={<TestPackageManagement />} />
        <Route path="slots" element={<SlotManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="complaints" element={<ComplaintsSupport />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={getRootRedirect()} />
    </Routes>
  );
};

export default AppRoutes;

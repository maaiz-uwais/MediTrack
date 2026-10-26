import api from './api';

export const getPatientDashboard = () => api.get('/patient/dashboard');
export const getHealthHistory = () => api.get('/patient/health-history');
export const updatePatientProfile = (data) => api.put('/patient/profile', data);

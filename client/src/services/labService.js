import api from './api';

export const getLabDashboardStats = () => api.get('/lab/stats');
export const getLabBookings = (params) => api.get('/lab/bookings', { params });
export const updateSampleStatus = (id, data) => api.put(`/lab/bookings/${id}/status`, data);
export const uploadReport = (formData) =>
  api.post('/lab/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

import api from './api';

export const getDoctorsDirectory = (params) => api.get('/appointments/doctors', { params });
export const getDoctorAvailability = (doctorId, date) =>
  api.get(`/appointments/doctors/${doctorId}/availability`, { params: { date } });
export const createAppointment = (data) => api.post('/appointments', data);
export const getMyAppointments = () => api.get('/appointments/my');
export const cancelAppointment = (id) => api.put(`/appointments/${id}/cancel`);

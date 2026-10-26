import api from './api';

export const getDoctorStats = () => api.get('/doctor/stats');
export const getDoctorAppointments = (params) => api.get('/doctor/appointments', { params });
export const updateAppointmentStatus = (id, data) =>
  api.put(`/doctor/appointments/${id}/status`, data);
export const getDoctorPatientRecord = (patientId) => api.get(`/doctor/patients/${patientId}`);
export const issuePrescription = (data) => api.post('/doctor/prescriptions', data);
export const updateDoctorAvailability = (data) => api.put('/doctor/availability', data);

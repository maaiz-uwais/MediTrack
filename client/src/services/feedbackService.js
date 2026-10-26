import api from './api';

export const submitDoctorReview = (data) => api.post('/feedback/reviews', data);
export const createComplaintTicket = (data) => api.post('/feedback/complaints', data);
export const getMyPrescriptions = () => api.get('/feedback/prescriptions/my');

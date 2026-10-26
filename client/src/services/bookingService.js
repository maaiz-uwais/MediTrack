import api from './api';

export const createTestBooking = (data) => api.post('/bookings', data);
export const getMyTestBookings = () => api.get('/bookings/my');
export const getBookingDetails = (id) => api.get(`/bookings/${id}`);
export const cancelTestBooking = (id) => api.put(`/bookings/${id}/cancel`);

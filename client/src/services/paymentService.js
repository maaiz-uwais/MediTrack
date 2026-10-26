import api from './api';

export const createRazorpayOrder = (data) => api.post('/payments/create-order', data);
export const verifyPaymentSignature = (data) => api.post('/payments/verify', data);
export const getMyPayments = () => api.get('/payments/my');
export const getInvoiceData = (paymentId) => api.get(`/payments/invoice/${paymentId}`);

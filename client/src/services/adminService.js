import api from './api';

export const getAdminStats = () => api.get('/admin/stats');
export const getAllUsers = (params) => api.get('/admin/users', { params });
export const toggleBlockUser = (id) => api.put(`/admin/users/${id}/toggle-block`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export const getDoctorApprovals = () => api.get('/admin/doctor-approvals');
export const approveDoctor = (id) => api.put(`/admin/doctor-approvals/${id}/approve`);
export const rejectDoctor = (id, reason) => api.put(`/admin/doctor-approvals/${id}/reject`, { reason });

export const getComplaints = () => api.get('/admin/complaints');
export const resolveComplaint = (id, data) => api.put(`/admin/complaints/${id}/resolve`, data);

export const getSlotSettings = () => api.get('/admin/slots');

export const getAllPayments = () => api.get('/admin/payments');
export const refundPayment = (id) => api.put(`/admin/payments/${id}/refund`);

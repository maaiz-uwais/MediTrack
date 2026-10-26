import api from './api';

export const getMyReports = (params) => api.get('/reports/my', { params });
export const getReportById = (id) => api.get(`/reports/${id}`);

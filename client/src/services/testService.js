import api from './api';

export const getAllTests = (params) => api.get('/tests', { params });
export const getTestById = (id) => api.get(`/tests/${id}`);
export const createTest = (data) => api.post('/tests', data);
export const updateTest = (id, data) => api.put(`/tests/${id}`, data);
export const deleteTest = (id) => api.delete(`/tests/${id}`);

export const getAllPackages = () => api.get('/tests/packages/all');
export const createPackage = (data) => api.post('/tests/packages', data);
export const updatePackage = (id, data) => api.put(`/tests/packages/${id}`, data);
export const deletePackage = (id) => api.delete(`/tests/packages/${id}`);

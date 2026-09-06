import api from './api';

export const patientService = {
  getPatients: (params) => api.get('/patients', { params }),
  createPatient: (data) => api.post('/patients', data),
  getPatient: (id) => api.get(`/patients/${id}`),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`),
};

import api from './api';

export const medicalRecordService = {
  getRecordsByPatient: (patientId) => api.get(`/medical-records/patient/${patientId}`),
  createRecord: (data) => api.post('/medical-records', data),
  getRecordDetail: (id) => api.get(`/medical-records/detail/${id}`),
  updateRecord: (id, data) => api.put(`/medical-records/${id}`, data),
  deleteRecord: (id) => api.delete(`/medical-records/${id}`),
};

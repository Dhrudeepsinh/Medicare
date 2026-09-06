import api from './api';

export const doctorService = {
  getProfile: () => api.get('/doctors/profile'),
  updateProfile: (data) => api.put('/doctors/profile', data),
  changePassword: (data) => api.put('/doctors/change-password', data),
};

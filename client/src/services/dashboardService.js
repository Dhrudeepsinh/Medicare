import api from './api';

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentPatients: () => api.get('/dashboard/recent-patients'),
  getUpcomingAppointments: () => api.get('/dashboard/upcoming-appointments'),
  getChartData: () => api.get('/dashboard/chart-data'),
};

const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getRecentPatients, getUpcomingAppointments,
  getVisitsChart, getDiagnosisChart, getInfectionChart,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/recent-patients', getRecentPatients);
router.get('/upcoming-appointments', getUpcomingAppointments);
router.get('/visits-chart', getVisitsChart);
router.get('/diagnosis-chart', getDiagnosisChart);
router.get('/infection-chart', getInfectionChart);

module.exports = router;

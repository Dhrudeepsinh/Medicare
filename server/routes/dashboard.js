const express = require('express');
const router = express.Router();
const { getStats, getRecentPatients, getUpcomingAppointments, getChartData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.get('/recent-patients', getRecentPatients);
router.get('/upcoming-appointments', getUpcomingAppointments);
router.get('/chart-data', getChartData);

module.exports = router;

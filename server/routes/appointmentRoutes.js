const express = require('express');
const router = express.Router();
const {
  getAppointments, createAppointment, updateAppointment, deleteAppointment, getTodayAppointments,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/today', getTodayAppointments);
router.route('/').get(getAppointments).post(createAppointment);
router.route('/:id').put(updateAppointment).delete(deleteAppointment);

module.exports = router;

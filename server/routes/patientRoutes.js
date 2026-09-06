const express = require('express');
const router = express.Router();
const {
  getPatients, createPatient, getPatient, updatePatient, deletePatient, searchPatients,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/search', searchPatients);
router.route('/').get(getPatients).post(createPatient);
router.route('/:id').get(getPatient).put(updatePatient).delete(deletePatient);

module.exports = router;

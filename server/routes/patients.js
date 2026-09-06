const express = require('express');
const router = express.Router();
const { getPatients, createPatient, getPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

router.use(protect); // All patient routes require authentication

router.route('/').get(getPatients).post(createPatient);
router.route('/:id').get(getPatient).put(updatePatient).delete(deletePatient);

module.exports = router;

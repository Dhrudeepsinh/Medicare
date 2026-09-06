const express = require('express');
const router = express.Router();
const {
  getRecordsByPatient, createRecord, getRecord, updateRecord, deleteRecord,
} = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createRecord);
router.get('/detail/:id', getRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);
router.get('/:patientId', getRecordsByPatient);

module.exports = router;

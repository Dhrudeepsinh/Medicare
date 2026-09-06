const express = require('express');
const router = express.Router();
const {
  getRecordsByPatient,
  createRecord,
  getRecordDetail,
  updateRecord,
  deleteRecord,
} = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/patient/:patientId', getRecordsByPatient);
router.post('/', createRecord);
router.get('/detail/:id', getRecordDetail);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;

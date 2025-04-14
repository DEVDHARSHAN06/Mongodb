// server/routes/patient.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Middleware to check if user is a patient
const isPatient = checkRole('patient');

// Get patient dashboard data
router.get('/dashboard', auth, isPatient, patientController.getDashboard);

// Update vital records
//router.post('/vitals', auth, isPatient, patientController.updateVitals);
// router.post('/vitals', auth, isPatient, patientController.updateVitals);
router.post('/vitals', patientController.updateVitals); // Temporarily bypass auth for testing


// Get appointments
router.get('/appointments', auth, isPatient, patientController.getAppointments);

// Schedule new appointment
router.post('/appointments', auth, isPatient, patientController.scheduleAppointment);

// Get medication details
router.get('/medications', auth, isPatient, patientController.getMedications);

module.exports = router;

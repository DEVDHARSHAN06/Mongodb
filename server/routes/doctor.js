// server/routes/doctor.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Middleware to check if user is a doctor
const isDoctor = checkRole('doctor');

// Get doctor dashboard data
router.get('/dashboard', auth, isDoctor, doctorController.getDashboard);

// Get patient details
router.get('/patients/:patientId', auth, isDoctor, doctorController.getPatientDetails);

// Update treatment plan
router.put('/patients/:patientId/treatment', auth, isDoctor, doctorController.updateTreatmentPlan);

// Update medication
router.put('/patients/:patientId/medications', auth, isDoctor, doctorController.updateMedication);

// Update appointment status
router.put('/patients/:patientId/appointments/:appointmentId', auth, isDoctor, doctorController.updateAppointment);

module.exports = router;
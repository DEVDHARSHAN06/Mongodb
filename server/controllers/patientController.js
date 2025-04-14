// server/controllers/patientController.js
const Patient = require('../models/Patient');
const User = require('../models/User');

// Get patient dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id })
      .populate('assignedDoctor', 'name specialization');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Get recent vital records (last 5)
    const recentVitals = patient.vitalRecords
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    // Get upcoming appointments
    const upcomingAppointments = patient.appointments
      .filter(appt => appt.status === 'scheduled' && new Date(appt.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get recent appointments (last 3)
    const recentAppointments = patient.appointments
      .filter(appt => appt.status === 'completed')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    res.json({
      patientInfo: {
        name: patient.userId ? patient.userId.name : '',
        id: patient._id
      },
      treatmentPlan: patient.treatmentPlan,
      recentVitals,
      currentMedications: patient.currentMedications,
      upcomingAppointments,
      recentAppointments,
      assignedDoctor: patient.assignedDoctor
    });
  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update vital records
exports.updateVitals = async (req, res) => {
  try {
    const { bloodPressure, heartRate, temperature, notes } = req.body;

    const patient = await Patient.findOne({ userId: req.user.id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newVitalRecord = {
      date: new Date(),
      bloodPressure,
      heartRate,
      temperature,
      notes
    };

    patient.vitalRecords.push(newVitalRecord);
    await patient.save();

    res.status(201).json({
      message: 'Vital records updated successfully',
      vitalRecord: newVitalRecord
    });
  } catch (error) {
    console.error('Update vitals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get appointments
exports.getAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointments = patient.appointments.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Schedule new appointment
exports.scheduleAppointment = async (req, res) => {
  try {
    const { date, reason } = req.body;

    const patient = await Patient.findOne({ userId: req.user.id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newAppointment = {
      date,
      reason,
      status: 'scheduled'
    };

    patient.appointments.push(newAppointment);
    await patient.save();

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Schedule appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get medication details
exports.getMedications = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ medications: patient.currentMedications });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
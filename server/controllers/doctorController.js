// server/controllers/doctorController.js
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Get doctor dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Get patients assigned to the doctor
    const patients = await Patient.find({ assignedDoctor: doctor._id })
      .populate('userId', 'name email');

    // Get upcoming appointments
    let upcomingAppointments = [];
    for (const patient of patients) {
      const patientAppointments = patient.appointments
        .filter(appt => appt.status === 'scheduled' && new Date(appt.date) >= new Date())
        .map(appt => ({
          ...appt.toObject(),
          patientId: patient._id,
          patientName: patient.userId ? patient.userId.name : 'Unknown'
        }));
      
      upcomingAppointments = [...upcomingAppointments, ...patientAppointments];
    }
    
    // Sort by date
    upcomingAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Count appointments by status
    const appointmentStats = {
      scheduled: 0,
      completed: 0,
      cancelled: 0
    };

    patients.forEach(patient => {
      patient.appointments.forEach(appt => {
        if (appointmentStats[appt.status] !== undefined) {
          appointmentStats[appt.status]++;
        }
      });
    });

    res.json({
      doctorInfo: {
        name: req.user.name,
        specialization: doctor.specialization,
        experience: doctor.experience
      },
      patientCount: patients.length,
      patients: patients.map(p => ({
        id: p._id,
        name: p.userId ? p.userId.name : 'Unknown',
        diagnosis: p.treatmentPlan ? p.treatmentPlan.diagnosis : 'None',
        lastVisit: p.appointments && p.appointments.length > 0 ? 
          p.appointments.filter(a => a.status === 'completed')
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date : null
      })),
      upcomingAppointments: upcomingAppointments.slice(0, 5),
      appointmentStats
    });
  } catch (error) {
    console.error('Get doctor dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get patient details
exports.getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId)
      .populate('userId', 'name email')
      .populate('assignedDoctor');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Ensure doctor has access to this patient
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !patient.assignedDoctor || patient.assignedDoctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this patient\'s information' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update treatment plan
exports.updateTreatmentPlan = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { diagnosis, plan, notes } = req.body;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Ensure doctor has access to this patient
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !patient.assignedDoctor || patient.assignedDoctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied to update this patient\'s treatment plan' });
    }

    patient.treatmentPlan = {
      diagnosis: diagnosis || patient.treatmentPlan.diagnosis,
      plan: plan || patient.treatmentPlan.plan,
      notes: notes || patient.treatmentPlan.notes,
      lastUpdated: new Date()
    };

    await patient.save();

    res.json({
      message: 'Treatment plan updated successfully',
      treatmentPlan: patient.treatmentPlan
    });
  } catch (error) {
    console.error('Update treatment plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update medication
exports.updateMedication = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { medications } = req.body;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Ensure doctor has access to this patient
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !patient.assignedDoctor || patient.assignedDoctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied to update this patient\'s medications' });
    }

    patient.currentMedications = medications;
    await patient.save();

    res.json({
      message: 'Medications updated successfully',
      medications: patient.currentMedications
    });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update appointment status
exports.updateAppointment = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { status, notes } = req.body;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Ensure doctor has access to this patient
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !patient.assignedDoctor || patient.assignedDoctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied to update this patient\'s appointment' });
    }

    const appointmentIndex = patient.appointments.findIndex(
      appt => appt._id.toString() === appointmentId
    );

    if (appointmentIndex === -1) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    patient.appointments[appointmentIndex].status = status;
    
    if (notes) {
      patient.appointments[appointmentIndex].notes = notes;
    }

    await patient.save();

    res.json({
      message: 'Appointment updated successfully',
      appointment: patient.appointments[appointmentIndex]
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

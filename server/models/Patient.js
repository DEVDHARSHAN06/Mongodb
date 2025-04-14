const mongoose = require('mongoose');

const vitalRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  heartRate: Number,
  temperature: Number,
  notes: String
});

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: Date,
  gender: String,
  contactNumber: String,
  address: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  medicalHistory: [String],
  allergies: [String],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  vitalRecords: [vitalRecordSchema],
  treatmentPlan: {
    diagnosis: String,
    plan: String,
    notes: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  appointments: [{
    date: Date,
    reason: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    notes: String
  }]
});

module.exports = mongoose.model('Patient', patientSchema);

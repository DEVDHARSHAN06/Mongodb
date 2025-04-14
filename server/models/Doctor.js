const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: String,
  licenseNumber: String,
  experience: Number,
  contactNumber: String,
  address: String,
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }]
});

module.exports = mongoose.model('Doctor', doctorSchema);

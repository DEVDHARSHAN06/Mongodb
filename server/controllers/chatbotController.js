// server/controllers/chatbotController.js
const ChatMessage = require('../models/ChatMessage');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Process chatbot message
exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    
    // Save user message
    const userMessage = new ChatMessage({
      sender: userId,
      message,
      isFromBot: false
    });
    
    await userMessage.save();
    
    // Process message and generate response
    const response = await generateChatbotResponse(message, userId, req.user.role);
    
    // Save bot response
    const botMessage = new ChatMessage({
      sender: userId, // Recording who the message was for
      message: response.message,
      isFromBot: true
    });
    
    await botMessage.save();
    
    res.json({
      botResponse: response
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      sender: req.user.id
    }).sort({ timestamp: 1 });
    
    res.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to generate chatbot responses
async function generateChatbotResponse(message, userId, role) {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Default response
  let response = {
    message: "I'm sorry, I didn't understand that. How can I help you with your healthcare needs today?",
    data: null
  };
  
  try {
    // Patient specific queries
    if (role === 'patient') {
      const patient = await Patient.findOne({ userId })
        .populate('assignedDoctor', 'name specialization');
      
      if (!patient) {
        return {
          message: "I couldn't find your patient record. Please contact support.",
          data: null
        };
      }
      
      // Check for medication related queries
      if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('tablet')) {
        if (patient.currentMedications && patient.currentMedications.length > 0) {
          const medicationList = patient.currentMedications.map(med => 
            `${med.name} (${med.dosage}, ${med.frequency})`
          ).join('\n- ');
          
          response = {
            message: `Here are your current medications:\n- ${medicationList}`,
            data: patient.currentMedications
          };
        } else {
          response = {
            message: "You don't have any medications in your record.",
            data: []
          };
        }
      }
      
      // Check for appointment queries
      else if (lowerMessage.includes('appointment') || lowerMessage.includes('visit')) {
        if (patient.appointments && patient.appointments.length > 0) {
          // Find last appointment
          const completedAppointments = patient.appointments
            .filter(a => a.status === 'completed')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            const upcomingAppointments = patient.appointments
            .filter(a => a.status === 'scheduled' && new Date(a.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date));
            
          let responseMsg = '';
          
          if (completedAppointments.length > 0) {
            const lastAppointment = completedAppointments[0];
            const lastDate = new Date(lastAppointment.date).toLocaleDateString();
            responseMsg += `Your last visit was on ${lastDate}.`;
            
            if (lastAppointment.notes) {
              responseMsg += ` Notes: ${lastAppointment.notes}`;
            }
            responseMsg += '\n\n';
          }
          
          if (upcomingAppointments.length > 0) {
            const nextAppointment = upcomingAppointments[0];
            const nextDate = new Date(nextAppointment.date).toLocaleDateString();
            const nextTime = new Date(nextAppointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            responseMsg += `Your next appointment is scheduled for ${nextDate} at ${nextTime}.`;
            if (nextAppointment.reason) {
              responseMsg += ` Reason: ${nextAppointment.reason}`;
            }
          } else {
            responseMsg += "You don't have any upcoming appointments scheduled.";
          }
          
          response = {
            message: responseMsg,
            data: {
              lastAppointment: completedAppointments[0] || null,
              nextAppointment: upcomingAppointments[0] || null
            }
          };
        } else {
          response = {
            message: "You don't have any appointments in your record.",
            data: []
          };
        }
      }
      
      // Check for doctor information
      else if (lowerMessage.includes('doctor') || lowerMessage.includes('physician')) {
        if (patient.assignedDoctor) {
          response = {
            message: `Your assigned doctor is ${patient.assignedDoctor.name}, specializing in ${patient.assignedDoctor.specialization}.`,
            data: patient.assignedDoctor
          };
        } else {
          response = {
            message: "You don't have an assigned doctor yet.",
            data: null
          };
        }
      }
      
      // Check for vital signs
      else if (lowerMessage.includes('vital') || lowerMessage.includes('bp') || 
               lowerMessage.includes('blood pressure') || lowerMessage.includes('heart rate')) {
        if (patient.vitalRecords && patient.vitalRecords.length > 0) {
          // Get the most recent vital record
          const latestVital = patient.vitalRecords.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          )[0];
          
          const vitalDate = new Date(latestVital.date).toLocaleDateString();
          let vitalInfo = `Your latest vital signs (recorded on ${vitalDate}):\n`;
          
          if (latestVital.bloodPressure) {
            vitalInfo += `- Blood Pressure: ${latestVital.bloodPressure.systolic}/${latestVital.bloodPressure.diastolic} mmHg\n`;
          }
          
          if (latestVital.heartRate) {
            vitalInfo += `- Heart Rate: ${latestVital.heartRate} bpm\n`;
          }
          
          if (latestVital.temperature) {
            vitalInfo += `- Temperature: ${latestVital.temperature}°F\n`;
          }
          
          response = {
            message: vitalInfo,
            data: latestVital
          };
        } else {
          response = {
            message: "You don't have any vital records in your chart yet.",
            data: null
          };
        }
      }
      
      // Check for treatment plan
      else if (lowerMessage.includes('treatment') || lowerMessage.includes('plan') || 
               lowerMessage.includes('diagnosis')) {
        if (patient.treatmentPlan && patient.treatmentPlan.diagnosis) {
          let planInfo = '';
          
          if (patient.treatmentPlan.diagnosis) {
            planInfo += `Diagnosis: ${patient.treatmentPlan.diagnosis}\n\n`;
          }
          
          if (patient.treatmentPlan.plan) {
            planInfo += `Treatment plan: ${patient.treatmentPlan.plan}\n\n`;
          }
          
          if (patient.treatmentPlan.notes) {
            planInfo += `Additional notes: ${patient.treatmentPlan.notes}\n\n`;
          }
          
          const updateDate = new Date(patient.treatmentPlan.lastUpdated).toLocaleDateString();
          planInfo += `Last updated: ${updateDate}`;
          
          response = {
            message: planInfo,
            data: patient.treatmentPlan
          };
        } else {
          response = {
            message: "I couldn't find any treatment plan in your records.",
            data: null
          };
        }
      }
    }
    // Doctor specific queries
    else if (role === 'doctor') {
      const doctor = await Doctor.findOne({ userId });
      
      if (!doctor) {
        return {
          message: "I couldn't find your doctor record. Please contact support.",
          data: null
        };
      }
      
      // Check for patient list query
      if (lowerMessage.includes('patient list') || lowerMessage.includes('my patients')) {
        const patients = await Patient.find({ assignedDoctor: doctor._id })
          .populate('userId', 'name');
        
        if (patients && patients.length > 0) {
          const patientList = patients.map(p => 
            `${p.userId ? p.userId.name : 'Unknown'}`
          ).join('\n- ');
          
          response = {
            message: `You have ${patients.length} patients assigned to you:\n- ${patientList}`,
            data: patients.map(p => ({
              id: p._id,
              name: p.userId ? p.userId.name : 'Unknown'
            }))
          };
        } else {
          response = {
            message: "You don't have any patients assigned to you yet.",
            data: []
          };
        }
      }
      
      // Check for appointment schedule
      else if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
        // Get all patients
        const patients = await Patient.find({ assignedDoctor: doctor._id })
          .populate('userId', 'name');
        
        let upcomingAppointments = [];
        
        // Collect appointments from all patients
        patients.forEach(patient => {
          const patientName = patient.userId ? patient.userId.name : 'Unknown';
          
          patient.appointments
            .filter(appt => appt.status === 'scheduled' && new Date(appt.date) >= new Date())
            .forEach(appt => {
              upcomingAppointments.push({
                patientName,
                patientId: patient._id,
                date: appt.date,
                reason: appt.reason
              });
            });
        });
        
        // Sort by date
        upcomingAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (upcomingAppointments.length > 0) {
          const appointmentList = upcomingAppointments.map(appt => {
            const apptDate = new Date(appt.date).toLocaleDateString();
            const apptTime = new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            return `${apptDate} ${apptTime} - ${appt.patientName}${appt.reason ? ' ('+appt.reason+')' : ''}`;
          }).join('\n- ');
          
          response = {
            message: `You have ${upcomingAppointments.length} upcoming appointments:\n- ${appointmentList}`,
            data: upcomingAppointments
          };
        } else {
          response = {
            message: "You don't have any upcoming appointments scheduled.",
            data: []
          };
        }
      }
      
      // Check for specific patient information
      else if (lowerMessage.includes('patient info') || lowerMessage.includes('patient details')) {
        // Extract patient name if provided
        const nameMatch = message.match(/patient (?:info|details)(?: for| about)? (.+?)(?:\s|$)/i);
        let patientName = nameMatch ? nameMatch[1].trim() : null;
        
        if (patientName) {
          // Find patients that match the name
          const patients = await Patient.find({ assignedDoctor: doctor._id })
            .populate('userId', 'name');
          
          const matchedPatient = patients.find(p => 
            p.userId && p.userId.name.toLowerCase().includes(patientName.toLowerCase())
          );
          
          if (matchedPatient) {
            let patientInfo = `Patient: ${matchedPatient.userId.name}\n\n`;
            
            if (matchedPatient.treatmentPlan && matchedPatient.treatmentPlan.diagnosis) {
              patientInfo += `Diagnosis: ${matchedPatient.treatmentPlan.diagnosis}\n\n`;
            }
            
            if (matchedPatient.currentMedications && matchedPatient.currentMedications.length > 0) {
              patientInfo += 'Current Medications:\n';
              matchedPatient.currentMedications.forEach(med => {
                patientInfo += `- ${med.name} (${med.dosage}, ${med.frequency})\n`;
              });
              patientInfo += '\n';
            }
            
            if (matchedPatient.vitalRecords && matchedPatient.vitalRecords.length > 0) {
              const latestVital = matchedPatient.vitalRecords.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
              )[0];
              
              patientInfo += 'Latest Vitals:\n';
              if (latestVital.bloodPressure) {
                patientInfo += `- BP: ${latestVital.bloodPressure.systolic}/${latestVital.bloodPressure.diastolic}\n`;
              }
              if (latestVital.heartRate) {
                patientInfo += `- HR: ${latestVital.heartRate}\n`;
              }
              if (latestVital.temperature) {
                patientInfo += `- Temp: ${latestVital.temperature}°F\n`;
              }
            }
            
            response = {
              message: patientInfo,
              data: matchedPatient
            };
          } else {
            response = {
              message: `I couldn't find a patient named "${patientName}" assigned to you.`,
              data: null
            };
          }
        } else {
          response = {
            message: "Please specify which patient you'd like information about. For example: 'patient info for John Smith'",
            data: null
          };
        }
      }
    }
    
    // General greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage === 'hi') {
      response = {
        message: `Hello! How can I assist you with your healthcare needs today?`,
        data: null
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error generating chatbot response:', error);
    return {
      message: "I'm having trouble processing your request. Please try again later.",
      data: null
    };
  }
}

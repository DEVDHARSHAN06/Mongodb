// client/src/pages/DoctorDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/DoctorDashboard.css';
import Sidebar from '../components/Sidebar';
import PatientList from '../components/doctor/PatientList';
import PatientDetails from '../components/doctor/PatientDetails';
import AppointmentSchedule from '../components/doctor/AppointmentSchedule';
import ChatBot from '../components/ChatBot';

const DoctorDashboard = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('patients');

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        const doctorResponse = await axios.get(`/api/doctors/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDoctorData(doctorResponse.data);
        
        const patientsResponse = await axios.get(`/api/doctors/${userId}/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPatients(patientsResponse.data);
      } catch (err) {
        console.error('Error fetching doctor data:', err);
        setError('Failed to load your information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p._id === patientId);
    setSelectedPatient(patient);
  };

  const handleTreatmentUpdate = async (patientId, updatedTreatment) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/patients/${patientId}/treatment`, updatedTreatment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the patient in the local state
      const updatedPatients = patients.map(patient => {
        if (patient._id === patientId) {
          return { ...patient, treatmentPlan: updatedTreatment };
        }
        return patient;
      });
      
      setPatients(updatedPatients);
      
      if (selectedPatient && selectedPatient._id === patientId) {
        setSelectedPatient({ ...selectedPatient, treatmentPlan: updatedTreatment });
      }
      
    } catch (err) {
      console.error('Error updating treatment plan:', err);
    }
  };

  if (loading) return <div className="loading">Loading your dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <Sidebar userType="doctor" activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome, Dr. {doctorData?.name}</h1>
          <p>Specialty: {doctorData?.specialty}</p>
        </header>

        <div className="dashboard-main">
          {activeTab === 'patients' && (
            <div className="patients-container">
              <PatientList 
                patients={patients} 
                onPatientSelect={handlePatientSelect} 
                selectedPatientId={selectedPatient?._id}
              />
              
              {selectedPatient && (
                <PatientDetails 
                  patient={selectedPatient} 
                  onTreatmentUpdate={handleTreatmentUpdate}
                />
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <AppointmentSchedule 
              appointments={doctorData?.appointments} 
              patients={patients}
            />
          )}

          {activeTab === 'chat' && (
            <ChatBot userType="doctor" userId={doctorData?._id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
// client/src/pages/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/PatientDashboard.css';
import Sidebar from '../components/Sidebar';
import HealthMetrics from '../components/patient/HealthMetrics';
import TreatmentPlan from '../components/patient/TreatmentPlan';
import DoctorInfo from '../components/patient/DoctorInfo';
import AppointmentHistory from '../components/patient/AppointmentHistory';
import ChatBot from '../components/ChatBot';

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        const response = await axios.get(`/api/patients/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPatientData(response.data);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load your information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  if (loading) return <div className="loading">Loading your dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <Sidebar userType="patient" activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome, {patientData?.name}</h1>
          <p>Patient ID: {patientData?._id}</p>
        </header>

        <div className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="dashboard-overview">
              <HealthMetrics healthData={patientData?.healthMetrics} />
              <TreatmentPlan treatmentData={patientData?.treatmentPlan} />
            </div>
          )}

          {activeTab === 'doctor' && (
            <DoctorInfo doctorData={patientData?.assignedDoctor} />
          )}

          {activeTab === 'appointments' && (
            <AppointmentHistory appointments={patientData?.appointments} />
          )}

          {activeTab === 'chat' && (
            <ChatBot userType="patient" userId={patientData?._id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
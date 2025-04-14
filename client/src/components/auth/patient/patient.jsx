import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientSidebar from './PatientSidebar';
import HealthMetrics from './HealthMetrics';
import TreatmentPlan from './TreatmentPlan';
import AppointmentHistory from './AppointmentHistory';
import AssignedDoctor from './AssignedDoctor';
import PatientChatbot from './PatientChatbot';
import { FaUserMd, FaCalendarCheck, FaHeartbeat, FaNotesMedical } from 'react-icons/fa';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('health');
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchPatientData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patients/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatientData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch patient data. Please try again later.');
        setLoading(false);
        console.error('Error fetching patient data:', err);
      }
    };

    fetchPatientData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <PatientSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {patientData?.name}</h1>
          <p className="text-gray-600">Patient ID: {patientData?._id}</p>
        </div>

        {activeTab === 'health' && (
          <HealthMetrics patientData={patientData} />
        )}

        {activeTab === 'treatment' && (
          <TreatmentPlan patientData={patientData} />
        )}

        {activeTab === 'appointments' && (
          <AppointmentHistory patientData={patientData} />
        )}

        {activeTab === 'doctor' && (
          <AssignedDoctor patientData={patientData} />
        )}

        {activeTab === 'chatbot' && (
          <PatientChatbot patientId={patientData?._id} />
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
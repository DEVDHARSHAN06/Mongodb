// src/components/doctor/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoctorSidebar from './DoctorSidebar';
import PatientsList from './PatientsList';
import PatientDetails from './PatientDetails';
import AppointmentCalendar from './AppointmentCalendar';
import DoctorChatbot from './DoctorChatbot';
import DoctorAnalytics from './DoctorAnalytics';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('patients');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDoctorData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctors/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctorData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch doctor data. Please try again later.');
        setLoading(false);
        console.error('Error fetching doctor data:', err);
      }
    };

    fetchDoctorData();
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

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DoctorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, Dr. {doctorData?.lastName}</h1>
          <p className="text-gray-600">Doctor ID: {doctorData?._id}</p>
        </div>

        {activeTab === 'patients' && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <PatientsList onSelectPatient={handlePatientSelect} selectedPatientId={selectedPatient?._id} doctorId={doctorData?._id} />
            </div>
            <div className="w-full md:w-2/3">
              {selectedPatient ? (
                <PatientDetails patientId={selectedPatient._id} />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">Select a patient to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <AppointmentCalendar doctorId={doctorData?._id} />
        )}

        {activeTab === 'analytics' && (
          <DoctorAnalytics doctorId={doctorData?._id} />
        )}

        {activeTab === 'assistant' && (
          <DoctorChatbot doctorId={doctorData?._id} />
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

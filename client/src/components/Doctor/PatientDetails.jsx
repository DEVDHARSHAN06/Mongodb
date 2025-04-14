import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaCalendarAlt, FaFileMedical, FaPrescription } from 'react-icons/fa';
import PatientVitals from './PatientVitals';
import PatientMedications from './PatientMedications';

const PatientDetails = ({ patientId }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatient(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch patient details');
        setLoading(false);
        console.error('Error fetching patient details:', err);
      }
    };

    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">No patient data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {patient.avatar ? (
            <img className="h-16 w-16 rounded-full" src={patient.avatar} alt={patient.name} />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <FaUser className="text-gray-500 text-2xl" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{patient.name}</h3>
            <p className="text-gray-600">{patient.email}</p>
            <p className="text-sm text-gray-500">
              {patient.age} years • {patient.gender} • {patient.bloodType || 'Unknown blood type'}
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'medical' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Medical History
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'medications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Medications
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <FaUser className="mr-2 text-blue-500" />
                  Personal Information
                </h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Date of Birth:</span> {new Date(patient.dob).toLocaleDateString()}</p>
                  <p><span className="font-medium">Phone:</span> {patient.phone || 'N/A'}</p>
                  <p><span className="font-medium">Address:</span> {patient.address || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <FaFileMedical className="mr-2 text-blue-500" />
                  Health Summary
                </h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Allergies:</span> {patient.allergies?.join(', ') || 'None reported'}</p>
                  <p><span className="font-medium">Conditions:</span> {patient.conditions?.join(', ') || 'None reported'}</p>
                </div>
              </div>
            </div>

            <PatientVitals patientId={patientId} />
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Medical History</h4>
            {patient.medicalHistory?.length > 0 ? (
              <div className="space-y-4">
                {patient.medicalHistory.map((record, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{record.condition}</h5>
                      <span className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{record.notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No medical history recorded</p>
            )}
          </div>
        )}

        {activeTab === 'medications' && (
          <PatientMedications patientId={patientId} />
        )}
      </div>
    </div>
  );
};

export default PatientDetails;
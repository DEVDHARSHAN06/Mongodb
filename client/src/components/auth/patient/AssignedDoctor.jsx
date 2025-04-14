// src/components/patient/AssignedDoctor.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserMd, FaPhone, FaEnvelope, FaCalendarPlus } from 'react-icons/fa';

const AssignedDoctor = ({ patientData }) => {
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/patients/doctor/${patientData._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctorInfo(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch doctor information. Please try again later.');
        setLoading(false);
        console.error('Error fetching doctor info:', err);
      }
    };

    if (patientData?._id) {
      fetchDoctorInfo();
    }
  }, [patientData]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>;
  }

  if (!doctorInfo) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No doctor assigned. Please contact the clinic.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Your Doctor</h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 flex justify-center mb-6 md:mb-0">
            <div className="w-48 h-48 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUserMd className="text-blue-600" size={64} />
            </div>
          </div>
          
          <div className="w-full md:w-2/3 md:pl-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{`Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}`}</h3>
            <p className="text-lg text-blue-600 mb-4">{doctorInfo.specialization}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <FaPhone className="text-gray-500 mr-3" />
                <span className="text-gray-700">{doctorInfo.contactNumber}</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-500 mr-3" />
                <span className="text-gray-700">{doctorInfo.email}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="bg-blue-600 text-white flex items-center px-4 py-2 rounded-md hover:bg-blue-700 transition">
                <FaCalendarPlus className="mr-2" />
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">About</h4>
          <p className="text-gray-700 mb-4">{doctorInfo.bio || 'No bio available.'}</p>
          
          {doctorInfo.education && doctorInfo.education.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Education</h4>
              <ul className="list-disc pl-5 space-y-2">
                {doctorInfo.education && doctorInfo.education.map((edu, index) => (
                  <li key={index} className="text-gray-700">{edu}</li>
                ))}
              </ul>
            </div>
          )}
          
          {doctorInfo.workingHours && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Working Hours</h4>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-gray-700">{doctorInfo.workingHours}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedDoctor;
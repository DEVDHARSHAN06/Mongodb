import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaChartPie, FaChartLine, FaUser, FaCalendar, FaFileMedical } from 'react-icons/fa';

const DoctorAnalytics = ({ doctorId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('patients');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics data');
        setLoading(false);
        console.error('Error fetching analytics:', err);
      }
    };

    if (doctorId) {
      fetchAnalytics();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaChartLine className="mr-2 text-blue-500" />
          Practice Analytics
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-800">{analytics?.totalPatients || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUser className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Appointments This Month</p>
                <p className="text-2xl font-bold text-gray-800">{analytics?.monthlyAppointments || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaCalendar className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Prescriptions Issued</p>
                <p className="text-2xl font-bold text-gray-800">{analytics?.totalPrescriptions || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaFileMedical className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveChart('patients')}
              className={`py-3 px-6 text-center border-b-2 font-medium text-sm ${activeChart === 'patients' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Patients
            </button>
            <button
              onClick={() => setActiveChart('appointments')}
              className={`py-3 px-6 text-center border-b-2 font-medium text-sm ${activeChart === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveChart('revenue')}
              className={`py-3 px-6 text-center border-b-2 font-medium text-sm ${activeChart === 'revenue' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Revenue
            </button>
          </nav>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          {activeChart === 'patients' && (
            <div className="text-center">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <FaChartBar className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500">Patient growth chart would be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'appointments' && (
            <div className="text-center">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <FaChartPie className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500">Appointment statistics chart would be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'revenue' && (
            <div className="text-center">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <FaChartLine className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500">Revenue trends chart would be displayed here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAnalytics;
// src/components/patient/HealthMetrics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HealthMetrics = ({ patientData }) => {
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/patients/health-metrics/${patientData._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort by date to ensure chronological order
        const sortedMetrics = response.data.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
        setHealthMetrics(sortedMetrics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching health metrics:', error);
        setLoading(false);
      }
    };

    if (patientData?._id) {
      fetchHealthMetrics();
    }
  }, [patientData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Format data for charts
  const chartData = healthMetrics.map(metric => ({
    date: formatDate(metric.recordedAt),
    bloodPressureSystolic: metric.bloodPressure.systolic,
    bloodPressureDiastolic: metric.bloodPressure.diastolic,
    heartRate: metric.heartRate
  }));

  // Get latest metrics
  const latestMetrics = healthMetrics.length > 0 ? healthMetrics[healthMetrics.length - 1] : null;

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Your Health Metrics</h2>
      </div>

      {healthMetrics.length === 0 ? (
        <div className="p-6 text-center text-gray-600">
          No health metrics recorded yet.
        </div>
      ) : (
        <>
          {/* Latest metrics summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-1">Blood Pressure</h3>
              <p className="text-2xl font-bold text-blue-600">
                {latestMetrics?.bloodPressure.systolic}/{latestMetrics?.bloodPressure.diastolic} mmHg
              </p>
              <p className="text-sm text-gray-500">Last recorded: {new Date(latestMetrics?.recordedAt).toLocaleDateString()}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-1">Heart Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {latestMetrics?.heartRate} BPM
              </p>
              <p className="text-sm text-gray-500">Last recorded: {new Date(latestMetrics?.recordedAt).toLocaleDateString()}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-1">Blood Glucose</h3>
              <p className="text-2xl font-bold text-purple-600">
                {latestMetrics?.bloodGlucose || 'N/A'} mg/dL
              </p>
              <p className="text-sm text-gray-500">Last recorded: {new Date(latestMetrics?.recordedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Blood Pressure Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bloodPressureSystolic" stroke="#8884d8" name="Systolic" />
                  <Line type="monotone" dataKey="bloodPressureDiastolic" stroke="#82ca9d" name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Heart Rate Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="heartRate" stroke="#ff7300" name="Heart Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HealthMetrics;
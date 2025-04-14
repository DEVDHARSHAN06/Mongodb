// src/components/patient/AppointmentHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarCheck, FaCalendarPlus } from 'react-icons/fa';

const AppointmentHistory = ({ patientData }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/patients/appointments/${patientData._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort appointments by date (newest first)
        const sortedAppointments = response.data.sort((a, b) => 
          new Date(b.appointmentDate) - new Date(a.appointmentDate)
        );
        
        setAppointments(sortedAppointments);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch appointments. Please try again later.');
        setLoading(false);
        console.error('Error fetching appointments:', err);
      }
    };

    if (patientData?._id) {
      fetchAppointments();
    }
  }, [patientData]);

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPastAppointment = (dateString) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>;
  }

  // Separate future and past appointments
  const upcomingAppointments = appointments.filter(app => !isPastAppointment(app.appointmentDate));
  const pastAppointments = appointments.filter(app => isPastAppointment(app.appointmentDate));

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Your Appointments</h2>
        <button className="bg-blue-600 text-white flex items-center px-4 py-2 rounded-md hover:bg-blue-700 transition">
          <FaCalendarPlus className="mr-2" />
          Request Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="p-6 text-center text-gray-600">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="p-6">
          {/* Upcoming appointments */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaCalendarCheck className="mr-2 text-blue-600" />
              Upcoming Appointments
            </h3>
            
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-600 italic">No upcoming appointments.</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="border rounded-lg p-4 hover:bg-blue-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">Dr. {appointment.doctorName}</h4>
                        <p className="text-gray-600">{appointment.purpose}</p>
                        <p className="text-gray-600 mt-2">{formatDate(appointment.appointmentDate)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700"><span className="font-medium">Notes:</span> {appointment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Past appointments */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment History</h3>
            
            {pastAppointments.length === 0 ? (
              <p className="text-gray-600 italic">No past appointments.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pastAppointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          Dr. {appointment.doctorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {appointment.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;

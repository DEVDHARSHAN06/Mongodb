import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, isToday } from 'date-fns';
import { FaCalendarAlt, FaUser, FaClock, FaInfoCircle } from 'react-icons/fa';

const AppointmentCalendar = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('day');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch appointments');
        setLoading(false);
        console.error('Error fetching appointments:', err);
      }
    };

    if (doctorId) {
      fetchAppointments();
    }
  }, [doctorId]);

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = parseISO(appointment.dateTime);
    return isToday(appointmentDate);
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            Appointments
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded-md ${view === 'day' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-md ${view === 'week' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded-md ${view === 'month' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              Month
            </button>
          </div>
        </div>
        <div className="mt-4">
          <input
            type="date"
            className="border border-gray-300 rounded-md px-3 py-2"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>
      </div>

      <div className="p-6">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <FaInfoCircle className="mx-auto text-gray-400 text-4xl mb-3" />
            <p className="text-gray-500">No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(appointment => (
              <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <FaUser className="mr-2 text-blue-500" />
                      <h4 className="font-medium">{appointment.patient.name}</h4>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2" />
                      <span>{format(parseISO(appointment.dateTime), 'h:mm a')}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm text-gray-600">{appointment.reason}</p>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View Details
                  </button>
                  <button className="text-sm text-green-600 hover:text-green-800">
                    Start Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCalendar;
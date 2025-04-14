import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaUserInjured, 
  FaCalendarAlt, 
  FaChartLine, 
  FaRobot,
  FaSignOutAlt 
} from 'react-icons/fa';

const DoctorSidebar = ({ activeTab, setActiveTab }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Doctor Portal</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'patients' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FaUserInjured className="mr-3" />
              <span>Patients</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'appointments' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FaCalendarAlt className="mr-3" />
              <span>Appointments</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FaChartLine className="mr-3" />
              <span>Analytics</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'assistant' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FaRobot className="mr-3" />
              <span>AI Assistant</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-md text-red-600 hover:bg-red-50 transition-colors"
        >
          <FaSignOutAlt className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
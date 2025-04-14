// src/components/patient/PatientSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaCalendarCheck, FaHeartbeat, FaNotesMedical, FaRobot, FaSignOutAlt } from 'react-icons/fa';

const PatientSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const menuItems = [
    { id: 'health', label: 'Health Metrics', icon: <FaHeartbeat /> },
    { id: 'treatment', label: 'Treatment Plan', icon: <FaNotesMedical /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarCheck /> },
    { id: 'doctor', label: 'My Doctor', icon: <FaUserMd /> },
    { id: 'chatbot', label: 'VitaLink Assistant', icon: <FaRobot /> },
  ];

  return (
    <div className="w-64 bg-blue-800 text-white h-full flex flex-col">
      <div className="p-5 border-b border-blue-700">
        <h2 className="text-2xl font-bold">VitaLink</h2>
        <p className="text-blue-300 text-sm">Patient Portal</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="mt-6">
          {menuItems.map((item) => (
            <li 
              key={item.id}
              className={`px-5 py-3 flex items-center space-x-3 cursor-pointer hover:bg-blue-700 transition-colors ${activeTab === item.id ? 'bg-blue-700' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="text-blue-300">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 border-t border-blue-700">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-blue-300 hover:text-white w-full"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default PatientSidebar;

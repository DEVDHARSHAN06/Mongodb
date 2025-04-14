import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPills, FaClipboardList, FaNotesMedical, FaExclamationTriangle } from 'react-icons/fa';

const TreatmentPlan = ({ patientData }) => {
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTreatmentPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/patients/treatment-plan/${patientData._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTreatmentPlan(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch treatment plan. Please try again later.');
        setLoading(false);
        console.error('Error fetching treatment plan:', err);
      }
    };

    if (patientData?._id) {
      fetchTreatmentPlan();
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

  if (!treatmentPlan) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No treatment plan available. Please consult with your doctor.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Your Treatment Plan</h2>
        <p className="text-gray-600">Last updated: {new Date(treatmentPlan.updatedAt).toLocaleDateString()}</p>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaClipboardList className="text-blue-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold">Diagnosis</h3>
          </div>
          <p className="text-gray-800 bg-blue-50 p-4 rounded-md">{treatmentPlan.diagnosis}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaPills className="text-green-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold">Medications</h3>
          </div>
          
          {treatmentPlan.medications.length === 0 ? (
            <p className="text-gray-600 italic">No medications prescribed.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {treatmentPlan.medications.map((med, index) => (
                <div key={index} className="border rounded-md p-4 bg-green-50">
                  <h4 className="font-medium text-green-800">{med.name}</h4>
                  <p className="text-sm text-gray-700 mt-1">Dosage: {med.dosage}</p>
                  <p className="text-sm text-gray-700">Frequency: {med.frequency}</p>
                  <p className="text-sm text-gray-700">Duration: {med.duration}</p>
                  {med.instructions && (
                    <p className="text-sm text-gray-700 mt-2 italic">Instructions: {med.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaNotesMedical className="text-purple-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold">Instructions</h3>
          </div>
          <div className="bg-purple-50 p-4 rounded-md">
            <p className="text-gray-800 whitespace-pre-line">{treatmentPlan.instructions}</p>
          </div>
        </div>

        {treatmentPlan.precautions && treatmentPlan.precautions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-amber-600 mr-2" size={20} />
              <h3 className="text-lg font-semibold">Precautions</h3>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              {treatmentPlan.precautions.map((precaution, index) => (
                <li key={index} className="text-gray-800">{precaution}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            If you have any questions about your treatment plan, please contact your doctor or use the VitaLink Assistant.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlan;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRobot, FaUser, FaPaperPlane, FaSpinner, FaStethoscope, FaPills, FaCalendarCheck } from 'react-icons/fa';

const DoctorChatbot = ({ doctorId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        content: 'Hello Doctor! I am your VitaLink AI Assistant. How can I help you today? I can assist with patient information, medical references, or appointment scheduling.',
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const userMessage = {
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/chatbot/doctor', 
        {
          message: inputMessage,
          doctorId: doctorId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const botMessage = {
        sender: 'bot',
        content: response.data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      const errorMessage = {
        sender: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full max-h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <FaRobot className="text-blue-600 mr-3" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Doctor Assistant</h2>
            <p className="text-sm text-gray-600">AI-powered assistant for medical professionals</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-3/4 rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.sender === 'user' ? (
                    <FaUser className="mr-2 text-blue-200" size={12} />
                  ) : (
                    <FaRobot className="mr-2 text-blue-600" size={12} />
                  )}
                  <span className={`text-xs ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center">
                <FaSpinner className="animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Processing your request...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => handleQuickQuestion("What's my schedule for tomorrow?")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs p-2 rounded flex items-center justify-center"
          >
            <FaCalendarCheck className="mr-1" /> Schedule
          </button>
          <button
            onClick={() => handleQuickQuestion("Show patient John Doe's medical history")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs p-2 rounded flex items-center justify-center"
          >
            <FaUser className="mr-1" /> Patient Info
          </button>
          <button
            onClick={() => handleQuickQuestion("What are the latest treatments for diabetes?")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs p-2 rounded flex items-center justify-center"
          >
            <FaStethoscope className="mr-1" /> Treatment Info
          </button>
          <button
            onClick={() => handleQuickQuestion("Show interactions between metformin and aspirin")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs p-2 rounded flex items-center justify-center"
          >
            <FaPills className="mr-1" /> Drug Interactions
          </button>
          <button
            onClick={() => handleQuickQuestion("What are the symptoms of COVID-19?")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs p-2 rounded flex items-center justify-center"
          >
            <FaFileMedical className="mr-1" /> Symptoms
          </button>
          <button
            onClick={() => handleQuickQuestion("Create a prescription for ibuprofen")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs p-2 rounded flex items-center justify-center"
          >
            <FaPills className="mr-1" /> Prescription
          </button>
        </div>

        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`bg-blue-600 text-white rounded-r-lg px-4 flex items-center justify-center ${
              isLoading || !inputMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isLoading || !inputMessage.trim()}
          >
            <FaPaperPlane />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          This assistant can access patient records, medical references, and your schedule.
        </p>
      </div>
    </div>
  );
};

export default DoctorChatbot;
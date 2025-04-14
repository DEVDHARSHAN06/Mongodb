import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from 'react-icons/fa';

const PatientChatbot = ({ patientId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Add welcome message when component mounts
  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        content: 'Hello! I am your VitaLink Assistant. How can I help you today? You can ask about your medications, appointments, or general health information.',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto scroll to bottom of messages
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
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/chatbot', 
        {
          message: userMessage.content,
          patientId: patientId
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
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      const errorMessage = {
        sender: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-xl font-bold text-gray-800">VitaLink Assistant</h2>
            <p className="text-sm text-gray-600">Ask me about your health information, medications, or appointments</p>
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
          This assistant can access your medical records and provide information about your health, medications, and appointments.
        </p>
      </div>
    </div>
  );
};

export default PatientChatbot;
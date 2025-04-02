import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addConnections } from '../utils/connectionSlice';
import { Link, useNavigate } from 'react-router-dom';

function Connections() {
  const connections = useSelector((store) => store.connections);
  const user = useSelector((store) => store.user); // Access user data
  const premium = useSelector((store) => store.premium); // Access premium state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false); // State for premium modal

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/user/connetions`, { withCredentials: true });
      dispatch(addConnections(res.data.data));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      setError("Failed to load your connections. Please try again later.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleMessageClick = (connectionId) => {
    if (premium.isPremium) {
      navigate(`/chat/${connectionId}`); // Navigate to chat if the user is premium
    } else {
      setShowPremiumModal(true); // Show premium modal for non-premium users
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your connections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-xl border border-red-100">
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">{error}</h2>
          <button 
            onClick={fetchConnections}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center p-10 max-w-md bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="mb-6 text-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Connections Yet</h1>
          <p className="text-gray-600 mb-8">Start connecting with people to build your network.</p>
          <Link to={'/'} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg">
            Find New Connections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6">
            <h1 className="text-2xl font-bold text-white">Your Connections</h1>
            <p className="text-purple-100 mt-1">People you've connected with</p>
          </div>
          
          <div className="divide-y divide-gray-100">
          {connections.map((connection) => {
  const {_id, firstName, lastName, photoUrl } = connection;
  return (
    <div key={_id} className="p-6 hover:bg-gray-50 transition duration-200">
      <div className="flex items-center space-x-6">
        {/* User Avatar */}
        {photoUrl ? (
          <img
            src={photoUrl}
            className="w-16 h-16 rounded-full object-cover border-4 border-purple-100 shadow-md"
            alt={`${firstName}'s profile`}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold border-4 border-purple-100 shadow-md">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </div>
        )}
        {/* User Details */}
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{firstName} {lastName}</h3>
          <p className="text-gray-500 mb-4">Connected with you</p>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* View Profile Button */}
            <button className="flex items-center text-gray-700 hover:text-purple-700 font-medium bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg transition duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Profile
            </button>
            {/* Message Button */}
            <button
              onClick={() => handleMessageClick(_id)}
              className="flex items-center text-white font-medium bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-lg transition duration-200 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
})}
          </div>
        </div>
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-72 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2">
              <h3 className="text-base font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Premium Feature
              </h3>
            </div>
            <div className="p-3">
              <p className="text-gray-700 text-xs">Messaging is a premium feature.</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button 
                onClick={() => setShowPremiumModal(false)} 
                className="flex-1 px-3 py-2 text-gray-600 text-xs font-medium"
              >
                Close
              </button>
              <Link 
                to="/premium" 
                className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium text-center"
                onClick={() => setShowPremiumModal(false)}
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Connections;
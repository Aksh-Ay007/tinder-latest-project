import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addRequests, removeRequest } from '../utils/requestSlice';
import { Link } from 'react-router-dom';

function Requests() {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const fetchRequest = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/user/requests/recieved`, { withCredentials: true });
      dispatch(addRequests(res.data.data));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      setError("Failed to load your connection requests. Please try again later.");
      setIsLoading(false);
    }
  };

  // Function to refresh the request count in navbar
  const refreshRequestCount = async () => {
    try {
      // This will trigger a re-fetch in any component that subscribes to this event
      const event = new CustomEvent('refreshRequestCount');
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error refreshing request count:", error);
    }
  };

  const reviewRequest = async (status, _id, firstName) => {
    try {
      await axios.post(`${BASE_URL}/request/review/${status}/${_id}`, {}, {withCredentials: true});
      dispatch(removeRequest(_id));
      
      // Show notification
      const message = status === "accepted" 
        ? `You're now connected with ${firstName}!` 
        : `Request from ${firstName} has been declined.`;
      
      setNotification({
        show: true,
        message: message,
        type: status === "accepted" ? "success" : "info"
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
      
      // Refresh the count in the navbar
      refreshRequestCount();
    } catch (error) {
      console.error("Failed to review request:", error);
      setError("Failed to process the request. Please try again later.");
      setNotification({
        show: true,
        message: "There was a problem processing your request. Please try again.",
        type: "error"
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);
    
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your requests...</p>
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
            onClick={fetchRequest}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center p-10 max-w-md bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="mb-6 text-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Connection Requests</h1>
          <p className="text-gray-600 mb-8">You don't have any pending connection requests at the moment.</p>
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg">
            Find New Connections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-8 relative">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 max-w-md shadow-lg rounded-lg overflow-hidden transition-all transform animate-slide-in-top`}>
          <div className={`flex items-center p-4 ${
            notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 
            notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
            'bg-blue-50 border-l-4 border-blue-500'
          }`}>
            <div className={`flex-shrink-0 mr-4 ${
              notification.type === 'success' ? 'text-green-500' : 
              notification.type === 'error' ? 'text-red-500' :
              'text-blue-500'
            }`}>
              {notification.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-grow">
              <p className={`font-medium ${
                notification.type === 'success' ? 'text-green-800' : 
                notification.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {notification.message}
              </p>
            </div>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6">
            <h1 className="text-2xl font-bold text-white">Connection Requests</h1>
            <p className="text-purple-100 mt-1">People who want to connect with you</p>
          </div>
          
          <div className="divide-y divide-gray-100">
          {requests.map((request, index) => {
  const { firstName, lastName, photoUrl } = request.fromUserId;
  return (
    <div key={index} className="p-6 hover:bg-gray-50 transition duration-200">
      <div className="flex items-center space-x-6">
        {/* User Avatar */}
        {photoUrl ? (
          <img
            src={photoUrl}
            className="w-20 h-20 rounded-full object-cover border-4 border-purple-100 shadow-md"
            alt={`${firstName}'s profile`}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold border-4 border-purple-100 shadow-md">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </div>
        )}
        {/* User Details */}
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{firstName} {lastName}</h3>
          <p className="text-gray-500 mb-4">Wants to connect with you</p>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* View Profile Button */}
            <Link 
              to={'/userProfile'} 
              className="flex items-center text-gray-700 hover:text-purple-700 font-medium bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Profile
            </Link>
            {/* Accept Button */}
            <button 
              className="flex items-center text-white font-medium bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg transition duration-200 shadow-md"
              onClick={() => reviewRequest("accepted", request._id, firstName)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Accept
            </button>
            {/* Ignore Button */}
            <button 
              className="flex items-center text-white font-medium bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg transition duration-200 shadow-md"
              onClick={() => reviewRequest("rejected", request._id, firstName)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
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
    </div>
  );
}

export default Requests;
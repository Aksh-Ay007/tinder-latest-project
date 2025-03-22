import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addConnections } from '../utils/connectionSlice';

function Connections() {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-20 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchConnections}
            className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 font-medium py-1 px-4 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Connections Yet</h1>
          <p className="text-gray-600 mb-6">Start browsing profiles to make new connections!</p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300">
            Find Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Your Connections</h1>
      
      <div className="bg-white rounded-lg shadow">
        <ul className="divide-y divide-gray-200">
          {connections.map((connection, index) => {
            const { firstName, lastName, photoUrl } = connection;
            
            return (
              <li key={index} className="py-3 px-4 hover:bg-gray-50 transition duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        className="w-10 h-10 rounded-full object-cover"
                        alt={`${firstName}'s profile`} 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
                        {firstName.charAt(0)}{lastName.charAt(0)}
                      </div>
                    )}
                    
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{firstName} {lastName}</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <button className="text-gray-500 hover:text-purple-600 p-1" title="Message">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    <button className="text-gray-500 hover:text-purple-600 p-1 ml-2" title="View Profile">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Connections; 
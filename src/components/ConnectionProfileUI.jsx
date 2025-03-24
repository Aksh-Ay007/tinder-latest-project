import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../utils/constants";
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { motion } from 'framer-motion';
import { removeUserFromFeed } from '../utils/feedSlice';

import { toast } from 'react-toastify';


export default function ConnectionProfileUI() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  const fetchUserProfile = async () => {
    
    if (!userId) {
      setError("User ID not provided");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/userProfile/${userId}`, { withCredentials: true });
      setUser(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Error fetching profile");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);


  const handleSendRequest = async (status) => {
    try {
      await axios.post(`${BASE_URL}/request/send/${status}/${userId}`, {}, { withCredentials: true });
      
      if (status === 'interested') {
        toast.success(`Connection request sent to ${firstName} ${lastName} successfully!`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setRequestStatus('Connected');
      } else {
        toast.info(`You have successfully skipped ${firstName} ${lastName}. Maybe next time!`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setRequestStatus('Skipped');
      }
      
      dispatch(removeUserFromFeed(userId));
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      toast.error('Failed to send connection request. Please try again later.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setRequestStatus('Error');
      console.error("Error sending request:", error);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No user found</p>
      </div>
    );
  }

  const { _id,firstName, lastName, photoUrl, bio, age, skills, hobby } = user;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50"
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-40 relative shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Bondify <span className="text-red-500">❤</span></h1>
          <div className="flex space-x-6">
            <button onClick={() => navigate('/feed')} className="text-white hover:text-pink-200 transition">Discover</button>
            <button className="text-white hover:text-pink-200 transition">Connections</button>
            <button className="text-white hover:text-pink-200 transition">Messages</button>
          </div>
          <button onClick={() => navigate('/profile')} className="flex items-center">
            <span className="text-white mr-2">{firstName}</span>
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
                  {firstName?.charAt(0)}
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="bg-white rounded-2xl shadow-2xl p-6 -mt-12 relative z-10 overflow-hidden"
        >
          {/* Background Gradient Overlay */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white">
                  {firstName?.charAt(0)}{lastName?.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{firstName} {lastName}</h2>
              <p className="text-gray-600 text-lg">{age} years old</p>
              <div className="mt-3">
                {requestStatus ? (
                  <div className={`
                    font-medium px-4 py-2 rounded-full text-sm
                    ${requestStatus === 'Connected' ? 'bg-green-100 text-green-800' : 
                      requestStatus === 'Skipped' ? 'bg-gray-100 text-gray-800' : 
                      'bg-red-100 text-red-800'}
                  `}>
                    {requestStatus === 'Connected' ? 'Connected ✓' : 
                     requestStatus === 'Skipped' ? 'Skipped' : 
                     'Request Failed'}
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendRequest('interested',_id)} 
                      className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm hover:bg-purple-700 transition flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Connect</span>
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendRequest('ignored',_id)}
                      className="bg-gray-200 text-gray-800 px-5 py-2 rounded-full text-sm hover:bg-gray-300 transition flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Skip</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {bio && (
            <div className="mb-6 bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-purple-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                About Me
              </h3>
              <p className="text-gray-700 italic">{bio}</p>
            </div>
          )}
          
          {skills && skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-purple-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {hobby && hobby.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hobbies
              </h3>
              <div className="flex flex-wrap gap-2">
                {hobby.map((item, index) => (
                  <span key={index} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../utils/constants";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addFeed } from '../utils/feedSlice';
import UserCard from './UserCard';
import { motion, AnimatePresence } from 'framer-motion';

function Feed() {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const getFeed = async () => {
    if (feed && feed.length > 0) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/feed`, { withCredentials: true });
      dispatch(addFeed(res?.data?.data));
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    getFeed();
  }, []);

  const handleSwipeComplete = () => {
    // Move to the next card
    setCurrentIndex(prevIndex => prevIndex + 1);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center mt-12 py-6 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!feed || feed.length <= 0 || currentIndex >= feed.length) {
    return (
      <div className="flex justify-center items-center mt-12 py-6 w-full px-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 max-w-md w-full"
        >
          <div className="h-48 w-full overflow-hidden bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No New Connections</h2>
            <p className="text-gray-700 mb-6">
              We couldn't find any new users for you at the moment. Check back soon for new potential connections.
            </p>
            
            <div className="flex justify-between items-center">
              <button 
                onClick={() => {
                  setCurrentIndex(0);
                  getFeed();
                }}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium py-2 px-4 rounded-full text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              
              <button className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium py-2 px-4 rounded-full text-sm">
                Explore Users
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Render card stack with the current user and the next 2 visible in the stack
  return (
    <div className="flex justify-center mt-12 py-6 w-full max-w-md mx-auto px-4">
      <div className="relative w-full h-[520px]">
        {/* Show a stack of up to 3 cards */}
        <AnimatePresence>
          {feed.slice(currentIndex, currentIndex + 3).map((user, index) => (
            <div key={user._id} className="absolute w-full" style={{ zIndex: 10 - index }}>
              {index === 0 ? (
                <UserCard 
                  user={user} 
                  onSwipeComplete={handleSwipeComplete}
                />
              ) : (
                <motion.div 
                  initial={{ scale: 1 - index * 0.05, y: index * 10 }}
                  animate={{ scale: 1 - index * 0.05, y: index * 10 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden w-full opacity-60"
                >
                  {/* Simplified preview card */}
                  <div className="relative">
                    <div className="h-56 w-full overflow-hidden">
                      {user.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-400 to-indigo-500">
                          <span className="text-5xl font-bold text-white">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    </div>
                  </div>
                  <div className="h-64 bg-white"></div>
                </motion.div>
              )}
            </div>
          ))}
        </AnimatePresence>

        {/* Swipe instruction at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md"
          >
            <p className="text-xs text-gray-600 flex items-center">
              <span className="text-red-500 mr-2">←</span>
              Swipe to ignore or show interest
              <span className="text-green-500 ml-2">→</span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Feed;
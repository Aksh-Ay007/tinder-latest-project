import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from '../utils/feedSlice';
import { Link } from "react-router-dom";

function UserCard({ user, onSwipeComplete }) {
  const {_id, firstName, lastName, photoUrl, bio, age, skills, hobby } = user;
  const dispatch = useDispatch();
  
  // For swipe functionality
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Visual feedback based on swipe direction
  const background = useTransform(
    x, 
    [-200, 0, 200], 
    ["rgba(255, 0, 0, 0.2)", "rgba(255, 255, 255, 0)", "rgba(0, 255, 0, 0.2)"]
  );

  const handleSendRequest = async(status, userId) => {
    try {
      await axios.post(BASE_URL + "/request/send/" + status + "/" + userId, {}, {withCredentials: true});
      dispatch(removeUserFromFeed(userId));
      if (onSwipeComplete) onSwipeComplete();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) {
      setExitX(200);
      setTimeout(() => {
        handleSendRequest("interested", _id);
      }, 200);
    } else if (info.offset.x < -100) {
      setExitX(-200);
      setTimeout(() => {
        handleSendRequest("ignored", _id);
      }, 200);
    }
  };

  return (
    <motion.div 
      className="absolute w-full"
      style={{ x, rotate, background }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      exit={{ opacity: 0 }}
      whileTap={{ scale: 1.05 }}
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-sm transition duration-300 hover:translate-y-[-4px]">
        {/* Profile Image Section */}
        <div className="relative">
          <div className="h-56 w-full overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-400 to-indigo-500">
                <span className="text-5xl font-bold text-white">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </span>
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>

          {/* Name and age positioned over the image */}
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold tracking-tight">{firstName} {lastName}</h2>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-base font-medium">{age ? `${age} years` : "Age not specified"}</p>
            </div>
          </div>
        </div>

        {/* Bio and details section */}
        <div className="p-4">
          {/* Bio with styled quote marks */}
          <div className="relative mb-4">
            <svg className="absolute -top-2 -left-1 h-6 w-6 text-purple-200 opacity-50" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="text-gray-700 pl-5 text-sm">
              {bio || "No bio available"}
            </p>
          </div>

          {/* Skills and Hobbies */}
          <div className="space-y-3 mb-4">
            {skills && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Skills</h3>
                  <p className="text-gray-700 text-sm">{skills}</p>
                </div>
              </div>
            )}
            
            {hobby && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Hobbies</h3>
                  <p className="text-gray-700 text-sm">{hobby}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons and swipe instructions */}
          <div className="flex justify-between items-center">
            <button 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-red-400 text-red-500 shadow-md hover:bg-red-50 transition-all duration-300 transform hover:scale-110" 
              onClick={() => {
                setExitX(-200);
                setTimeout(() => handleSendRequest("ignored", _id), 200);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <Link 
  to="/userProfile" 
  state={{ userId: _id }} 
  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-full text-xs shadow-md hover:shadow-lg transition duration-300"
>
  View Profile
</Link>
            <button 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-green-400 text-green-500 shadow-md hover:bg-green-50 transition-all duration-300 transform hover:scale-110" 
              onClick={() => {
                setExitX(200);
                setTimeout(() => handleSendRequest("interested", _id), 200);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          
          {/* Swipe instruction */}
          <div className="mt-3 flex justify-center">
            <p className="text-xs text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Swipe or tap to decide
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default UserCard;
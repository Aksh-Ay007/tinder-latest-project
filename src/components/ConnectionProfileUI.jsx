import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../utils/constants";
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ConnectionProfileUI() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, requestStatus, requestId } = location.state || {};

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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

  const handleRequestAction = async (action) => {
    try {
      await axios.post(`${BASE_URL}/request/review/${action}/${requestId}`, {}, { withCredentials: true });

      toast.success(
        action === "accepted"
          ? "You are now connected!"
          : "You have rejected the connection request.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );

      setTimeout(() => {
        navigate('/requests');
      }, 1500);
    } catch (error) {
      toast.error("Failed to process the request. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Error processing request:", error);
    }
  };

  const nextPhoto = () => {
    if (user?.photos && user.photos.length > 0) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % user.photos.length);
    }
  };

  const prevPhoto = () => {
    if (user?.photos && user.photos.length > 0) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + user.photos.length) % user.photos.length);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

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

  const { firstName, lastName, photoUrl, bio, age, skills, hobby, photos } = user;

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
          <button onClick={() => navigate('/requests')} className="text-white hover:text-pink-200 transition">Back to Requests</button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="bg-white rounded-2xl shadow-2xl p-6 -mt-12 relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>

          <div className="flex flex-col md:flex-row">
            {/* Left Side - User Info */}
            <div className="flex-1 md:pr-6">
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white">
                      {firstName?.charAt(0)}{lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{firstName} {lastName}</h2>
                  <p className="text-gray-600 text-lg">{age} years old</p>
                  <div className="mt-3">
                    {requestStatus === "pending" ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRequestAction("accepted")}
                          className="bg-green-500 text-white px-5 py-2 rounded-full text-sm hover:bg-green-600 transition flex items-center space-x-2"
                        >
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRequestAction("rejected")}
                          className="bg-red-500 text-white px-5 py-2 rounded-full text-sm hover:bg-red-600 transition flex items-center space-x-2"
                        >
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">This user is already connected or not in a pending state.</p>
                    )}
                  </div>
                </div>
              </div>

              {bio && (
                <div className="mb-6 bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-purple-800">About Me</h3>
                  <p className="text-gray-700 italic">{bio}</p>
                </div>
              )}

              {skills && skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-purple-800">Skills</h3>
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
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-purple-800">Hobbies</h3>
                  <div className="flex flex-wrap gap-2">
                    {hobby.map((item, index) => (
                      <span key={index} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Photos Gallery/Slideshow */}
            {photos && photos.length > 0 && (
              <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                className="md:w-1/3 mt-6 md:mt-0"
              >
                <h3 className="text-lg font-semibold mb-3 text-purple-800">Photos</h3>
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <div className="aspect-w-3 aspect-h-4 bg-gray-100">
                    <img 
                      src={photos[currentPhotoIndex].url} 
                      alt={`Photo ${currentPhotoIndex + 1}`}
                      className="w-full h-64 object-cover" 
                    />
                  </div>
                  
                  {/* Navigation buttons */}
                  <button 
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow-md hover:bg-white transition"
                    aria-label="Previous photo"
                  >
                    ◀
                  </button>
                  <button 
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow-md hover:bg-white transition"
                    aria-label="Next photo"
                  >
                    ▶
                  </button>
                  
                  {/* Photo counter */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {currentPhotoIndex + 1} / {photos.length}
                  </div>
                </div>
                
                {/* Thumbnails */}
                <div className="mt-3 flex justify-center gap-2 overflow-x-auto py-2">
                  {photos.map((photo, index) => (
                    <div 
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer transition ${
                        currentPhotoIndex === index ? 'ring-2 ring-purple-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={photo.url} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
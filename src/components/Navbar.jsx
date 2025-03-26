import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

function Navbar() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [newRequestPopup, setNewRequestPopup] = useState({ show: false, user: null });
  const notificationAudioRef = useRef(null);
  const prevRequestCountRef = useRef(requestCount);
  const notificationShownRef = useRef(false);

  // Fetch pending request count and connection count
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/requests/count`, { withCredentials: true });
        
        // Only check for new requests if user has seen previous notifications
        if (!notificationShownRef.current && 
            response.data.pendingRequests > prevRequestCountRef.current) {
          console.log("New request detected!");
          
          // Play notification sound
          playNotificationSound();
          
          // Fetch the latest request to show in the popup
          fetchLatestRequest();
          
          // Mark that we've shown a notification
          notificationShownRef.current = true;
          
          // Reset notification flag after a reasonable time (5 minutes)
          setTimeout(() => {
            notificationShownRef.current = false;
          }, 300000); // 5 minutes
        }
        
        // Update state and ref
        setRequestCount(response.data.pendingRequests);
        prevRequestCountRef.current = response.data.pendingRequests;
        setConnectionCount(response.data.connections);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    const handleRefreshCount = () => {
      fetchCounts();
    };

    if (user) {
      fetchCounts();
      
      // Set up polling for new requests - check more frequently
      const pollInterval = setInterval(() => {
        console.log("Polling for new requests in navbar");
        fetchCounts();
      }, 15000); // Check every 15 seconds
      
      // Listen for the custom event triggered by Requests component
      window.addEventListener('refreshRequestCount', handleRefreshCount);
      
      return () => {
        window.removeEventListener('refreshRequestCount', handleRefreshCount);
        clearInterval(pollInterval);
      };
    }
  }, [user]);

  // Function to fetch the latest request for popup
  const fetchLatestRequest = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/recieved`, { withCredentials: true });
      
      if (res.data.data && res.data.data.length > 0) {
        // Get the newest request (assuming first in the array)
        const newestRequest = res.data.data[0];
        
        console.log("Latest request data:", newestRequest); // Debugging
        
        // If we have the complete user object already
        if (newestRequest.fromUser) {
          showRequestPopup(newestRequest.fromUser);
        } 
        // If the API gives us the sender's user ID, fetch their details
        else if (newestRequest.fromUserId) {
          try {
            console.log("Fetching user details for ID:", newestRequest.fromUserId);
            const userRes = await axios.get(`${BASE_URL}/user/${newestRequest.fromUserId}`, { withCredentials: true });
            
            if (userRes.data) {
              showRequestPopup(userRes.data);
            }
          } catch (userError) {
            console.error("Failed to fetch user details:", userError);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch the latest request:", error);
    }
  };
  
  // Helper function to show the request popup with user data
  const showRequestPopup = (userData) => {
    console.log("Showing popup for user:", userData);
    
    // Show popup notification for the new request
    setNewRequestPopup({
      show: true,
      user: userData
    });
    
    // Hide popup after 8 seconds
    setTimeout(() => {
      setNewRequestPopup({ show: false, user: null });
    }, 8000);
  };

  // Function to play notification sound
  const playNotificationSound = () => {
    if (notificationAudioRef.current) {
      console.log("Attempting to play notification sound");
      notificationAudioRef.current.currentTime = 0; // Reset to start
      notificationAudioRef.current.volume = 1.0; // Ensure volume is up
      const playPromise = notificationAudioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Error playing notification sound:", err);
          // Try playing again after user interaction
          document.addEventListener('click', function playOnClick() {
            notificationAudioRef.current.play().catch(e => console.error("Still can't play:", e));
            document.removeEventListener('click', playOnClick);
          }, { once: true });
        });
      }
    } else {
      console.warn("Audio reference is not available");
    }
  };

  // Enable audio after user interaction (browser requirement)
  useEffect(() => {
    console.log("Audio element initialized:", notificationAudioRef.current);
    
    // Pre-load audio
    if (notificationAudioRef.current) {
      notificationAudioRef.current.load();
    }
    
    // Allow user to enable audio with first interaction (needed for some browsers)
    const enableAudio = () => {
      console.log("User interaction detected, enabling audio");
      if (notificationAudioRef.current) {
        notificationAudioRef.current.muted = false;
        notificationAudioRef.current.play().then(() => {
          notificationAudioRef.current.pause();
          notificationAudioRef.current.currentTime = 0;
          console.log("Audio enabled successfully");
        }).catch(err => {
          console.error("Failed to enable audio:", err);
        });
      }
      document.removeEventListener('click', enableAudio);
    };
    
    document.addEventListener('click', enableAudio);
    return () => {
      document.removeEventListener('click', enableAudio);
    };
  }, []);

  // For testing purposes - manually trigger notification
  const testNotification = () => {
    const testUser = {
      firstName: "Test",
      lastName: "User",
      photoUrl: null
    };
    showRequestPopup(testUser);
    playNotificationSound();
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      {/* Notification sound audio element */}
      <audio ref={notificationAudioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/src/sounds/notification.mp3" type="audio/mpeg" />
        {/* Fallback text */}
        Your browser does not support the audio element.
      </audio>
      
      {/* New Request Popup - with improved checks */}
      {newRequestPopup.show && newRequestPopup.user && (
        <div className="fixed top-16 right-4 z-50 max-w-sm animate-bounce-in">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-purple-100">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
              <h3 className="text-lg font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                New Connection Request
              </h3>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-4">
                {newRequestPopup.user.photoUrl ? (
                  <img 
                    src={newRequestPopup.user.photoUrl} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-100"
                    alt={`${newRequestPopup.user.firstName}'s profile`} 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                    {newRequestPopup.user.firstName?.charAt(0)}{newRequestPopup.user.lastName?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{newRequestPopup.user.firstName} {newRequestPopup.user.lastName}</p>
                  <p className="text-sm text-gray-500">wants to connect with you</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  onClick={() => setNewRequestPopup({ show: false, user: null })}
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Later
                </button>
                <button 
                  onClick={() => {
                    setNewRequestPopup({ show: false, user: null });
                    // Navigate to requests page and trigger a refresh
                    navigate('/requests');
                    window.dispatchEvent(new CustomEvent('refreshRequests'));
                  }}
                  className="px-4 py-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to={'/'} 
          className="text-xl sm:text-2xl font-bold flex items-center gap-2 bg-white text-purple-600 px-4 py-1 rounded-full shadow-md hover:bg-purple-50 transition duration-300"
        >
          <span className="flex items-center">
            Bondify
            <span className="text-pink-500 ml-1">❤️</span>
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-pink-200 transition duration-300">Premium <Mmbership></Mmbership></Link>
          <Link to="/connections" className="hover:text-pink-200 transition duration-300 relative">
            Connections
            {connectionCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {connectionCount}
              </span>
            )}
          </Link>
          <Link to="/messages" className="hover:text-pink-200 transition duration-300">Messages</Link>
        </div>

        {/* Profile Section */}
        {user && (
          <div className="flex items-center gap-4">
            <p className="text-lg hidden sm:block font-medium">
              <span className="font-semibold">{user.firstName}</span>
            </p>
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full border-2 border-white hover:border-pink-200 transition-all duration-300 overflow-hidden">
                  {user.photoUrl ? (
                    <img
                      alt="User profile"
                      src={user.photoUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-lg">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Show request count ONLY when dropdown is closed */}
                {!isDropdownOpen && requestCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {requestCount}
                  </span>
                )}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-800">{user.email}</p>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                    onClick={closeDropdown}
                  >
                    <div className="flex justify-between items-center">
                      <span>Your Profile</span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">New</span>
                    </div>
                  </Link>
                  
                  {/* Requests in dropdown menu */}
                  <Link 
                    to="/requests" 
                    className="relative block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                    onClick={() => {
                      closeDropdown();
                      // Trigger refresh when navigating to requests
                      window.dispatchEvent(new CustomEvent('refreshRequests'));
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span>Requests</span>
                      {requestCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {requestCount}
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  <Link 
                    to="/connections" 
                    className="relative block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                    onClick={closeDropdown}
                  >
                    <div className="flex justify-between items-center">
                      <span>Connections</span>
                      {connectionCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {connectionCount}
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button 
                      onClick={() => {
                        handleLogout();
                        closeDropdown();
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 transition duration-150"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login/Register for non-authenticated users */}
        {!user && (
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="px-4 py-1 border border-white text-white rounded-full hover:bg-white hover:text-purple-600 transition duration-300"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-1 bg-white text-purple-600 rounded-full hover:bg-purple-50 transition duration-300"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
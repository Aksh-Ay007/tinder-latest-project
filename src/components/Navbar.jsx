import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

function Navbar() {
  const user = useSelector((store) => store.user);
  const premium = useSelector((store) => store.premium);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [newRequestPopup, setNewRequestPopup] = useState({
    show: false,
    user: null,
  });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const notificationAudioRef = useRef(null);
  const prevRequestCountRef = useRef(requestCount);
  const notificationShownRef = useRef(false);

  // Fetch pending request count, connection count, and unread message count
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/requests/count`, {
          withCredentials: true,
        });

        // Only check for new requests if user has seen previous notifications
        if (
          !notificationShownRef.current &&
          response.data.pendingRequests > prevRequestCountRef.current
        ) {
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

        // Fetch unread message count
        const messageResponse = await axios.get(`${BASE_URL}/messages/count`, {
          withCredentials: true,
        });
        setMessageCount(messageResponse.data.unreadMessages || 0);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    const handleRefreshCount = () => {
      fetchCounts();
    };

    if (user) {
      fetchCounts();

      // Set up polling for new requests and messages
      const pollInterval = setInterval(() => {
        fetchCounts();
      }, 15000); // Check every 15 seconds

      // Listen for the custom event triggered by Requests component
      window.addEventListener("refreshRequestCount", handleRefreshCount);

      return () => {
        window.removeEventListener("refreshRequestCount", handleRefreshCount);
        clearInterval(pollInterval);
      };
    }
  }, [user]);

  // Function to fetch the latest request for popup
  const fetchLatestRequest = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/recieved`, {
        withCredentials: true,
      });

      if (res.data.data && res.data.data.length > 0) {
        const newestRequest = res.data.data[0];

        if (newestRequest.fromUser) {
          showRequestPopup(newestRequest.fromUser);
        } else if (newestRequest.fromUserId) {
          try {
            const userRes = await axios.get(
              `${BASE_URL}/user/${newestRequest.fromUserId}`,
              {
                withCredentials: true,
              }
            );

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
    setNewRequestPopup({
      show: true,
      user: userData,
    });

    setTimeout(() => {
      setNewRequestPopup({ show: false, user: null });
    }, 8000);
  };

  // Function to play notification sound
  const playNotificationSound = () => {
    if (notificationAudioRef.current) {
      notificationAudioRef.current.currentTime = 0;
      notificationAudioRef.current.volume = 1.0;
      const playPromise = notificationAudioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("Error playing notification sound:", err);
          document.addEventListener(
            "click",
            function playOnClick() {
              notificationAudioRef.current
                .play()
                .catch((e) => console.error("Still can't play:", e));
              document.removeEventListener("click", playOnClick);
            },
            { once: true }
          );
        });
      }
    } else {
      console.warn("Audio reference is not available");
    }
  };

  // Enable audio after user interaction (browser requirement)
  useEffect(() => {
    if (notificationAudioRef.current) {
      notificationAudioRef.current.load();
    }

    const enableAudio = () => {
      if (notificationAudioRef.current) {
        notificationAudioRef.current.muted = false;
        notificationAudioRef.current
          .play()
          .then(() => {
            notificationAudioRef.current.pause();
            notificationAudioRef.current.currentTime = 0;
          })
          .catch((err) => {
            console.error("Failed to enable audio:", err);
          });
      }
      document.removeEventListener("click", enableAudio);
    };

    document.addEventListener("click", enableAudio);
    return () => {
      document.removeEventListener("click", enableAudio);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
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

  const handleMessagesClick = () => {
    if (user?.isPremium) {  // Use the isPremium field from the user object
      navigate("/messages");
    } else {
      setShowPremiumModal(true);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      <audio ref={notificationAudioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/src/sounds/notification.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-72 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2">
              <h3 className="text-base font-bold text-white flex items-center">
                Premium Feature
              </h3>
            </div>
            <div className="p-3">
              <p className="text-gray-700 text-xs">
                Messaging is a premium feature.
              </p>
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

      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to={"/"}
          className="text-xl sm:text-2xl font-bold flex items-center gap-2 bg-white text-purple-600 px-4 py-1 rounded-full shadow-md hover:bg-purple-50 transition duration-300"
        >
         Connectia
        </Link>

        {user && (
          <div className="flex items-center space-x-6">
            <Link
              to="/premium"
              className="hover:text-pink-200 transition duration-300"
            >
              Premium
            </Link>
            <button
              onClick={handleMessagesClick}
              className="relative hover:text-pink-200 transition duration-300"
            >
              Messages
              {messageCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {messageCount}
                </span>
              )}
            </button>
          </div>
        )}

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
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-800">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                    onClick={closeDropdown}
                  >
                    Your Profile
                  </Link>

                  <Link
                    to="/requests"
                    className="relative block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                    onClick={() => {
                      closeDropdown();
                      window.dispatchEvent(
                        new CustomEvent("refreshRequests")
                      );
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

        {!user && (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-1 border border-white text-white rounded-full hover:bg-white hover:text-purple-600 transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/signin"
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
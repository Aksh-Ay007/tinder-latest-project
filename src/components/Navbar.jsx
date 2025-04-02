import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

function Navbar() {
  const user = useSelector((store) => store.user);
  const premium = useSelector((store) => store.premium); // Access premium state from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const [requestCount, setRequestCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0); // State for unread message count
  const [showPremiumModal, setShowPremiumModal] = useState(false); // State for premium modal
  const notificationAudioRef = useRef(null);

  // Fetch pending request count, connection count, and unread message count
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/requests/count`, { withCredentials: true });
        setRequestCount(response.data.pendingRequests || 0);
        setConnectionCount(response.data.connections || 0);

        const messageResponse = await axios.get(`${BASE_URL}/messages/count`, { withCredentials: true });
        setMessageCount(messageResponse.data.unreadMessages || 0);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    if (user) {
      fetchCounts();
      const pollInterval = setInterval(fetchCounts, 15000); // Poll every 15 seconds
      return () => clearInterval(pollInterval);
    }
  }, [user]);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMessagesClick = () => {
    if (premium.isPremium) {
      navigate("/messages");
    } else {
      setShowPremiumModal(true);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      <audio ref={notificationAudioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-72 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2">
              <h3 className="text-base font-bold text-white flex items-center">
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

      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold flex items-center gap-2 bg-white text-purple-600 px-4 py-1 rounded-full shadow-md hover:bg-purple-50 transition duration-300"
        >
          Connectia
        </Link>

        {/* Centered Premium and Messages */}
        {user && (
          <div className="hidden md:flex items-center space-x-6">
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

        {/* Mobile Menu Toggle */}
        {/*premium feature*/}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Profile Picture and Dropdown */}
        {user && (
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
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                </div>

                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                  onClick={closeDropdown}
                >
                  Your Profile
                </Link>

                <Link
                  to="/connections"
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                  onClick={closeDropdown}
                >
                  Connections
                </Link>

                <Link
                  to="/requests"
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                  onClick={closeDropdown}
                >
                  Requests
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
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden bg-white text-purple-600 shadow-lg rounded-lg mt-2 py-2">
          <Link
            to="/premium"
            className="block px-4 py-2 hover:bg-purple-50 transition duration-150"
            onClick={toggleMobileMenu}
          >
            Premium
          </Link>
          <button
            onClick={handleMessagesClick}
            className="block w-full text-left px-4 py-2 hover:bg-purple-50 transition duration-150"
          >
            Messages
            {messageCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {messageCount}
              </span>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
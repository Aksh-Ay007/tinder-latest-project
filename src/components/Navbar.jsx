import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

function Navbar() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      return navigate('/login');
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
          <Link to="/" className="hover:text-pink-200 transition duration-300">Discover</Link>
          <Link to="/connections" className="hover:text-pink-200 transition duration-300">Connections</Link>
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
                  
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                    onClick={closeDropdown}
                  >
                    Settings
                  </Link>
                  
                  <Link 
                    to="/connections" 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                    onClick={closeDropdown}
                  >
                    Connections
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
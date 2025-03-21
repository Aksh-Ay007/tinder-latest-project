import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "./utils/constants";
import { removeUser } from "./utils/userSlice";

function Navbar() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + '/logout', {}, { withCredentials: true });
      dispatch(removeUser());
      return navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to={'/'} 
          className="text-xl sm:text-2xl font-bold flex items-center gap-2 bg-white text-pink-600 px-4 py-1 rounded-full shadow-md hover:bg-pink-50 transition duration-300"
        >
          <span className="flex items-center">
            Bondify
            <span className="text-red-500 ml-1">❤️</span>
          </span>
        </Link>

        {/* Profile Section */}
        {user && (
          <div className="flex items-center gap-4">
            <p className="text-lg hidden sm:block font-medium">
              Welcome, <span className="font-semibold">{user.firstName}</span>
            </p>
            <div className="dropdown dropdown-end">
              <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-ghost btn-circle avatar border-2 border-white hover:border-pink-200 transition-all duration-300"
              >
                <div className="w-10 rounded-full">
                  <img
                    alt="User profile"
                    src={user.photoUrl}
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-white text-gray-800 rounded-xl z-1 mt-3 w-56 p-2 shadow-xl"
              >
                <li>
                  <Link to={'/profile'} className="justify-between hover:bg-pink-50 font-medium py-2">
                    Profile
                    <span className="badge bg-pink-500 text-white border-0">New</span>
                  </Link>
                </li>
                <li>
                  <Link className="hover:bg-pink-50 py-2">Settings</Link>
                </li>
                <li>
                  <a 
                    onClick={handleLogout} 
                    className="hover:bg-red-50 hover:text-red-600 py-2 cursor-pointer"
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
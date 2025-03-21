import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "./utils/constants";
import { removeUser } from "./utils/userSlice";


function Navbar() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate=useNavigate()
  const handleLogout=async()=>{
    try {
    await axios.post(BASE_URL+'/logout',{},{withCredentials:true});
    dispatch(removeUser())
    return navigate('/login')
    } catch (error) {
      console.error("Login failed:", error);

    }
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg px-4 py-2 flex justify-between items-center">
      {/* Logo */}
      <Link to={'/'} className="text-xl sm:text-2xl font-bold flex items-center gap-2 bg-white text-pink-600 px-4 py-1 rounded-full shadow-md hover:bg-red-100 transition">
        Bondify ❤️
      </Link>

      {/* Profile Section */}
      {user && (
        <div className="flex items-center gap-4">
          <p className="text-lg">Welcome, {user.firstName}</p>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="User photo"
                  src={user.photoUrl}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <Link to={'/profile'} className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </Link>
              </li>
              <li><Link>Settings</Link></li>
              <li><a  onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
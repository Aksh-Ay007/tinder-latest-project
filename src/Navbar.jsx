import React from "react";
import { useSelector } from "react-redux";

function Navbar() {
  const user = useSelector((store) => store.user);
  console.log(user, 'navv');

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg px-4 py-2 flex justify-between items-center">
      {/* Logo */}
      <a className="text-xl sm:text-2xl font-bold flex items-center gap-2 bg-white text-pink-600 px-4 py-1 rounded-full shadow-md hover:bg-red-100 transition">
        ❤️ TinderVibe 😉🔥
      </a>

      {/* Profile Section */}
      {user && (
        <div className="flex items-center gap-4">
          <p className="text-lg">Welcome, {user.firstName}</p>
          <button className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-white focus:outline-none">
            <img
              className="w-full h-full rounded-full object-cover"
              src={user.photoUrl}
              alt="User photo"
            />
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
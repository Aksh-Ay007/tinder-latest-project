import React from "react";

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 py-3 flex flex-col md:flex-row justify-between items-center px-4">
      {/* Left Section */}
      <div className="flex items-center gap-2 text-pink-400">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="fill-current"
        >
          <path d="M22.672 15.226l-2.432.811 ..."></path>
        </svg>
        <p>❤️ Love & Matches © {new Date().getFullYear()} - All rights reserved</p>
      </div>

      {/* Social Media Links */}
      <div className="flex gap-4 mt-2 md:mt-0">
        <a className="hover:text-red-500 transition">
          <svg width="24" height="24" viewBox="0 0 24 24" className="fill-current">
            <path d="M24 4.557c-.883.392-1.832 ..."></path>
          </svg>
        </a>
        <a className="hover:text-red-500 transition">
          <svg width="24" height="24" viewBox="0 0 24 24" className="fill-current">
            <path d="M19.615 3.184c-3.604 ..."></path>
          </svg>
        </a>
        <a className="hover:text-red-500 transition">
          <svg width="24" height="24" viewBox="0 0 24 24" className="fill-current">
            <path d="M9 8h-3v4h3v12h5v-12h ..."></path>
          </svg>
        </a>
      </div>
    </footer>
  );
}

export default Footer;
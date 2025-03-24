import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import EditProfile from "./EditProfile";


function Profile() {
  const user = useSelector((store) => store.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-40 relative">
        {/* Navigation bar */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Bondify <span className="text-red-500">❤</span></h1>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-white hover:text-pink-200">Discover</a>
              <a href="#" className="text-white hover:text-pink-200">Connections</a>
              <a href="#" className="text-white hover:text-pink-200">Messages</a>
            </div>
            <div className="flex items-center">
              <span className="text-white mr-2">{user.firstName}</span>
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={`${user.firstName}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
                    {user.firstName?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Edit Profile Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute right-6 bottom-6 px-4 py-2 bg-white text-purple-600 rounded-full shadow-md hover:shadow-lg transition duration-300 flex items-center gap-2 text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit Profile
        </button>
        
        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={`${user.firstName}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-3xl">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Profile Info */}
          <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm p-6">
            {/* Basic Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
                  {user.age} years
                </span>
                <span className="bg-pink-100 text-pink-700 text-sm px-3 py-1 rounded-full">
                  {user.gender}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">About Me</h2>
              <p className="text-gray-600 leading-relaxed">
                {user.bio || "No bio added yet. Click 'Edit Profile' to add your bio."}
              </p>
            </div>

            {/* Hobbies & Skills in two-column layout */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hobbies */}
              <div className="bg-purple-50 rounded-lg p-5">
                <h2 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Hobbies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.hobby && user.hobby.length > 0 ? (
                    user.hobby.map((hobby, index) => (
                      <span key={index} className="bg-white text-purple-600 px-3 py-1 rounded-full shadow-sm text-sm">
                        {hobby}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No hobbies added yet</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-pink-50 rounded-lg p-5">
                <h2 className="text-lg font-semibold text-pink-700 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span key={index} className="bg-white text-pink-600 px-3 py-1 rounded-full shadow-sm text-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Connections */}
          <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Connections</h2>
              <Link 
                to="/connections" 
                className="text-purple-600 hover:text-pink-600 transition duration-300 text-sm"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-gray-500 text-center py-6">Connection preview will go here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (optional) */}
      <div className="mt-10 py-4 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center">
              <span className="text-purple-600 mr-2">❤</span> LoveMatch © 2025 All rights reserved
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Contact Us</a>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <EditProfile user={user} onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
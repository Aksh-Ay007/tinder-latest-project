import React from "react";
import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";

function Profile() {
  const user = useSelector((store) => store.user);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-500 to-red-500 p-6 mx-auto mt-[-30px]">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left - Profile Image */}
        <div className="relative md:w-1/2">
          <img
            src={user.photoUrl}
            alt="Profile"
            className="w-full h-full object-cover rounded-l-2xl"
          />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-lg bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full inline-block mt-1">
              {user.age} years
            </p>
            <p className="text-lg">{user.gender}</p>
          </div>
        </div>

        {/* Right - Profile Details */}
        <div className="p-4 flex flex-col justify-center md:w-1/2">
          <p className="text-gray-700 text-lg italic mb-4">
            {user.bio}
          </p>

          {/* Hobbies */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Hobbies</h3>
            <p className="text-gray-600 text-md">
              {user.hobby.join(', ')}
            </p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Skills</h3>
            <p className="text-gray-600 text-md">
              {user.skills.join(', ')}
            </p>
          </div>

          {/* Edit Profile Button */}
          <div className="flex justify-center mt-6">
            <button
              className="bg-pink-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-pink-700 transition-all"
              onClick={() => document.getElementById("edit_profile_modal").showModal()}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <EditProfile user={user} />
    </div>
  );
}

export default Profile;
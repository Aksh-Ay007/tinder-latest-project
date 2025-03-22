import React from "react";

function UserCard({ user }) {
  const { firstName, lastName, photoUrl, bio, age, skills, hobby } = user;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      <div className="flex flex-col">
        {/* Profile Image Section */}
        <div className="relative">
          <div className="h-64 w-full overflow-hidden bg-gray-100">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-200">
                <span className="text-5xl font-bold text-purple-700">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>

          {/* Name and age positioned over the image */}
          <div className="absolute bottom-4 left-6 text-white">
            <h2 className="text-2xl font-bold">{firstName} {lastName}</h2>
            <p className="text-lg">{age ? `${age} years` : "Age not specified"}</p>
          </div>
        </div>

        {/* Bio section */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {bio || "No bio available"}
          </p>

          {/* Skills and Hobbies */}
          <div className="mb-6 space-y-2">
            {skills && (
              <div>
                <h3 className="text-sm font-medium text-gray-600">Skills</h3>
                <p className="text-gray-700">{skills}</p>
              </div>
            )}
            
            {hobby && (
              <div>
                <h3 className="text-sm font-medium text-gray-600">Hobbies</h3>
                <p className="text-gray-700">{hobby}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white border-2 border-red-400 text-red-500 shadow-md hover:bg-red-50 transition duration-300 transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex space-x-3">
              <button className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium py-2 px-4 rounded-full text-sm">
                View Profile
              </button>
              
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-full text-sm">
                Connect
              </button>
            </div>
            
            <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white border-2 border-green-400 text-green-500 shadow-md hover:bg-green-50 transition duration-300 transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
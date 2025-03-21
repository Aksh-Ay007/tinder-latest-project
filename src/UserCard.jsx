import React from "react";

function UserCard({ user }) {
  const { firstName, lastName, photoUrl, bio, age } = user;
  
  return (
    <div className="w-96 mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Profile Image with gradient overlay */}
      <div className="relative">
        <div className="h-64 w-full overflow-hidden">
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="w-full h-full object-cover"
          />
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
        <p className="text-gray-700 mb-6">
          {bio || "No bio available"}
        </p>
        
        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <button className="w-16 h-16 flex items-center justify-center rounded-full bg-white border-2 border-red-400 text-red-500 shadow-md hover:bg-red-50 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button className="w-16 h-16 flex items-center justify-center rounded-full bg-white border-2 border-green-400 text-green-500 shadow-md hover:bg-green-50 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
  
  
}

export default UserCard;
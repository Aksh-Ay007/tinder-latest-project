export default function ConnectionProfileUI({ connection, currentUser, onBackClick, onMessageClick }) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-40 relative">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Bondify <span className="text-red-500">❤</span></h1>
            <div className="flex space-x-6">
              <a href="#" className="text-white hover:text-pink-200">Discover</a>
              <a href="#" className="text-white hover:text-pink-200">Connections</a>
              <a href="#" className="text-white hover:text-pink-200">Messages</a>
            </div>
            <div className="flex items-center">
              <span className="text-white mr-2">{currentUser?.firstName}</span>
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {currentUser?.photoUrl ? (
                  <img src={currentUser.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
                    {currentUser?.firstName?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="absolute right-6 bottom-6 flex space-x-3">
            <button onClick={onMessageClick} className="px-4 py-2 bg-white text-purple-600 rounded-full shadow-md hover:shadow-lg transition">
              Message
            </button>
            <button onClick={onBackClick} className="px-4 py-2 bg-pink-500 text-white rounded-full shadow-md hover:shadow-lg transition">
              Back
            </button>
          </div>
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
              {connection?.photoUrl ? (
                <img src={connection.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-3xl">
                  {connection?.firstName?.charAt(0)}{connection?.lastName?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-20">
          <div className="w-full bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {connection?.firstName} {connection?.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
                {connection?.age} years
              </span>
              <span className="bg-pink-100 text-pink-700 text-sm px-3 py-1 rounded-full">
                {connection?.gender}
              </span>
              <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                Connected
              </span>
            </div>
            <p className="mt-4 text-gray-600">{connection?.bio || "No bio available."}</p>
          </div>
        </div>
      </div>
    );
  }
  
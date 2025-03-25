import React, { useState } from 'react'; 
import { FcGoogle } from 'react-icons/fc'; 
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'; 
import { app } from '../fireBase'; 
import axios from 'axios'; 
import { BASE_URL } from "../utils/constants"; 
import { useDispatch } from 'react-redux'; 
import { addUser } from "../utils/userSlice"; 
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify';
import Guide from './Guide';

// Shared authentication logic
const useGoogleAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleGoogleAuth = async (type) => {
    try {
      // Configure Google Auth Provider
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      // Get Firebase Auth instance
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      
      // Prepare user data
      const googleUserData = {
        Name: result.user.displayName || 'Google User',
        emailId: result.user.email,
        photoURL: result.user.photoURL,
      };
      
      // Determine route based on auth type
      const authEndpoint = type === 'signup'
        ? `${BASE_URL}/google/signup`
        : `${BASE_URL}/google/login`;
      
      // Send request to backend
      const res = await axios.post(authEndpoint, googleUserData, {
        withCredentials: true,
      });
      
      // Dispatch user data
      dispatch(addUser(res.data.user));
      
      // If signup, show onboarding
      if (type === 'signup') {
        setUserData(res.data.user);
        setShowOnboarding(true);
      } else {
        // If login, navigate to home
        navigate('/');
      }
      
      // Show success message
      toast.success(`${type === 'signup' ? 'Signed up' : 'Logged in'} successfully!`, {
        position: 'top-center',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Google Authentication Error:', error);
      
      if (error.response) {
        // Server responded with an error
        toast.error(error.response.data.message || 'Authentication Failed', {
          position: 'top-center',
        });
      } else if (error.request) {
        // Request made but no response received
        toast.error('No response from server. Check your network.', {
          position: 'top-center',
        });
      } else {
        // Something else went wrong
        toast.error(`Error: ${error.message}`, {
          position: 'top-center',
        });
      }
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowOptions(true);
  };

  // Handle onboarding skip
  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setShowOptions(true);
  };

  // Navigate to profile
  const goToProfile = () => {
    navigate("/profile");
    toast.info("Complete your profile to get better matches!");
  };

  // Navigate to home
  const goToHome = () => {
    navigate("/");
    toast.info("You can complete your profile later from your account settings.");
  };

  return { 
    handleGoogleAuth, 
    showOnboarding, 
    userData, 
    showOptions, 
    handleOnboardingComplete, 
    handleOnboardingSkip,
    goToProfile,
    goToHome 
  };
};

// Google Login Component
export const GoogleLogin = () => {
  const { handleGoogleAuth } = useGoogleAuth();
  
  return (
    <button
      type="button"
      onClick={() => handleGoogleAuth('login')}
      className="w-full flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-300 shadow-sm space-x-2"
    >
      <FcGoogle className="h-5 w-5" />
      <span className="text-sm">Continue with Google</span>
    </button>
  );
};

// Google Signup Component
export const GoogleSignup = () => {
  const { 
    handleGoogleAuth, 
    showOnboarding, 
    userData, 
    showOptions, 
    handleOnboardingComplete, 
    handleOnboardingSkip,
    goToProfile,
    goToHome 
  } = useGoogleAuth();
  
  return (
    <>
      <button
        type="button"
        onClick={() => handleGoogleAuth('signup')}
        className="w-full flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-300 shadow-sm space-x-2"
      >
        <FcGoogle className="h-5 w-5" />
        <span className="text-sm">Sign Up with Google</span>
      </button>

      {/* Onboarding Guide */}
      {showOnboarding && (
        <Guide 
          user={userData} 
          onComplete={handleOnboardingComplete} 
          onSkip={handleOnboardingSkip} 
        />
      )}

      {/* Post-Onboarding Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Almost There!</h2>
            <p className="text-gray-600 mb-6">Would you like to complete your profile now or do it later?</p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={goToProfile}
                className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition"
              >
                Complete Profile Now
              </button>
              <button
                onClick={goToHome}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Do It Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
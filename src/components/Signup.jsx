import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { toast } from "react-toastify";
import Guide from './Guide'

const Signup = () => {
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    gender: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showOptions, setShowOptions] = useState(false); // New state for showing options
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 3) {
      newErrors.firstName = "Name must be at least 3 characters";
    }
    
    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }
    
    // Email validation
    if (!formData.emailId) {
      newErrors.emailId = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      newErrors.emailId = "Email is not valid";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = "Password must include uppercase, lowercase, number and special character";
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
  
    try {
      const res = await axios.post(
        `${BASE_URL}/signup`,
        { 
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          emailId: formData.emailId, 
          password: formData.password, 
          gender: formData.gender 
        },
        { withCredentials: true }
      );
      
      // Check if we have the expected response structure
      if (res.data && res.data.success && res.data.data) {
        const user = res.data.data;
        dispatch(addUser(user));
        setUserData(user);
        setShowOnboarding(true); // Show onboarding modal instead of navigating
        toast.success("Account created successfully!");
      } else {
        // Handle unexpected response format
        toast.success("Account created successfully!");
        setShowOnboarding(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
      
      // Check for specific error types
      if (errorMsg.includes("email")) {
        setErrors({...errors, emailId: errorMsg});
      } else if (errorMsg.includes("password")) {
        setErrors({...errors, password: errorMsg});
      }
    } finally {
      setIsLoading(false);
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

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-2">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 w-full max-w-md">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-4 text-center">
            <h2 className="text-xl font-bold text-white">Create Account</h2>
            <p className="text-purple-100 mt-1 text-xs">Find your perfect match today</p>
          </div>

          <div className="px-4 py-4">
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                    placeholder="First Name"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Last Name"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${errors.emailId ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.emailId && <p className="text-red-500 text-xs mt-1">{errors.emailId}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Gender</label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors appearance-none ${errors.gender ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${errors.password ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Create a password"
                  />
                </div>
                {errors.password ? (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">8+ chars with upper, lower, number & special char</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 shadow-sm flex items-center justify-center text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>

              <div className="text-center">
                <p className="text-gray-600 text-xs">
                  Already have an account?{" "}
                  <Link to="/login" className="text-pink-600 hover:text-pink-800 font-medium transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        
        <Guide 
          user={userData} 
          onComplete={handleOnboardingComplete} 
          onSkip={handleOnboardingSkip} 
        />
      )}

      {/* New Navigation Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <h2 className="text-2xl font-bold relative z-10">Account Created!</h2>
              <p className="mt-2 text-sm opacity-90 relative z-10">Where would you like to go next?</p>
            </div>
            
            <div className="p-6">
              <div className="bg-pink-50 border-l-4 border-pink-400 p-4 mb-6 rounded-r-lg">
                <p className="text-sm text-pink-800">
                  <span className="font-bold">💕 Dating Tip:</span> Profiles with complete information get 8x more matches!
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={goToProfile}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-4 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all focus:outline-none flex flex-col items-center text-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Complete Profile</span>
                  <span className="text-xs mt-1 opacity-90">Get more matches</span>
                </button>
                
                <button
                  onClick={goToHome}
                  className="bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 font-medium py-4 px-4 rounded-lg shadow-sm transition-all focus:outline-none flex flex-col items-center text-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Go to Home</span>
                  <span className="text-xs mt-1 opacity-90">I'll do it later</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;
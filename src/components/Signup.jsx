import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { toast } from "react-toastify";
import Guide from "./Guide";
import { GoogleSignup } from './OAuth'; 

const Signup = () => {
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for toggling confirm password visibility

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
      newErrors.password =
        "Password must include uppercase, lowercase, number and special character";
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
          gender: formData.gender,
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
        setErrors({ ...errors, emailId: errorMsg });
      } else if (errorMsg.includes("password")) {
        setErrors({ ...errors, password: errorMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate("/profile"); // Redirect to the profile page after onboarding
    toast.info("Complete your profile to get better matches!");
  };

  // Handle onboarding skip
  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    navigate("/"); // Redirect to the home page if onboarding is skipped
    toast.info("You can complete your profile later from your account settings.");
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-b from-gray-50 to-gray-100 p-4 mt-10">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 w-full max-w-md">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-5 text-center">
          <h2 className="text-lg font-bold text-white">Create Account</h2>
          <p className="text-purple-100 text-xs mt-1">Find your perfect match</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="First Name"
                  required
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Last Name"
                  required
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition ${
                  errors.emailId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Email Address"
                required
              />
              {errors.emailId && (
                <p className="text-red-500 text-xs mt-1">{errors.emailId}</p>
              )}
            </div>

            <div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10S6.477 0 12 0c1.02 0 2.007.15 2.925.425M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.98 8.223A10.05 10.05 0 0112 4c5.523 0 10 4.477 10 10s-4.477 10-10 10a10.05 10.05 0 01-8.02-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
              {errors.password ? (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  8+ chars with upper, lower, number
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"} // Toggle between text and password
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Confirm Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle confirm password visibility
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10S6.477 0 12 0c1.02 0 2.007.15 2.925.425M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.98 8.223A10.05 10.05 0 0112 4c5.523 0 10 4.477 10 10s-4.477 10-10 10a10.05 10.05 0 01-8.02-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-2 rounded-md transition duration-300 flex items-center justify-center text-sm"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Sign Up"
              )}
            </button>

            <div className="relative my-3 border-t border-gray-300">
              <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-gray-500 text-xs">
                OR
              </span>
            </div>

            <GoogleSignup />

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-pink-600 hover:text-pink-800 font-medium transition"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Show onboarding guide */}
      {showOnboarding && (
        <Guide
          user={userData}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
};

export default Signup;
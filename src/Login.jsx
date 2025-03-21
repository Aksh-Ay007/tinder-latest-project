import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "./utils/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [emailId, setEmailId] = useState("hannah.lee@example.com");
  const [password, setPassword] = useState("Password123!@");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form reload

    try {
      const res = await axios.post("http://localhost:7777/login", {
        emailId,
        password,
      }, { withCredentials: true });

      dispatch(addUser(res.data));
      navigate('/');
    } catch (error) {
      setError("Login failed: " + (error.response ? error.response.data : error.message));
     
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-pink-500 to-red-500 relative p-0">
      <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center text-red-500">Welcome Back! ❤️</h2>
        <p className="text-center text-gray-600 mb-6">Find your match today!</p>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <p className="text-sm text-gray-500 text-right mb-4">Forgot Password?</p>

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Login❤️
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
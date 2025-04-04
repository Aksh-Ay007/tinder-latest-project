import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage if available
const storedUser = localStorage.getItem("user");
const initialState = storedUser ? JSON.parse(storedUser) : null;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action) => {
      // Store user data in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    updateUser: (state, action) => {
      // Only update if state exists
      if (state) {
        const updatedUser = { ...state, ...action.payload };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
      return state;
    },
    removeUser: (state, action) => {
      // Clear from localStorage when user logs out
      localStorage.removeItem("user");
      return null;
    }
  }
});

export const { addUser, updateUser, removeUser } = userSlice.actions;

export default userSlice.reducer;
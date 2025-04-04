import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage if available
const storedPremium = localStorage.getItem("premium");
const initialState = storedPremium 
  ? JSON.parse(storedPremium) 
  : {
      isPremium: false,
      premiumDetails: null,
    };

const premiumSlice = createSlice({
  name: "premium",
  initialState,
  reducers: {
    setPremium: (state, action) => {
      // Store complete state in localStorage for persistence
      localStorage.setItem("premium", JSON.stringify(action.payload));
      return action.payload;
    },
    updatePremium: (state, action) => {
      // Only update if state exists
      if (state) {
        const updatedPremium = { ...state, ...action.payload };
        localStorage.setItem("premium", JSON.stringify(updatedPremium));
        return updatedPremium;
      }
      return state;
    },
    clearPremium: (state) => {
      // Clear from localStorage when premium is removed
      localStorage.removeItem("premium");
      return {
        isPremium: false,
        premiumDetails: null,
      };
    },
  },
});

export const { setPremium, updatePremium, clearPremium } = premiumSlice.actions;

// Thunk action creator for asynchronous operations
export const setPremiumAsync = (payload) => (dispatch) => {
  // Ensure localStorage is updated
  localStorage.setItem("premium", JSON.stringify(payload));
  // Then dispatch the regular action
  dispatch(setPremium(payload));
};

export default premiumSlice.reducer;
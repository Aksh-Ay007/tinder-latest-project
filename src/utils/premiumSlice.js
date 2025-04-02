import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const initialState = JSON.parse(localStorage.getItem("premium")) || {
  isPremium: false,
  premiumDetails: null,
};

const premiumSlice = createSlice({
  name: "premium",
  initialState:{  isPremium: false, },
  reducers: {
    setPremium: (state, action) => {
      state.isPremium = action.payload.isPremium;
      state.premiumDetails = action.payload.premiumDetails;

      // Save to localStorage
      localStorage.setItem("premium", JSON.stringify(state));
    },
    clearPremium: (state) => {
      state.isPremium = false;
      state.premiumDetails = null;

      // Remove from localStorage
      localStorage.removeItem("premium");
    },
  },
});

export const { setPremium, clearPremium } = premiumSlice.actions;

export default premiumSlice.reducer;
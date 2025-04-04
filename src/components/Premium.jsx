import React, { useEffect, useState, useMemo } from "react";
import { Trophy, Star, Shield, Sparkles } from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { setPremium } from "../utils/premiumSlice";
import { updateUser } from "../utils/userSlice";

const Premium = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const premiumState = useSelector(state => state.premium);
  
  // Initialize state from Redux store - more careful check for premium status
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [premiumDetails, setPremiumDetails] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Calculate expiration date using useMemo
  const expirationDate = useMemo(() => {
    if (!premiumDetails?.createdAt) return "Not specified";
    const createdDate = new Date(premiumDetails.createdAt);
    let expirationDate;
    switch (premiumDetails.membershipType?.toLowerCase()) {
      case "silver":
        expirationDate = new Date(createdDate.setMonth(createdDate.getMonth() + 3));
        break;
      case "gold":
        expirationDate = new Date(createdDate.setMonth(createdDate.getMonth() + 6));
        break;
      default:
        return "Not specified";
    }
    return expirationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [premiumDetails]);

  // Initial setup on component mount - check localStorage first, then redux states
  useEffect(() => {
    // Check localStorage first on initial load
    const storedPremium = localStorage.getItem("premium");
    if (storedPremium) {
      try {
        const parsedPremium = JSON.parse(storedPremium);
        if (parsedPremium.isPremium === true) {
          setIsUserPremium(true);
          setPremiumDetails(parsedPremium.premiumDetails);
          // Also update Redux if needed
          dispatch(setPremium(parsedPremium));
        }
      } catch (e) {
        console.error("Error parsing stored premium data", e);
      }
    }
    
    // Then check Redux state as a backup
    const isPremiumFromUser = user && user.isPremium === true;
    const isPremiumFromState = premiumState && premiumState.isPremium === true;
    
    console.log("Premium status check:", { 
      userIsPremium: isPremiumFromUser, 
      premiumStateIsPremium: isPremiumFromState,
      user,
      premiumState
    });
    
    if (isPremiumFromUser || isPremiumFromState) {
      setIsUserPremium(true);
      setPremiumDetails(premiumState?.premiumDetails || user);
    }
    
    setInitialLoadComplete(true);
  }, []);

  // Secondary effect to update state when user or premiumState changes
  useEffect(() => {
    const isPremiumFromUser = user && user.isPremium === true;
    const isPremiumFromState = premiumState && premiumState.isPremium === true;
    
    if (isPremiumFromUser || isPremiumFromState) {
      setIsUserPremium(true);
      setPremiumDetails(premiumState?.premiumDetails || user);
    } else if (initialLoadComplete) {
      // Only reset if initial load is done to avoid flickering
      setIsUserPremium(false);
      setPremiumDetails(null);
    }
  }, [user, premiumState, initialLoadComplete]);

  // Verify premium user on component mount, but only after initial load is complete
  useEffect(() => {
    if (initialLoadComplete) {
      verifyPremiumUser();
    }
  }, [initialLoadComplete]);

  // Fetch full user data and update Redux store
  const fetchAndUpdateUserData = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/profile", {
        withCredentials: true,
      });
      
      if (res.data) {
        // Update the user data in Redux
        dispatch(updateUser(res.data));
        
        // Only set premium if explicitly true
        if (res.data.isPremium === true) {
          // Update localStorage first
          const premiumData = { 
            isPremium: true, 
            premiumDetails: res.data 
          };
          localStorage.setItem("premium", JSON.stringify(premiumData));
          
          // Then update component state and Redux
          setIsUserPremium(true);
          setPremiumDetails(res.data);
          dispatch(setPremium(premiumData));
        } else {
          localStorage.removeItem("premium");
          setIsUserPremium(false);
          setPremiumDetails(null);
          dispatch(setPremium({ isPremium: false, premiumDetails: null }));
        }
      }
      
      return res.data;
    } catch (error) {
      console.error("Error fetching user data", error);
      return null;
    }
  };

  // Verify premium user status
  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", {
        withCredentials: true,
      });

      if (res.data && res.data.isPremium === true) {
        // Update localStorage first
        const premiumData = { 
          isPremium: true, 
          premiumDetails: res.data 
        };
        localStorage.setItem("premium", JSON.stringify(premiumData));
        
        // Then update component state and Redux
        setIsUserPremium(true);
        setPremiumDetails(res.data);
        
        // Also update the user object in Redux to include premium status
        dispatch(updateUser({
          isPremium: true,
          membershipType: res.data.membershipType
        }));
        
        dispatch(setPremium(premiumData)); // Update Redux store
      } else {
        // Explicitly set as non-premium if the API returns false or no data
        localStorage.removeItem("premium");
        setIsUserPremium(false);
        setPremiumDetails(null);
        
        // Update Redux state to reflect non-premium status
        dispatch(updateUser({ isPremium: false }));
        dispatch(setPremium({ isPremium: false, premiumDetails: null }));
      }
    } catch (error) {
      console.error("Error verifying premium status", error);
      // On error, assume non-premium for safety
      localStorage.removeItem("premium");
      setIsUserPremium(false);
      setPremiumDetails(null);
    }
  };

  // Handle payment order creation
  const handleBuyClick = async (type) => {
    try {
      const order = await axios.post(
        BASE_URL + "/payment/create",
        { membershipType: type },
        { withCredentials: true }
      );

      const { amount, keyId, currency, notes, orderId } = order.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Bondify",
        description: "Connect to other developers",
        order_id: orderId,
        prefill: {
          name: notes.firstName + " " + notes.lastName,
          email: notes.emailId,
          contact: "7777777777",
        },
        theme: {
          color: "#9C27B0",
        },
        handler: async function() {
          try {
            // After successful payment, update localStorage and fetch latest data
            const userData = await fetchAndUpdateUserData();
            
            if (userData && userData.isPremium) {
              const premiumData = { 
                isPremium: true, 
                premiumDetails: userData 
              };
              
              // Update localStorage first
              localStorage.setItem("premium", JSON.stringify(premiumData));
              
              // Then update component state and Redux
              setIsUserPremium(true);
              setPremiumDetails(userData);
              dispatch(setPremium(premiumData));
            }
            
            // Force verification from server as a final check
            setTimeout(() => {
              verifyPremiumUser();
            }, 1000);
          } catch (error) {
            console.error("Error updating user data after payment", error);
          }
        },
      };

      const rsp = new window.Razorpay(options);
      rsp.open();
    } catch (error) {
      console.error("Error creating payment order", error);
    }
  };

  const MembershipPlans = () => {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-12 mt-12">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Upgrade Your Experience
        </h1>
        
        {/* Responsive container with improved centering */}
        <div className="flex justify-center flex-wrap gap-6 max-w-[1200px] mx-auto">
          {/* Silver Membership Plan */}
          <div className="card bg-white shadow-xl rounded-xl p-6 w-full max-w-[500px] flex flex-col">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 uppercase">
              Silver Membership
            </h2>
            <div className="text-center mb-4">
              <span className="text-3xl font-extrabold text-secondary">₹999</span>
              <span className="text-gray-500 ml-2">/ 3 months</span>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                "Chat with other people",
                "100 Connection Requests per day",
                "Blue Tick Verified",
                "3 Months Membership",
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleBuyClick("silver")}
              className="btn btn-secondary w-full mt-4"
            >
              Choose Silver Plan
            </button>
          </div>
  
          {/* Gold Membership Plan */}
          <div className="card bg-white shadow-xl rounded-xl p-6 w-full max-w-[500px] flex flex-col">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 uppercase">
              Gold Membership
            </h2>
            <div className="text-center mb-4">
              <span className="text-3xl font-extrabold text-primary">₹1999</span>
              <span className="text-gray-500 ml-2">/ 6 months</span>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                "Chat with other people",
                "Infinite Connection Requests",
                "Blue Tick Verified",
                "6 Months Membership",
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleBuyClick("gold")}
              className="btn btn-primary w-full mt-4"
            >
              Choose Gold Plan
            </button>
          </div>
        </div>
  
        {/* Additional padding for mobile scrolling */}
        <div className="h-[100px]"></div>
      </div>
    );
  };

  // Premium User View Component
  const PremiumUserView = () => {
    return (
      <div className="container mx-auto px-4 py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
          <div className="bg-purple-600 text-white py-6 px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Trophy className="w-12 h-12 text-yellow-300" />
              <h1 className="text-3xl font-bold">Premium Membership</h1>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">
                {premiumDetails?.membershipType?.toUpperCase() || "PREMIUM"}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-purple-50 p-6 rounded-lg text-center hover:shadow-lg transition-all duration-300">
                <Star className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  Exclusive Access
                </h2>
                <p className="text-gray-600">Chat, Audio Call, and Video Call Features</p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg text-center hover:shadow-lg transition-all duration-300">
                <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  Enhanced Networking
                </h2>
                <p className="text-gray-600">Unlimited connection requests</p>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg text-center hover:shadow-lg transition-all duration-300">
                <Sparkles className="w-12 h-12 mx-auto text-pink-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  Verified Profile
                </h2>
                <p className="text-gray-600">Stand out in the community</p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Membership Type</p>
                  <p className="text-xl font-bold text-purple-700">
                    {premiumDetails?.membershipType?.toUpperCase() || "N/A"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <p className="text-xl font-bold text-green-600">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Expires On</p>
                  <p className="text-xl font-bold text-gray-800">{expirationDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Debug section to log the current state - useful during development
  console.log("Current state:", { isUserPremium, premiumDetails, user, premiumState });

  // Conditional rendering based on premium status - with strict boolean check
  return isUserPremium === true ? <PremiumUserView /> : <MembershipPlans />;
};

export default Premium;
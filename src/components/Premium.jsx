import React, { useEffect, useState, useMemo } from "react";
import { Trophy, Star, Shield, Sparkles } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { setPremium } from "../utils/premiumSlice";

const Premium = () => {
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [premiumDetails, setPremiumDetails] = useState(null);
  const dispatch = useDispatch();

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

  // Verify premium user on component mount
  useEffect(() => {
    verifyPremiumUser();
  }, []);

  // Verify premium user status
  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", {
        withCredentials: true,
      });

      if (res.data.isPremium) {
        setIsUserPremium(true);
        setPremiumDetails(res.data);
        dispatch(setPremium({ isPremium: true, premiumDetails: res.data })); // Update Redux store
      }
    } catch (error) {
      console.error("Error verifying premium status", error);
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
        handler: async () => {
          await verifyPremiumUser(); // Re-fetch premium status after payment
        },
      };

      const rsp = new window.Razorpay(options);
      rsp.open();
    } catch (error) {
      console.error("Error creating payment order", error);
    }
  };

  // Membership Plans Component
  const MembershipPlans = () => {
    return (
      <div className="container mx-auto px-4 py-8 mt-6"> {/* Reduced py and mt */}
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800"> {/* Reduced mb */}
          Upgrade Your Experience
        </h1>
        <div className="flex flex-col md:flex-row justify-center md:space-x-8 space-y-8 md:space-y-0">
          {/* Silver Membership Plan */}
          <div className="card bg-white shadow-xl rounded-xl p-6 w-full max-w-sm flex flex-col">
            <h2 className="text-xl font-bold text-center mb-3 text-gray-800 uppercase">
              Silver Membership
            </h2>
            <div className="text-center mb-3">
              <span className="text-2xl font-extrabold text-secondary">₹999</span>
              <span className="text-gray-500 ml-1">/ 3 months</span>
            </div>
            <ul className="space-y-2 mb-3 flex-grow overflow-y-auto max-h-48">
              {[
                "Chat with other people",
                "100 Connection Requests per day",
                "Blue Tick Verified",
                "3 Months Membership",
                "Access to exclusive groups",
                "Priority support",
                "Early access to new features",
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
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
              className="btn btn-secondary w-full text-sm py-2"
            >
              Choose Silver Plan
            </button>
          </div>

          {/* Gold Membership Plan */}
          <div className="card bg-white shadow-xl rounded-xl p-6 w-full max-w-sm flex flex-col">
            <h2 className="text-xl font-bold text-center mb-3 text-gray-800 uppercase">
              Gold Membership
            </h2>
            <div className="text-center mb-3">
              <span className="text-2xl font-extrabold text-primary">₹1999</span>
              <span className="text-gray-500 ml-1">/ 6 months</span>
            </div>
            <ul className="space-y-2 mb-3 flex-grow overflow-y-auto max-h-48">
              {[
                "Chat with other people",
                "Infinite Connection Requests",
                "Blue Tick Verified",
                "6 Months Membership",
                "Unlimited access to all features",
                "Personalized recommendations",
                "Featured profile badge",
                "Exclusive events and webinars",
                "Dedicated account manager",
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
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
              className="btn btn-primary w-full text-sm py-2"
            >
              Choose Gold Plan
            </button>
          </div>
        </div>
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

  // Conditional rendering based on premium status
  return isUserPremium ? <PremiumUserView /> : <MembershipPlans />;
};

export default Premium;
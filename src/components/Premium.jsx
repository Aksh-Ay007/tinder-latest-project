
import React from 'react';
import { BASE_URL } from '../utils/constants';
import axios from 'axios';

const Premium = () => {


  const handleBuyClick=async(type)=>{

    const order=await axios.post(BASE_URL+'/payment/create',{membershipType:type},{withCredentials:true});

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
   
    };

    const rsp=new window.Razorpay(options)
    rsp.open()
  }


  return (
    <div className="container mx-auto px-4 py-12 mt-12">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
        Upgrade Your Experience
      </h1>
      <div className="flex justify-center space-x-8">
        <div className="card bg-white shadow-xl rounded-xl p-6 w-96 flex flex-col">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 uppercase">
            Silver Membership
          </h2>
          <div className="text-center mb-4">
            <span className="text-3xl font-extrabold text-secondary">₹999</span>
            <span className="text-gray-500 ml-2">/ 3 months</span>
          </div>
          <ul className="space-y-3 mb-6 flex-grow">
            <li className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Chat with other people
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              100 Connection Requests per day
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Blue Tick Verified
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              3 Months Membership
            </li>
          </ul>
          <button onClick={()=>handleBuyClick('silver')} className="btn btn-secondary w-full">
            Choose Silver Plan
          </button>
        </div>

        <div className="card bg-white shadow-xl rounded-xl p-6 w-96 flex flex-col">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 uppercase">
            Gold Membership
          </h2>
          <div className="text-center mb-4">
            <span className="text-3xl font-extrabold text-primary">₹1999</span>
            <span className="text-gray-500 ml-2">/ 6 months</span>
          </div>
          <ul className="space-y-3 mb-6 flex-grow">
            <li className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Chat with other people
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Infinite Connection Requests
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Blue Tick Verified
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              6 Months Membership
            </li>
          </ul>
          <button onClick={()=>handleBuyClick('gold')} className="btn btn-primary w-full">
            Choose Gold Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Premium
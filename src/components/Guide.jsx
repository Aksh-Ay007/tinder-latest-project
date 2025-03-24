





import React, { useEffect, useState } from 'react'

function Guide({ user, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  
  // Animation effect without framer-motion
  useEffect(() => {
    setFadeIn(true);
  }, [currentStep]);
  
  const steps = [
    {
      title: "Welcome to Our Dating Community!",
      description: "Find your perfect match with our personalized matching algorithm. Let's set up your profile to attract the right person.",
      image: "/images/welcome.svg",
      tip: "Complete your profile to receive 5x more matches!"
    },
    {
      title: "Add Your Best Photos",
      description: "First impressions matter! Profiles with quality photos receive 10x more attention.",
      image: "/images/profile-photo.svg",
      tip: "Include a clear face photo and one showing your interests or personality."
    },
    {
      title: "Share Your Passions",
      description: "What makes you unique? Tell potential matches about your interests and hobbies.",
      image: "/images/interests.svg",
      tip: "Members who add 5+ interests get 40% more meaningful connections!"
    },
    {
      title: "Create Your Story",
      description: "Your bio is your chance to shine. Be authentic and let your personality come through.",
      image: "/images/bio.svg",
      tip: "Profiles with thoughtful bios receive 3x more messages and matches."
    },
    {
      title: "Ready to Find Love!",
      description: "You're all set to start your dating journey. Complete your profile now for the best experience.",
      image: "/images/complete.svg",
      tip: "Members who complete their profile in 24 hours find matches twice as fast!"
    }
  ];
  
  const nextStep = () => {
    setFadeIn(false);
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
    }, 300);
  };
  
  const prevStep = () => {
    setFadeIn(false);
    setTimeout(() => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    }, 300);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 ease-in-out">
        {/* Top gradient header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          
          <h2 className="text-2xl font-bold relative z-10">{steps[currentStep].title}</h2>
          <div className="mt-3 flex relative z-10">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 mx-1 rounded-full flex-1 transition-all duration-300 ${
                  index < currentStep ? "bg-white" : 
                  index === currentStep ? "bg-white" : "bg-white bg-opacity-30"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Content area */}
        <div className={`p-6 transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden border-4 border-pink-100 shadow-md">
              <img 
                src={steps[currentStep].image || "/images/placeholder.svg"} 
                alt="Illustration"
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>
          
          <p className="text-gray-700 text-lg mb-6 text-center">{steps[currentStep].description}</p>
          
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-400 p-4 mb-6 rounded-r-lg shadow-sm">
            <p className="text-sm text-pink-800">
              <span className="font-bold">💕 Dating Tip:</span> {steps[currentStep].tip}
            </p>
          </div>
          
          <div className="flex justify-between mt-8">
            {currentStep > 0 ? (
              <button
                onClick={prevStep}
                className="px-5 py-2.5 text-pink-600 hover:text-pink-800 font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-lg transition-all"
              >
                Back
              </button>
            ) : (
              <button
                onClick={onSkip}
                className="px-5 py-2.5 text-gray-500 hover:text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg transition-all"
              >
                Skip for now
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {currentStep === steps.length - 1 ? "Find Matches" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};













  

export default Guide;
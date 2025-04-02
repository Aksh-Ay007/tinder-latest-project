import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/constants';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';

function EditProfile({ user, onClose }) {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [preview, setPreview] = useState('');
  const [bio, setBio] = useState(user?.bio || '');
  const [hobby, setHobby] = useState(user?.hobby || []);
  const [skills, setSkills] = useState(user?.skills || []);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // For handling hobby and skills as arrays
  
  const [hobbyInput, setHobbyInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and GIF images are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = function() {
        // Use canvas to compress image
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 500;
          const maxHeight = 500;
          let width = img.width;
          let height = img.height;

          // Scale down if needed
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Compress and convert to base64
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          
          // Check compressed image size
          const base64Size = (compressedImage.length * 3) / 4;
          if (base64Size > 10 * 1024 * 1024) { // 10MB limit
            setError('Image file is too large. Maximum 10MB allowed.');
            return;
          }

          setPreview(compressedImage);
          setError(''); // Clear any previous errors
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const addHobby = () => {
    if (hobbyInput.trim()) {
      setHobby([...hobby, hobbyInput.trim()]);
      setHobbyInput('');
    }
  };

  const removeHobby = (index) => {
    setHobby(hobby.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess(false); // Reset success status
    setLoading(true);

    try {
      // Validate required fields
      if (!firstName.trim()) {
        setError('First Name is required');
        setLoading(false);
        return;
      }

      // Prepare payload with all profile details
      const payload = {
        firstName, 
        lastName, 
        bio, 
        age, 
        gender, 
        hobby, 
        skills
      };

      // Add photo if selected
      if (preview) {
        payload.preview = preview;
      }

      const res = await axios.put(
        `${BASE_URL}/profile/edit`,
        payload,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Update Redux store with new user data
      dispatch(addUser(res?.data?.data));
      
      setSuccess(true);
      setLoading(false);
      
      setTimeout(() => {
        if (onClose) onClose();
        navigate("/profile");
      }, 2000);
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="relative">
      <form onSubmit={saveProfile} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
              placeholder="First Name" 
              required
            />
          </div>
          
          <div className="form-control w-full col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
              placeholder="Last Name" 
            />
          </div>
          
          <div className="form-control w-full col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input 
              type="number" 
              value={age} 
              onChange={(e) => setAge(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
              placeholder="Age" 
            />
          </div>
          
          <div className="form-control w-full col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="others">Other</option>
            </select>
          </div>
          
          <div className="form-control w-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
              placeholder="Tell us about yourself"
              rows="3" 
            />
          </div>
          
          <div className="form-control w-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-40 h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {(preview || photoUrl) ? (
                  <img 
                    src={preview || photoUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">No photo uploaded</p>
                  </div>
                )}
              </div>
              
              <div className="flex-1 w-full">
                <input 
                  type="file" 
                  id="profile-photo-upload"
                  accept="image/jpeg,image/png,image/gif" 
                  className="hidden" 
                  onChange={handlePhotoChange} 
                />
                <label 
                  htmlFor="profile-photo-upload" 
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition duration-200 ease-in-out"
                >
                  Choose Photo
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  JPG, PNG, or GIF. Max size 10MB.
                </p>
                {error && (
                  <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-control w-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hobbies</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={hobbyInput} 
                onChange={(e) => setHobbyInput(e.target.value)} 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                placeholder="Add a hobby" 
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
              />
              <button 
                type="button" 
                onClick={addHobby}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {hobby.map((item, index) => (
                <div key={index} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {item}
                  <button 
                    type="button" 
                    onClick={() => removeHobby(index)}
                    className="ml-1 text-purple-700 hover:text-purple-900"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-control w-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={skillInput} 
                onChange={(e) => setSkillInput(e.target.value)} 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                placeholder="Add a skill" 
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button 
                type="button" 
                onClick={addSkill}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition duration-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((item, index) => (
                <div key={index} className="flex items-center gap-1 bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                  {item}
                  <button 
                    type="button" 
                    onClick={() => removeSkill(index)}
                    className="ml-1 text-pink-700 hover:text-pink-900"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : "Save Changes"}
          </button>
        </div>
      </form>
      
      {/* Toast Message */}
      {success && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md flex items-center">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Profile updated successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfile;
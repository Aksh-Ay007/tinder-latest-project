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
  const [bio, setBio] = useState(user?.bio || '');
  const [hobby, setHobby] = useState(user?.hobby || []);
  const [skills, setSkills] = useState(user?.skills || []);
  const [photoFile, setPhotoFile] = useState(null);
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
      setPhotoFile(file);
      setPhotoUrl(URL.createObjectURL(file));
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
      let uploadedPhotoUrl = photoUrl;

      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('upload_preset', 'your_upload_preset'); // Replace with your Cloudinary upload preset

        const uploadRes = await axios.post('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', formData); // Replace with your Cloudinary URL
        uploadedPhotoUrl = uploadRes.data.secure_url;
      }

      const res = await axios.put(
        `${BASE_URL}/profile/edit`,
        { firstName, lastName, photoUrl: uploadedPhotoUrl, bio, age, gender, hobby, skills },
        { withCredentials: true }
      );

      dispatch(addUser(res?.data?.data));
      setSuccess(true); // Set success status
      setLoading(false);
      
      setTimeout(() => {
        if (onClose) onClose();
        navigate("/profile");
      }, 2000); // Close modal and navigate after 2 seconds
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000); // Hide toast after 3 seconds
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                  onChange={handlePhotoChange} 
                />
              </div>
              {photoUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-200">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
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
              {hobby && hobby.map((item, index) => (
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
              {skills && skills.map((item, index) => (
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
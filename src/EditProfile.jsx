import React, { useState, useEffect } from 'react';
import { BASE_URL } from './utils/constants';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from './utils/userSlice';
import { useNavigate } from 'react-router-dom';

function EditProfile({ user }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [age, setAge] = useState(user.age);
  const [gender, setGender] = useState(user.gender);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [bio, setBio] = useState(user.bio);
  const [hobby, setHobby] = useState(user.hobby);
  const [skills, setSkills] = useState(user.skills);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess(false); // Reset success status

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
      setTimeout(() => {
        document.getElementById("edit_profile_modal").close();
        navigate("/profile");
      }, 2000); // Close modal and navigate after 2 seconds
    } catch (error) {
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
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box max-w-lg mx-auto p-6">
          <h3 className="font-bold text-xl text-center mb-4">Edit Profile</h3>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control w-full col-span-1">
                <label className="label py-1">
                  <span className="label-text">First Name</span>
                </label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="input input-bordered w-full" 
                  placeholder="First Name" 
                />
              </div>
              
              <div className="form-control w-full col-span-1">
                <label className="label py-1">
                  <span className="label-text">Last Name</span>
                </label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="input input-bordered w-full" 
                  placeholder="Last Name" 
                />
              </div>
              
              <div className="form-control w-full col-span-1">
                <label className="label py-1">
                  <span className="label-text">Age</span>
                </label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  className="input input-bordered w-full" 
                  placeholder="Age" 
                />
              </div>
              
              <div className="form-control w-full col-span-1">
                <label className="label py-1">
                  <span className="label-text">Gender</span>
                </label>
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)} 
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="others">Other</option>
                  
                </select>
              </div>
              
              <div className="form-control w-full col-span-2">
                <label className="label py-1">
                  <span className="label-text">Bio</span>
                </label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  className="textarea textarea-bordered w-full" 
                  placeholder="Bio"
                  rows="3" 
                />
              </div>
              
              <div className="form-control w-full col-span-1">
                <label className="label py-1">
                  <span className="label-text">Hobbies</span>
                </label>
                <input 
                  type="text" 
                  value={hobby} 
                  onChange={(e) => setHobby(e.target.value)} 
                  className="input input-bordered w-full" 
                  placeholder="Hobbies" 
                />
              </div>
              
              <div className="form-control w-full col-span-1">
                <label className="label py-1">
                  <span className="label-text">Skills</span>
                </label>
                <input 
                  type="text" 
                  value={skills} 
                  onChange={(e) => setSkills(e.target.value)} 
                  className="input input-bordered w-full" 
                  placeholder="Skills" 
                />
              </div>
              
              <div className="form-control w-full col-span-2">
                <label className="label py-1">
                  <span className="label-text">Profile Photo</span>
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="file-input file-input-bordered w-full" 
                    onChange={handlePhotoChange} 
                  />
                  {photoUrl && 
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full">
                        <img src={photoUrl} alt="Preview" />
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
            
            {error && (
              <div className="alert alert-error p-3 text-sm mt-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                className="btn" 
                onClick={() => document.getElementById('edit_profile_modal').close()}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </dialog>
      
      {/* Toast Message - Compact version at the bottom right */}
      {success && (
        <div className="toast toast-end toast-bottom z-50">
          <div className="alert alert-success py-3 px-4 shadow-md text-base">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Profile updated!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfile;
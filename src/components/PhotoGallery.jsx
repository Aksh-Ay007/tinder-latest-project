import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';

function PhotoGallery({ user }) {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete confirmation modal
  const [photoToDelete, setPhotoToDelete] = useState(null); // Photo to delete

  const dispatch = useDispatch();

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
      reader.onloadend = function () {
        // Use canvas to compress image
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 800;
          const maxHeight = 800;
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
          if (base64Size > 10 * 1024 * 1024) {
            // 10MB limit
            setError('Image file is too large. Maximum 10MB allowed.');
            return;
          }

          setPreview(compressedImage);
          setError(''); // Clear any previous errors

          // Auto-upload the photo
          handleUploadPhoto(compressedImage);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async (imageData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(
        `${BASE_URL}/profile/photos/add`,
        { preview: imageData },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Update Redux store with new user data
      dispatch(addUser(res?.data?.data));

      setSuccess('Photo uploaded successfully!');
      setLoading(false);
      setPreview('');

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'An error occurred while uploading');
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    setLoading(true);
    setError('');

    try {
      // Extract the last part of the publicId if it contains '/'
      const id = photoToDelete.publicId.includes('/')
        ? photoToDelete.publicId.split('/').pop()
        : photoToDelete.publicId;

      const res = await axios.delete(`${BASE_URL}/profile/photos/${id}`, {
        withCredentials: true,
      });

      // Update Redux store with new user data
      dispatch(addUser(res?.data?.data));

      setSuccess('Photo deleted successfully!');
      setLoading(false);

      // Hide the lightbox if open
      if (showLightbox) {
        setShowLightbox(false);
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'An error occurred while deleting');
    } finally {
      setShowDeleteModal(false); // Close the delete modal
      setPhotoToDelete(null); // Clear the photo to delete
    }
  };

  const openDeleteModal = (photo) => {
    setPhotoToDelete(photo);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPhotoToDelete(null);
  };

  const openLightbox = (photo) => {
    setActivePhoto(photo);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setActivePhoto(null);
  };

  const hasMaxPhotos = user?.photos?.length >= 8;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">My Photos</h2>

        {!hasMaxPhotos && (
          <div className="relative">
            <input
              type="file"
              id="gallery-photo-upload"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={handlePhotoChange}
              disabled={loading}
            />
            <label
              htmlFor="gallery-photo-upload"
              className="cursor-pointer px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition duration-200 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Photo
            </label>
          </div>
        )}
      </div>

      {/* Success message */}
      {success && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {user?.photos?.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
            <img
              src={photo.url}
              alt={`Gallery photo ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer transition duration-300 hover:scale-105"
              onClick={() => openLightbox(photo)}
            />
            <button
              onClick={() => openDeleteModal(photo)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              title="Delete photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Empty slots */}
        {user?.photos?.length === 0 && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm">No photos yet</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Photo</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this photo? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePhoto}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for photo viewing */}
      {showLightbox && activePhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative max-w-3xl max-h-[90vh] w-full p-2">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="rounded-lg overflow-hidden">
              <img src={activePhoto.url} alt="Full size" className="max-h-[80vh] max-w-full mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGallery;
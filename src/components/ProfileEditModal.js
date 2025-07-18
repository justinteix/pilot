import React, { useState, useRef } from "react";
import { X, Camera, User, Save, Loader, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile } from "../services/authService";
import { uploadProfileImage } from "../services/storageService";
import DeleteAccountModal from "./DeleteAccountModal";
import "./ProfileEditModal.css";

const ProfileEditModal = ({ isOpen, onClose, onProfileUpdate }) => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || "",
    bio: userProfile?.bio || "",
    location: userProfile?.location || "",
    website: userProfile?.website || "",
    favoriteGenres: userProfile?.favoriteGenres || [],
    isPublic: userProfile?.isPublic !== false, // Default to public
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(userProfile?.photoURL || "");
  const fileInputRef = useRef(null);

  // Update form data when userProfile changes (including handle migration)
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        website: userProfile.website || "",
        favoriteGenres: userProfile.favoriteGenres || [],
        isPublic: userProfile.isPublic !== false,
      });
      setImagePreview(userProfile.photoURL || "");
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGenreToggle = (genreId) => {
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genreId)
        ? prev.favoriteGenres.filter((id) => id !== genreId)
        : [...prev.favoriteGenres, genreId],
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      let photoURL = userProfile?.photoURL || "";

      // Upload new profile image if selected
      if (profileImage) {
        photoURL = await uploadProfileImage(currentUser.uid, profileImage);
      }

      // Update user profile
      const updatedData = {
        ...formData,
        photoURL,
        updatedAt: new Date(),
      };

      await updateUserProfile(currentUser.uid, updatedData);

      // Update local state
      const updatedProfile = { ...userProfile, ...updatedData };
      setUserProfile(updatedProfile);

      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="profile-image-section">
            <div className="current-image">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="profile-preview"
                />
              ) : (
                <div className="default-avatar">
                  <User size={40} />
                </div>
              )}
              <button
                type="button"
                className="change-image-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <p className="image-help">
              Click the camera icon to change your profile picture
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="Your display name"
              required
            />
          </div>

          <div className="form-group">
            <label>Your Handle</label>
            <div className="handle-display">
              @{userProfile?.handle || "generating..."}
            </div>
            <small>Your unique handle cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              maxLength={160}
              rows={3}
            />
            <small>{formData.bio.length}/160 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Your location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://your-website.com"
            />
          </div>

          <div className="form-group">
            <label>Favorite Genres</label>
            <div className="genre-selection">
              {[
                { id: 28, name: "Action" },
                { id: 12, name: "Adventure" },
                { id: 16, name: "Animation" },
                { id: 35, name: "Comedy" },
                { id: 80, name: "Crime" },
                { id: 99, name: "Documentary" },
                { id: 18, name: "Drama" },
                { id: 10751, name: "Family" },
                { id: 14, name: "Fantasy" },
                { id: 36, name: "History" },
                { id: 27, name: "Horror" },
                { id: 10402, name: "Music" },
                { id: 9648, name: "Mystery" },
                { id: 10749, name: "Romance" },
                { id: 878, name: "Sci-Fi" },
                { id: 10770, name: "TV Movie" },
                { id: 53, name: "Thriller" },
                { id: 10752, name: "War" },
                { id: 37, name: "Western" },
              ].map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  className={`genre-tag ${
                    formData.favoriteGenres.includes(genre.id) ? "selected" : ""
                  }`}
                  onClick={() => handleGenreToggle(genre.id)}
                >
                  {genre.name}
                </button>
              ))}
            </div>
            <small>Select up to 5 favorite genres</small>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
              />
              <label htmlFor="isPublic">Make my profile public</label>
            </div>
            <small>Public profiles can be discovered by other users</small>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader size={16} className="spinning" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <p>
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            type="button"
            className="delete-account-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default ProfileEditModal;

import React, { useState, useRef } from 'react';
import { X, User, AtSign, Check, AlertCircle, Loader, Save } from 'lucide-react';
import { updateUserProfile, checkHandleAvailability } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import './ProfileCompletionModal.css';

const ProfileCompletionModal = ({ isOpen, onClose, onComplete }) => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleStatus, setHandleStatus] = useState(null);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || currentUser?.displayName || '',
    handle: ''
  });
  const handleTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle validation for handle field
    if (name === 'handle') {
      setHandleStatus(null);
      
      // Clear previous timeout
      if (handleTimeoutRef.current) {
        clearTimeout(handleTimeoutRef.current);
      }
      
      // Validate handle format
      const handleRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (value && !handleRegex.test(value)) {
        setHandleStatus('invalid');
        return;
      }
      
      // Check availability after delay
      if (value && value.length >= 3) {
        handleTimeoutRef.current = setTimeout(async () => {
          setHandleChecking(true);
          try {
            const isAvailable = await checkHandleAvailability(value);
            setHandleStatus(isAvailable ? 'available' : 'taken');
          } catch (error) {
            console.error('Error checking handle:', error);
            setHandleStatus('error');
          } finally {
            setHandleChecking(false);
          }
        }, 500);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.displayName.trim()) {
      alert('Display name is required');
      return;
    }
    if (!formData.handle.trim()) {
      alert('Handle is required');
      return;
    }
    if (handleStatus === 'taken') {
      alert('Handle is already taken');
      return;
    }
    if (handleStatus === 'invalid') {
      alert('Handle must be 3-20 characters (letters, numbers, underscores only)');
      return;
    }

    setLoading(true);
    try {
      const updatedData = {
        displayName: formData.displayName,
        handle: formData.handle.toLowerCase(),
        updatedAt: new Date()
      };

      await updateUserProfile(currentUser.uid, updatedData);
      
      // Update local state
      const updatedProfile = { ...userProfile, ...updatedData };
      setUserProfile(updatedProfile);
      
      if (onComplete) {
        onComplete(updatedProfile);
      }
      
      onClose();
    } catch (error) {
      console.error('Error completing profile:', error);
      alert('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-completion-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Your Profile</h2>
          <p>Please set your display name and choose a unique handle</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="completion-form">
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
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
          </div>

          <div className="form-group">
            <label htmlFor="handle">Handle</label>
            <div className="input-wrapper">
              <AtSign className="input-icon" size={20} />
              <input
                type="text"
                id="handle"
                name="handle"
                value={formData.handle}
                onChange={handleInputChange}
                placeholder="your_handle"
                required
              />
              <div className="handle-status">
                {handleChecking && <Loader size={16} className="spinning" />}
                {handleStatus === 'available' && <Check size={16} className="status-available" />}
                {handleStatus === 'taken' && <AlertCircle size={16} className="status-taken" />}
                {handleStatus === 'invalid' && <AlertCircle size={16} className="status-invalid" />}
              </div>
            </div>
            {handleStatus === 'taken' && (
              <small className="error-text">Handle is already taken</small>
            )}
            {handleStatus === 'invalid' && (
              <small className="error-text">Handle must be 3-20 characters (letters, numbers, underscores only)</small>
            )}
            {handleStatus === 'available' && (
              <small className="success-text">Handle is available</small>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="complete-btn" disabled={loading || handleStatus !== 'available'}>
              {loading ? (
                <>
                  <Loader size={16} className="spinning" />
                  Completing...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Complete Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
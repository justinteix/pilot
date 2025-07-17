import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader } from 'lucide-react';
import { deleteUserAccount } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import './DeleteAccountModal.css';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToWarnings, setAgreedToWarnings] = useState(false);

  const resetModal = () => {
    setError('');
    setAgreedToWarnings(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleDeleteAccount = async () => {
    if (!agreedToWarnings) {
      setError('You must agree to the terms before deleting your account');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteUserAccount();
      // Account deleted successfully - user will be automatically signed out
      handleClose();
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Use the error message from the service, which now has better error handling
      setError(error.message || 'Failed to delete account. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="delete-account-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="warning-icon">
            <AlertTriangle size={32} />
          </div>
          <h2>Delete Account</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="warning-step">
            <div className="warning-message">
              <h3>⚠️ This action cannot be undone!</h3>
              <p>Deleting your account will permanently remove:</p>
              <ul>
                <li>Your profile and personal information</li>
                <li>Your watchlist and favorite movies</li>
                <li>All your movie ratings and reviews</li>
                <li>Your viewing history and statistics</li>
                <li>Your account settings and preferences</li>
              </ul>
              <p className="final-warning">
                <strong>This data cannot be recovered once deleted.</strong>
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="agreement-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToWarnings}
                  onChange={(e) => setAgreedToWarnings(e.target.checked)}
                />
                <span className="checkmark"></span>
                I understand that this action is permanent and cannot be undone
              </label>
            </div>

            <div className="step-actions">
              <button className="cancel-btn" onClick={handleClose}>
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={handleDeleteAccount}
                disabled={!agreedToWarnings || loading}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="spinning" />
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
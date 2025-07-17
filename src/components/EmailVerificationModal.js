import React, { useState, useEffect } from 'react';
import { X, Mail, RefreshCw, CheckCircle, AlertCircle, Clock, Inbox, LogOut } from 'lucide-react';
import { resendVerificationEmail, signOutUser } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import './EmailVerificationModal.css';

const EmailVerificationModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isVerified, setIsVerified] = useState(false);

  // Cooldown timer for resend button
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Check verification status periodically
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const checkVerification = async () => {
      try {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          setIsVerified(true);
          setMessage('Email verified successfully!');
          setMessageType('success');
          setTimeout(() => {
            window.location.reload(); // Refresh to update auth state
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    // Check immediately and then every 3 seconds
    checkVerification();
    const interval = setInterval(checkVerification, 3000);

    return () => clearInterval(interval);
  }, [isOpen, currentUser]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setMessage('');
    
    try {
      await resendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox.');
      setMessageType('success');
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Error resending verification email:', error);
      setMessage('Failed to send verification email. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        setMessage('Email verified successfully!');
        setMessageType('success');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        setMessage('Email not verified yet. Please check your inbox and click the verification link.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error refreshing verification status:', error);
      setMessage('Error checking verification status. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  if (isVerified) {
    return (
      <div className="modal-overlay">
        <div className="email-verification-modal success-modal">
          <div className="success-content">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>Email Verified!</h2>
            <p>Your email has been successfully verified. Redirecting you now...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="email-verification-modal" onClick={e => e.stopPropagation()}>

        <div className="modal-content">
          <div className="header-section">
            <div className="main-icon">
              <Inbox size={56} />
            </div>
            <h2>Check Your Email</h2>
            <p className="subtitle">
              We've sent a verification link to
            </p>
            <div className="email-display">
              {currentUser.email}
            </div>
          </div>

          <div className="instructions-section">
            <div className="instruction-item">
              <div className="instruction-icon">
                <Mail size={20} />
              </div>
              <div className="instruction-text">
                <strong>Check your inbox</strong>
                <span>Look for an email from us</span>
              </div>
            </div>
            
            <div className="instruction-item">
              <div className="instruction-icon">
                <RefreshCw size={20} />
              </div>
              <div className="instruction-text">
                <strong>Click the link</strong>
                <span>Click "Verify Email" in the email</span>
              </div>
            </div>
            
            <div className="instruction-item">
              <div className="instruction-icon">
                <CheckCircle size={20} />
              </div>
              <div className="instruction-text">
                <strong>You're all set!</strong>
                <span>Return here to continue</span>
              </div>
            </div>
          </div>

          {message && (
            <div className={`status-message ${messageType}`}>
              {messageType === 'success' ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{message}</span>
            </div>
          )}

          <div className="action-section">
            <button 
              className="primary-btn"
              onClick={handleRefreshStatus}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  I've verified my email
                </>
              )}
            </button>

            <div className="secondary-actions">
              <button 
                className="secondary-btn"
                onClick={handleResendEmail}
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0 ? (
                  <>
                    <Clock size={14} />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <Mail size={14} />
                    Resend email
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="help-section">
            <details className="help-details">
              <summary>Didn't receive the email?</summary>
              <div className="help-content">
                <div className="help-item">
                  <strong>Check your spam folder</strong>
                  <span>Sometimes emails end up in spam or junk</span>
                </div>
                <div className="help-item">
                  <strong>Verify your email address</strong>
                  <span>Make sure {currentUser.email} is correct</span>
                </div>
                <div className="help-item">
                  <strong>Wait a few minutes</strong>
                  <span>Email delivery can sometimes be delayed</span>
                </div>
              </div>
            </details>
            
            <div className="sign-out-section">
              <p>Wrong email address?</p>
              <button 
                className="sign-out-btn"
                onClick={async () => {
                  try {
                    await signOutUser();
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                }}
              >
                <LogOut size={14} />
                Sign out and use different email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
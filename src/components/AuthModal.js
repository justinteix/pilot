import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AtSign, Check, AlertCircle, Loader } from 'lucide-react';
import { signUpWithEmailAndPassword, signInWithEmailAndPassword, signInWithGoogle, checkHandleAvailability } from '../services/authService';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    handle: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleStatus, setHandleStatus] = useState(null); // 'available', 'taken', 'invalid'
  const handleTimeoutRef = useRef(null);

  // Update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccess('');
    setHandleStatus(null);
    setFormData({
      email: '',
      password: '',
      displayName: '',
      handle: '',
      confirmPassword: ''
    });
  }, [initialMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');

    // Handle validation for handle field
    if (name === 'handle' && mode === 'signup') {
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

  const getErrorMessage = (error) => {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try signing in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email. Try signing up instead.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (!formData.displayName.trim()) {
          throw new Error('Display name is required');
        }
        if (!formData.handle.trim()) {
          throw new Error('Handle is required');
        }
        if (handleStatus === 'taken') {
          throw new Error('Handle is already taken');
        }
        if (handleStatus === 'invalid') {
          throw new Error('Handle must be 3-20 characters (letters, numbers, underscores only)');
        }
        
        await signUpWithEmailAndPassword(
          formData.email, 
          formData.password, 
          formData.displayName, 
          formData.handle
        );
        
        // Show success message for signup
        setSuccess(`Account created successfully! We've sent a verification email to ${formData.email}. Please check your inbox and verify your email to continue.`);
        setFormData({
          email: '',
          password: '',
          displayName: '',
          handle: '',
          confirmPassword: ''
        });
        setHandleStatus(null);
        
        // Close modal after showing success message
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 5000);
        
        return; // Don't close immediately for signup
      } else {
        await signInWithEmailAndPassword(formData.email, formData.password);
        onClose();
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setHandleStatus(null);
    setFormData({
      email: '',
      password: '',
      displayName: '',
      handle: '',
      confirmPassword: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="auth-header">
          <h2>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {mode === 'signin' 
              ? 'Sign in to track your favorite movies and shows'
              : 'Create an account to start your entertainment journey'
            }
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    name="displayName"
                    placeholder="Display Name"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="input-wrapper">
                  <AtSign className="input-icon" size={20} />
                  <input
                    type="text"
                    name="handle"
                    placeholder="Handle (e.g., moviefan123)"
                    value={formData.handle}
                    onChange={handleInputChange}
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
            </>
          )}

          <div className="form-group">
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button 
          className="auth-btn google" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-switch">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={switchMode}>
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={switchMode}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
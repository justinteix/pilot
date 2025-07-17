import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile } from '../services/authService';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import EmailVerificationModal from '../components/EmailVerificationModal';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    // If Firebase is not configured, just set loading to false
    if (!auth) {
      console.warn('Firebase auth not available. Running in demo mode.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if email verification is required
        if (!user.emailVerified && user.providerData.some(p => p.providerId === 'password')) {
          setShowEmailVerification(true);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Check if user needs to complete their profile (Google sign-in users without handle)
          if (profile && !profile.handle && user.providerData.some(p => p.providerId === 'google.com')) {
            setShowProfileCompletion(true);
          }
          
          // If handle was just generated (migration), refresh the profile
          if (profile && !profile.handle) {
            // Wait a moment for the migration to complete, then refresh
            setTimeout(async () => {
              try {
                const updatedProfile = await getUserProfile(user.uid);
                setUserProfile(updatedProfile);
                // Hide completion modal if handle was auto-generated
                if (updatedProfile.handle) {
                  setShowProfileCompletion(false);
                }
              } catch (error) {
                console.error('Error refreshing profile after migration:', error);
              }
            }, 1000);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        setShowProfileCompletion(false);
        setShowEmailVerification(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    setUserProfile
  };

  const handleProfileCompletion = (updatedProfile) => {
    setUserProfile(updatedProfile);
    setShowProfileCompletion(false);
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && !showEmailVerification && children}
      <ProfileCompletionModal
        isOpen={showProfileCompletion}
        onClose={() => setShowProfileCompletion(false)}
        onComplete={handleProfileCompletion}
      />
      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
      />
    </AuthContext.Provider>
  );
};
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, orderBy, limit, limitToLast, startAfter } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Generate unique handle for user
const generateUniqueHandle = async (displayName, email, userId) => {
  // Create base handle from display name or email
  let baseHandle = '';
  
  if (displayName) {
    baseHandle = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
      .substring(0, 15); // Limit length
  }
  
  if (!baseHandle && email) {
    baseHandle = email.split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
  }
  
  if (!baseHandle) {
    baseHandle = 'user';
  }
  
  // Add first 8 characters of user ID to ensure uniqueness
  const uniqueSuffix = userId.substring(0, 8);
  const handle = `${baseHandle}_${uniqueSuffix}`;
  
  return handle;
};

// Create user profile in Firestore
const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();
    
    // Use custom handle if provided, otherwise generate one
    let handle = additionalData.handle;
    if (!handle) {
      handle = await generateUniqueHandle(displayName, email, user.uid);
    }
    
    try {
      await setDoc(userRef, {
        displayName: displayName || additionalData.displayName || '',
        email,
        photoURL: photoURL || '',
        handle: handle.toLowerCase(), // Store handle in lowercase for consistency
        bio: additionalData.bio || '',
        location: additionalData.location || '',
        website: additionalData.website || '',
        favoriteGenres: additionalData.favoriteGenres || [],
        isPublic: additionalData.isPublic !== false, // Default to public
        createdAt,
        watchlist: [],
        favorites: [],
        ratings: {},
        watchedMovies: [],
        watchedTVShows: [],
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  return userRef;
};

// Sign up with email and password
export const signUpWithEmailAndPassword = async (email, password, displayName, handle = null) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name
    await updateProfile(user, { displayName });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in Firestore with custom handle if provided
    await createUserProfile(user, { displayName, handle });
    
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Send email verification
export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Resend email verification
export const resendVerificationEmail = async () => {
  try {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('No user to send verification email to');
    }
  } catch (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmailAndPassword = async (email, password) => {
  try {
    const { user } = await firebaseSignIn(auth, email, password);
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    
    // Create user profile in Firestore if it doesn't exist
    await createUserProfile(user);
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = { id: userSnap.id, ...userSnap.data() };
      
      // Migration: Generate handle for existing users who don't have one
      if (!userData.handle) {
        const handle = await generateUniqueHandle(userData.displayName, userData.email, userId);
        await updateDoc(userRef, { handle });
        userData.handle = handle;
      }
      
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const ratings = userData.ratings || {};
      const watchedMovies = userData.watchedMovies || [];
      const watchedTVShows = userData.watchedTVShows || [];
      
      // Calculate statistics
      const totalRatings = Object.keys(ratings).length;
      const ratingValues = Object.values(ratings).map(r => r.rating || r); // Handle both old and new rating format
      const averageRating = totalRatings > 0 
        ? (ratingValues.reduce((sum, rating) => sum + rating, 0) / totalRatings).toFixed(1)
        : 0;
      
      // Count ratings by content type
      const movieRatings = Object.entries(ratings).filter(([key, data]) => 
        key.startsWith('movie_') || (data.mediaType && data.mediaType === 'movie')
      ).length;
      
      const tvRatings = Object.entries(ratings).filter(([key, data]) => 
        key.startsWith('tv_') || (data.mediaType && data.mediaType === 'tv')
      ).length;
      
      const episodeRatings = Object.entries(ratings).filter(([key, data]) => 
        key.startsWith('episode_') || (data.mediaType && data.mediaType === 'episode')
      ).length;
      
      const seasonRatings = Object.entries(ratings).filter(([key, data]) => 
        key.startsWith('season_') || (data.mediaType && data.mediaType === 'season')
      ).length;
      
      return {
        moviesWatched: watchedMovies.length,
        tvShowsWatched: watchedTVShows.length,
        totalRatings,
        averageRating: parseFloat(averageRating),
        movieRatings,
        tvRatings,
        episodeRatings,
        seasonRatings,
        totalWatchlistItems: (userData.watchlist || []).length,
        totalFavorites: (userData.favorites || []).length
      };
    }
    
    return {
      moviesWatched: 0,
      tvShowsWatched: 0,
      totalRatings: 0,
      averageRating: 0,
      movieRatings: 0,
      tvRatings: 0,
      episodeRatings: 0,
      seasonRatings: 0,
      totalWatchlistItems: 0,
      totalFavorites: 0
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Get all users (for user discovery - with pagination)
export const getAllUsers = async (limit = 20, lastDoc = null) => {
  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, orderBy('createdAt', 'desc'), limitToLast(limit));
    
    if (lastDoc) {
      q = query(usersRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limitToLast(limit));
    }
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      users,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Check if handle is available
export const checkHandleAvailability = async (handle) => {
  try {
    // Query users collection for the handle
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('handle', '==', handle.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.empty; // Returns true if handle is available
  } catch (error) {
    console.error('Error checking handle availability:', error);
    throw error;
  }
};

// Search users by handle or display name
export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const usersRef = collection(db, 'users');
    const searchTermLower = searchTerm.toLowerCase();
    
    // Search by handle
    const handleQuery = query(
      usersRef,
      where('handle', '>=', searchTermLower),
      where('handle', '<=', searchTermLower + '\uf8ff'),
      limit(10)
    );
    
    // Search by display name
    const displayNameQuery = query(
      usersRef,
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );
    
    const [handleSnapshot, displayNameSnapshot] = await Promise.all([
      getDocs(handleQuery),
      getDocs(displayNameQuery)
    ]);
    
    const users = new Map();
    
    // Add handle matches
    handleSnapshot.forEach((doc) => {
      users.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    // Add display name matches
    displayNameSnapshot.forEach((doc) => {
      users.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    return Array.from(users.values());
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Reauthenticate user with password (required for sensitive operations)
export const reauthenticateUser = async (password) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user found');
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (error) {
    console.error('Error reauthenticating user:', error);
    throw error;
  }
};

// Delete user account and all associated data
export const deleteUserAccount = async () => {
  try {
    // Check if Firebase is configured
    if (!auth || !db) {
      throw new Error('Firebase is not configured. Cannot delete account in demo mode.');
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Step 1: Delete user profile from Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);
    } catch (firestoreError) {
      console.warn('Error deleting user profile from Firestore:', firestoreError);
      // Continue with auth deletion even if Firestore deletion fails
    }

    // Step 2: Delete the Firebase Auth user account
    await deleteUser(user);

    return true;
  } catch (error) {
    console.error('Error deleting user account:', error);
    
    // Add more specific error information
    if (error.message?.includes('Firebase is not configured')) {
      throw new Error('Account deletion is not available in demo mode');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security reasons, please sign out and sign back in, then try deleting your account again');
    } else {
      throw error;
    }
  }
};
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Add movie/show to watchlist
export const addToWatchlist = async (userId, item) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      watchlist: arrayUnion({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        release_date: item.release_date || item.first_air_date,
        vote_average: item.vote_average,
        media_type: item.media_type || (item.title ? 'movie' : 'tv'),
        addedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (userId, itemId, mediaType) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const updatedWatchlist = userData.watchlist.filter(
        item => !(item.id === itemId && item.media_type === mediaType)
      );
      
      await updateDoc(userRef, {
        watchlist: updatedWatchlist
      });
    }
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

// Add to favorites
export const addToFavorites = async (userId, item) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      favorites: arrayUnion({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        release_date: item.release_date || item.first_air_date,
        vote_average: item.vote_average,
        media_type: item.media_type || (item.title ? 'movie' : 'tv'),
        addedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove from favorites
export const removeFromFavorites = async (userId, itemId, mediaType) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const updatedFavorites = userData.favorites.filter(
        item => !(item.id === itemId && item.media_type === mediaType)
      );
      
      await updateDoc(userRef, {
        favorites: updatedFavorites
      });
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Rate movie/show
export const rateItem = async (userId, itemId, mediaType, rating) => {
  try {
    const userRef = doc(db, 'users', userId);
    const ratingKey = `ratings.${mediaType}_${itemId}`;
    
    await updateDoc(userRef, {
      [ratingKey]: {
        rating,
        ratedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error rating item:', error);
    throw error;
  }
};

// Mark as watched
export const markAsWatched = async (userId, item) => {
  try {
    const userRef = doc(db, 'users', userId);
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    const watchedArray = mediaType === 'movie' ? 'watchedMovies' : 'watchedTVShows';
    
    await updateDoc(userRef, {
      [watchedArray]: arrayUnion({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        release_date: item.release_date || item.first_air_date,
        vote_average: item.vote_average,
        media_type: mediaType,
        watchedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error marking as watched:', error);
    throw error;
  }
};

// Check if item is in user's lists
export const checkItemStatus = (userProfile, itemId, mediaType) => {
  if (!userProfile) return { inWatchlist: false, inFavorites: false, rating: 0, isWatched: false };
  
  const inWatchlist = userProfile.watchlist?.some(
    item => item.id === itemId && item.media_type === mediaType
  ) || false;
  
  const inFavorites = userProfile.favorites?.some(
    item => item.id === itemId && item.media_type === mediaType
  ) || false;
  
  const ratingKey = `${mediaType}_${itemId}`;
  const rating = userProfile.ratings?.[ratingKey]?.rating || 0;
  
  const watchedArray = mediaType === 'movie' ? 'watchedMovies' : 'watchedTVShows';
  const isWatched = userProfile[watchedArray]?.some(
    item => item.id === itemId
  ) || false;
  
  return { inWatchlist, inFavorites, rating, isWatched };
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Check, Heart, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addToWatchlist, removeFromWatchlist, addToFavorites, removeFromFavorites, checkItemStatus, markAsWatched, removeFromWatched } from '../services/userDataService';
import { getImageUrl } from '../services/tmdbApi';
import './MovieCard.css';

const MovieCard = ({ movie, onAuthRequired }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [itemStatus, setItemStatus] = useState({
    inWatchlist: false,
    inFavorites: false,
    rating: 0,
    isWatched: false
  });
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');

  useEffect(() => {
    if (userProfile) {
      const status = checkItemStatus(userProfile, movie.id, mediaType);
      setItemStatus(status);
    }
  }, [userProfile, movie.id, mediaType]);

  const handleCardClick = () => {
    const path = mediaType === 'movie' ? `/movie/${movie.id}` : `/tv/${movie.id}`;
    navigate(path);
  };

  const handleWatchlistClick = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      onAuthRequired?.();
      return;
    }

    setLoading(true);
    try {
      if (itemStatus.inWatchlist) {
        await removeFromWatchlist(currentUser.uid, movie.id, mediaType);
      } else {
        await addToWatchlist(currentUser.uid, movie);
      }
      
      // Update local state
      setItemStatus(prev => ({ ...prev, inWatchlist: !prev.inWatchlist }));
      
      // Refresh user profile
      const { getUserProfile } = await import('../services/authService');
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      onAuthRequired?.();
      return;
    }

    setLoading(true);
    try {
      if (itemStatus.inFavorites) {
        await removeFromFavorites(currentUser.uid, movie.id, mediaType);
      } else {
        await addToFavorites(currentUser.uid, movie);
      }
      
      // Update local state
      setItemStatus(prev => ({ ...prev, inFavorites: !prev.inFavorites }));
      
      // Refresh user profile
      const { getUserProfile } = await import('../services/authService');
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchedClick = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      onAuthRequired?.();
      return;
    }

    setLoading(true);
    try {
      if (itemStatus.isWatched) {
        await removeFromWatched(currentUser.uid, movie.id, mediaType);
      } else {
        await markAsWatched(currentUser.uid, movie);
      }
      
      // Update local state
      setItemStatus(prev => ({ ...prev, isWatched: !prev.isWatched }));
      
      // Refresh user profile
      const { getUserProfile } = await import('../services/authService');
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating watched status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movie-card" onClick={handleCardClick}>
      <div className="card-actions">
        <button 
          className={`action-btn watchlist-btn ${itemStatus.inWatchlist ? 'added' : ''}`}
          onClick={handleWatchlistClick}
          disabled={loading}
          title={itemStatus.inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {itemStatus.inWatchlist ? <Check size={16} /> : <Plus size={16} />}
        </button>
        
        <button 
          className={`action-btn favorite-btn ${itemStatus.inFavorites ? 'added' : ''}`}
          onClick={handleFavoriteClick}
          disabled={loading}
          title={itemStatus.inFavorites ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} fill={itemStatus.inFavorites ? 'currentColor' : 'none'} />
        </button>
      </div>

      <button 
        className={`watched-toggle ${itemStatus.isWatched ? 'watched' : ''}`}
        onClick={handleWatchedClick}
        disabled={loading}
        title={itemStatus.isWatched ? 'Mark as unwatched' : 'Mark as watched'}
      >
        {itemStatus.isWatched ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>

      {!imageError ? (
        <img
          src={getImageUrl(movie.poster_path)}
          alt={movie.title || movie.name}
          className="movie-poster"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="movie-poster-placeholder">
          <div className="placeholder-content">
            <Star size={24} />
            <span>No Image</span>
          </div>
        </div>
      )}

      <div className="movie-info">
        <h3 className="movie-title">{movie.title || movie.name}</h3>
        <div className="movie-meta">
          <span className="movie-year">
            {new Date(movie.release_date || movie.first_air_date).getFullYear() || 'TBA'}
          </span>
          {movie.vote_average > 0 && (
            <div className="movie-rating">
              <Star size={14} fill="currentColor" />
              {movie.vote_average.toFixed(1)}
            </div>
          )}
        </div>
        {movie.genre_ids && movie.genre_ids.length > 0 && (
          <div className="movie-genres">
            {movie.genre_ids.map(genreId => getGenreName(genreId)).join(' • ')}
          </div>
        )}
        {itemStatus.isWatched && (
          <div className="watched-indicator">
            <Check size={12} />
            Watched
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get genre name by ID
const getGenreName = (genreId) => {
  const movieGenres = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  };
  
  const tvGenres = {
    10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
    9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
  };
  
  return movieGenres[genreId] || tvGenres[genreId] || 'Unknown';
};

export default MovieCard;
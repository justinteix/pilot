import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rateItem, checkItemStatus, markAsWatched } from '../services/userDataService';
import './StarRating.css';

const StarRating = ({ 
  contentId, 
  mediaType, 
  size = 'medium',
  showLabel = true,
  seasonNumber = null, // For season ratings
  episodeNumber = null, // For episode ratings
  showNumber = null, // TV show ID for episodes/seasons
  content = null, // Full content object for auto-marking as watched
  onRatingChange,
  className = ''
}) => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // Generate unique identifier for the content being rated
  const getContentKey = () => {
    if (episodeNumber && seasonNumber && showNumber) {
      return `episode_${showNumber}_${seasonNumber}_${episodeNumber}`;
    } else if (seasonNumber && showNumber) {
      return `season_${showNumber}_${seasonNumber}`;
    } else {
      return `${mediaType}_${contentId}`;
    }
  };

  const contentKey = getContentKey();

  useEffect(() => {
    if (userProfile && contentId) {
      // Check for existing rating
      const ratingKey = contentKey;
      const existingRating = userProfile.ratings?.[ratingKey]?.rating || 0;
      setCurrentRating(existingRating);
    }
  }, [userProfile, contentId, contentKey]);

  const handleRatingClick = async (rating, isHalf = false) => {
    if (!currentUser) {
      // Could trigger auth modal here
      return;
    }

    const finalRating = isHalf ? rating - 0.5 : rating;
    
    setLoading(true);
    try {
      // Save the rating first
      await rateItem(currentUser.uid, contentKey, 'content', finalRating);
      setCurrentRating(finalRating);
      
      // Check if content should be auto-marked as watched
      if (content && finalRating > 0) {
        // Check if already watched (for movies/TV shows, not seasons/episodes)
        const shouldAutoWatch = !seasonNumber && !episodeNumber;
        
        if (shouldAutoWatch && userProfile) {
          const itemStatus = checkItemStatus(userProfile, contentId, mediaType);
          
          if (!itemStatus.isWatched) {
            // Auto-mark as watched since user is rating it
            const watchItem = {
              id: contentId,
              title: content.title || content.name,
              poster_path: content.poster_path,
              release_date: content.release_date || content.first_air_date,
              vote_average: content.vote_average,
              media_type: mediaType
            };
            
            await markAsWatched(currentUser.uid, watchItem);
          }
        }
      }
      
      // Update local user profile
      const { getUserProfile } = await import('../services/authService');
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
      
      // Call callback if provided
      onRatingChange?.(finalRating);
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (rating, isHalf = false) => {
    if (!loading) {
      const hoverValue = isHalf ? rating - 0.5 : rating;
      setHoverRating(hoverValue);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || currentRating;
  
  const starSize = {
    small: 16,
    medium: 20,
    large: 24,
    xl: 28
  }[size];

  const getRatingText = (rating) => {
    if (rating === 0) return 'Rate this';
    if (rating === 0.5) return 'Unwatchable';
    
    const texts = {
      1: 'Awful',
      2: 'Terrible', 
      3: 'Bad',
      4: 'Poor',
      5: 'Below Average',
      6: 'Average',
      7: 'Good',
      8: 'Great',
      9: 'Excellent',
      10: 'Masterpiece'
    };
    
    const wholeNumber = Math.floor(rating);
    const hasHalf = rating % 1 === 0.5;
    
    if (hasHalf) {
      return `${texts[wholeNumber]} to ${texts[wholeNumber + 1]}`;
    }
    
    return texts[wholeNumber] || `${rating}/10`;
  };

  if (!currentUser) {
    return null; // Don't show rating for non-authenticated users
  }

  // Helper function to determine star fill state
  const getStarFillState = (starNumber, rating) => {
    if (rating >= starNumber) return 'full';
    if (rating >= starNumber - 0.5) return 'half';
    return 'empty';
  };

  return (
    <div className={`star-rating ${size} ${className}`}>
      {showLabel && (
        <span className="rating-label">
          {currentRating > 0 ? `Your Rating: ${currentRating}/10` : 'Rate this:'}
        </span>
      )}
      <div 
        className="rating-stars"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
          const fillState = getStarFillState(star, displayRating);
          
          return (
            <div key={star} className="star-container">
              {/* Background star (always outline) */}
              <Star 
                size={starSize}
                fill="none"
                stroke="currentColor"
                className="star-outline"
              />
              
              {/* Half star fill */}
              {fillState === 'half' && (
                <Star 
                  size={starSize}
                  fill="currentColor"
                  className="star-half-fill"
                />
              )}
              
              {/* Full star fill */}
              {fillState === 'full' && (
                <Star 
                  size={starSize}
                  fill="currentColor"
                  className="star-full-fill"
                />
              )}
              
              {/* Invisible buttons for clicking */}
              <button
                className={`star-btn star-btn-left ${loading ? 'loading' : ''}`}
                onClick={() => handleRatingClick(star, true)}
                onMouseEnter={() => handleMouseEnter(star, true)}
                disabled={loading}
                title={`${getRatingText(star - 0.5)} (${star - 0.5}/10)`}
              />
              <button
                className={`star-btn star-btn-right ${loading ? 'loading' : ''}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => handleMouseEnter(star)}
                disabled={loading}
                title={`${getRatingText(star)} (${star}/10)`}
              />
            </div>
          );
        })}
      </div>
      <span className={`rating-text ${
        hoverRating > 0 
          ? 'rating-hint' 
          : currentRating > 0 
            ? 'current-rating'
            : 'no-rating'
      }`}>
        {hoverRating > 0 
          ? getRatingText(hoverRating)
          : currentRating > 0 
            ? getRatingText(currentRating)
            : getRatingText(0)
        }
      </span>
    </div>
  );
};

export default StarRating; 
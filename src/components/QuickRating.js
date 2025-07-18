import React, { useState } from 'react';
import { Star, Check, Heart } from 'lucide-react';
import './QuickRating.css';

const QuickRating = ({ 
  initialRating = 0, 
  initialWatched = false, 
  initialLiked = false,
  onRatingChange,
  onWatchedChange,
  onLikedChange,
  size = 'medium',
  showLabels = true
}) => {
  const [rating, setRating] = useState(initialRating);
  const [isWatched, setIsWatched] = useState(initialWatched);
  const [isLiked, setIsLiked] = useState(initialLiked);

  const handleRating = (newRating) => {
    setRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleWatched = () => {
    const newWatched = !isWatched;
    setIsWatched(newWatched);
    onWatchedChange?.(newWatched);
  };

  const handleLiked = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    onLikedChange?.(newLiked);
  };

  const starSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

  return (
    <div className={`quick-rating ${size}`}>
      <div className="rating-section">
        {showLabels && <span className="rating-label">Rate:</span>}
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className={`star-btn ${star <= rating ? 'active' : ''}`}
              onClick={() => handleRating(star)}
              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star size={starSize} fill={star <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </div>
      
      <div className="action-section">
        <button 
          className={`action-btn watched-btn ${isWatched ? 'active' : ''}`}
          onClick={handleWatched}
          title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
        >
          <Check size={iconSize} />
          {showLabels && <span>{isWatched ? 'Watched' : 'Watch'}</span>}
        </button>
        
        <button 
          className={`action-btn liked-btn ${isLiked ? 'active' : ''}`}
          onClick={handleLiked}
          title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={iconSize} fill={isLiked ? 'currentColor' : 'none'} />
          {showLabels && size !== 'small' && <span>{isLiked ? 'Liked' : 'Like'}</span>}
        </button>
      </div>
    </div>
  );
};

export default QuickRating;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Check } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    setIsInWatchlist(!isInWatchlist);
  };

  const getPosterUrl = (posterPath) => {
    if (!posterPath) return '/api/placeholder/300/450';
    return `https://image.tmdb.org/t/p/w300${posterPath}`;
  };

  return (
    <div className="movie-card" onClick={handleCardClick}>
      <button 
        className={`watchlist-btn ${isInWatchlist ? 'added' : ''}`}
        onClick={handleWatchlistClick}
        title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        {isInWatchlist ? <Check size={16} /> : <Plus size={16} />}
      </button>

      {movie.vote_average > 0 && (
        <div className="rating-overlay">
          <Star size={12} fill="currentColor" />
          {movie.vote_average.toFixed(1)}
        </div>
      )}

      <img
        src={getPosterUrl(movie.poster_path)}
        alt={movie.title || movie.name}
        className="movie-poster"
        loading="lazy"
      />

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
          <div className="movie-genre">
            {getGenreName(movie.genre_ids[0])}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get genre name by ID
const getGenreName = (genreId) => {
  const genres = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };
  return genres[genreId] || 'Unknown';
};

export default MovieCard;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Play, Plus, Check, Heart } from 'lucide-react';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Mock movie data
  const mockMovie = {
    id: 1,
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
    release_date: "2008-07-18",
    runtime: 152,
    vote_average: 9.0,
    vote_count: 28000,
    genres: [
      { id: 28, name: "Action" },
      { id: 80, name: "Crime" },
      { id: 18, name: "Drama" }
    ],
    director: "Christopher Nolan",
    cast: [
      { name: "Christian Bale", character: "Bruce Wayne / Batman" },
      { name: "Heath Ledger", character: "Joker" },
      { name: "Aaron Eckhart", character: "Harvey Dent" },
      { name: "Michael Caine", character: "Alfred" }
    ]
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMovie(mockMovie);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleRating = (rating) => {
    setUserRating(rating);
  };

  const getPosterUrl = (posterPath) => {
    if (!posterPath) return '/api/placeholder/400/600';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const getBackdropUrl = (backdropPath) => {
    if (!backdropPath) return '/api/placeholder/1200/675';
    return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
  };

  if (loading) {
    return (
      <div className="movie-detail">
        <div className="container">
          <div className="loading">Loading movie details...</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail">
        <div className="container">
          <div className="error">Movie not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail">
      <div 
        className="hero-backdrop"
        style={{ backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})` }}
      >
        <div className="hero-overlay">
          <div className="container">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
              Back
            </button>
            
            <div className="hero-content">
              <div className="movie-poster-large">
                <img
                  src={getPosterUrl(movie.poster_path)}
                  alt={movie.title}
                  className="poster-image"
                />
              </div>
              
              <div className="movie-details">
                <h1 className="movie-title">{movie.title}</h1>
                
                <div className="movie-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    {new Date(movie.release_date).getFullYear()}
                  </div>
                  <div className="meta-item">
                    <Clock size={16} />
                    {movie.runtime} min
                  </div>
                  <div className="meta-item rating">
                    <Star size={16} fill="currentColor" />
                    {movie.vote_average.toFixed(1)} ({movie.vote_count.toLocaleString()} votes)
                  </div>
                </div>
                
                <div className="genres">
                  {movie.genres.map(genre => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
                
                <p className="movie-overview">{movie.overview}</p>
                
                <div className="action-buttons">
                  <button className="btn btn-primary">
                    <Play size={18} />
                    Watch Trailer
                  </button>
                  <button 
                    className={`btn btn-secondary ${isInWatchlist ? 'active' : ''}`}
                    onClick={() => setIsInWatchlist(!isInWatchlist)}
                  >
                    {isInWatchlist ? <Check size={18} /> : <Plus size={18} />}
                    {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                  </button>
                  <button 
                    className={`btn btn-icon ${isLiked ? 'liked' : ''}`}
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                </div>
                
                <div className="user-rating">
                  <h3>Your Rating</h3>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className={`star-btn ${star <= userRating ? 'active' : ''}`}
                        onClick={() => handleRating(star)}
                      >
                        <Star size={24} fill={star <= userRating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className="cast-section">
          <h2>Cast</h2>
          <div className="cast-grid">
            {movie.cast.map((actor, index) => (
              <div key={index} className="cast-member">
                <div className="cast-avatar">
                  {actor.name.charAt(0)}
                </div>
                <div className="cast-info">
                  <div className="cast-name">{actor.name}</div>
                  <div className="cast-character">{actor.character}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
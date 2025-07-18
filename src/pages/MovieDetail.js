import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Play, Plus, Check, Heart } from 'lucide-react';
import { movieApi, tvApi } from '../services/tmdbApi';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Determine if this is a movie or TV show based on the URL
  const isMovie = location.pathname.startsWith('/movie/');
  const mediaType = isMovie ? 'movie' : 'tv';

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError('');
      
      try {
        let contentResponse, creditsResponse;
        
        if (isMovie) {
          contentResponse = await movieApi.getDetails(id);
          try {
            creditsResponse = await movieApi.getCredits(id);
          } catch (creditsErr) {
            console.warn('Could not fetch movie credits:', creditsErr);
          }
        } else {
          contentResponse = await tvApi.getDetails(id);
          try {
            creditsResponse = await tvApi.getCredits(id);
          } catch (creditsErr) {
            console.warn('Could not fetch TV credits:', creditsErr);
          }
        }
        
        setContent(contentResponse.data);
        setCast(creditsResponse?.data?.cast?.slice(0, 8) || []);
      } catch (err) {
        console.error('Error fetching content details:', err);
        setError('Failed to load content details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContent();
    }
  }, [id, isMovie]);

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

  const isSeasonReleased = (season) => {
    if (!season.air_date) return false;
    const airDate = new Date(season.air_date);
    const today = new Date();
    return airDate <= today;
  };

  const getSeasonsByType = (seasons) => {
    if (!seasons) return { regularSeasons: [], specials: [] };
    
    // Separate regular seasons and specials
    const regularSeasons = seasons.filter(season => season.season_number > 0);
    const specials = seasons.filter(season => season.season_number === 0);
    
    // Sort regular seasons by season number
    regularSeasons.sort((a, b) => a.season_number - b.season_number);
    
    return { regularSeasons, specials };
  };

  const renderSeasonCard = (season) => {
    const released = isSeasonReleased(season);
    const CardComponent = released ? Link : 'div';
    const cardProps = released ? {
      to: `/tv/${id}/season/${season.season_number}`
    } : {};

    return (
      <CardComponent
        key={season.id}
        {...cardProps}
        className={`season-card ${!released ? 'unreleased' : ''}`}
      >
        <div className="season-poster">
          {released && season.poster_path ? (
            <img
              src={getPosterUrl(season.poster_path)}
              alt={season.name}
              className="poster-image"
            />
          ) : (
            <div className="poster-placeholder">
              <Play size={48} />
              {!released && <span className="coming-soon">Coming Soon</span>}
            </div>
          )}
        </div>
        <div className="season-info">
          <h3 className="season-title">
            {season.name}
            {!released && <span className="unreleased-badge">Unreleased</span>}
          </h3>
          <div className="season-meta">
            <div className="meta-item">
              <Calendar size={14} />
              {season.air_date ? new Date(season.air_date).getFullYear() : 'TBA'}
            </div>
            <div className="meta-item">
              <Play size={14} />
              {season.episode_count} episodes
            </div>
            {released && season.vote_average > 0 && (
              <div className="meta-item rating">
                <Star size={14} fill="currentColor" />
                {season.vote_average.toFixed(1)}
              </div>
            )}
          </div>
          {!released && (
            <p className="season-unreleased-text">
              This season hasn't aired yet. Check back after the air date!
            </p>
          )}
        </div>
      </CardComponent>
    );
  };

  if (loading) {
    return (
      <div className="movie-detail">
        <div className="container">
          <div className="loading">Loading {mediaType} details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-detail">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="movie-detail">
        <div className="container">
          <div className="error">{isMovie ? 'Movie' : 'TV Show'} not found</div>
        </div>
      </div>
    );
  }

  // Helper functions to get the correct data based on content type
  const getTitle = () => content.title || content.name;
  const getReleaseDate = () => content.release_date || content.first_air_date;
  const getRuntime = () => {
    if (isMovie) {
      return content.runtime;
    } else {
      // For TV shows, show episode runtime or season info
      return content.episode_run_time?.[0] || content.number_of_seasons;
    }
  };
  const getRuntimeLabel = () => {
    if (isMovie) {
      return 'min';
    } else {
      return content.episode_run_time?.[0] ? 'min/ep' : 'seasons';
    }
  };

  return (
    <div className="movie-detail">
      <div 
        className="hero-backdrop"
        style={{ backgroundImage: `url(${getBackdropUrl(content.backdrop_path)})` }}
      >
        <div className="hero-overlay">
          <div className="container">
            <div className="movie-detail-header">
              <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
            
            <div className="hero-content">
              <div className="movie-poster-large">
                <img
                  src={getPosterUrl(content.poster_path)}
                  alt={getTitle()}
                  className="poster-image"
                />
              </div>
              
              <div className="movie-details">
                <h1 className="movie-title">{getTitle()}</h1>
                
                <div className="movie-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    {new Date(getReleaseDate()).getFullYear()}
                  </div>
                  {getRuntime() && (
                    <div className="meta-item">
                      <Clock size={16} />
                      {getRuntime()} {getRuntimeLabel()}
                    </div>
                  )}
                  <div className="meta-item rating">
                    <Star size={16} fill="currentColor" />
                    {content.vote_average.toFixed(1)} ({content.vote_count.toLocaleString()} votes)
                  </div>
                </div>
                
                <div className="genres">
                  {content.genres?.map(genre => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
                
                <p className="movie-overview">{content.overview}</p>
                
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
        {!isMovie && content.seasons && content.seasons.length > 0 && (() => {
          const { regularSeasons, specials } = getSeasonsByType(content.seasons);
          
          return (
            <>
              {regularSeasons.length > 0 && (
                <div className="seasons-section">
                  <h2>Seasons</h2>
                  <div className="seasons-grid">
                    {regularSeasons.map(renderSeasonCard)}
                  </div>
                </div>
              )}
              
              {specials.length > 0 && (
                <div className="seasons-section specials-section">
                  <h2>Specials</h2>
                  <div className="seasons-grid">
                    {specials.map(renderSeasonCard)}
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {cast.length > 0 && (
          <div className="cast-section">
            <h2>Cast</h2>
            <div className="cast-grid">
              {cast.map((actor, index) => (
                <div key={index} className="cast-member">
                  <div className="cast-avatar">
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="cast-photo"
                      />
                    ) : (
                      actor.name.charAt(0)
                    )}
                  </div>
                  <div className="cast-info">
                    <div className="cast-name">{actor.name}</div>
                    <div className="cast-character">{actor.character}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Play,
  Plus,
  Check,
  Heart,
  Eye,
  EyeOff,
} from "lucide-react";
import { movieApi, tvApi } from "../services/tmdbApi";
import { useAuth } from "../contexts/AuthContext";
import { markAsWatched, removeFromWatched, addToWatchlist, removeFromWatchlist, addToFavorites, removeFromFavorites, checkItemStatus } from "../services/userDataService";
import CastCrew from "../components/CastCrew";
import "./MovieDetail.css";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [content, setContent] = useState(null);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  // Determine if this is a movie or TV show based on the URL
  const isMovie = location.pathname.startsWith("/movie/");
  const mediaType = isMovie ? "movie" : "tv";

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError("");

      try {
        let contentResponse;

        if (isMovie) {
          contentResponse = await movieApi.getDetails(id);
        } else {
          contentResponse = await tvApi.getDetails(id);
        }

        setContent(contentResponse.data);
        
        // Extract cast and crew from the credits data (already included in getDetails)
        const credits = contentResponse.data.credits;
        
        const castData = credits?.cast?.slice(0, 12) || [];
        const crewData = credits?.crew || [];
        
        setCast(castData);
        
        // Get key crew members (director, producer, writer, etc.)
        const keyCrewJobs = ['Director', 'Producer', 'Executive Producer', 'Writer', 'Screenplay', 'Story', 'Creator', 'Showrunner'];
        const keyCrew = crewData.filter(member => 
          keyCrewJobs.includes(member.job) || member.department === 'Directing' || member.department === 'Writing'
        );
        
        setCrew(keyCrew);

        // Extract trailer from videos
        const videos = contentResponse.data.videos?.results || [];
        const trailerVideo =
          videos.find(
            (video) => video.type === "Trailer" && video.site === "YouTube"
          ) ||
          videos.find(
            (video) =>
              video.site === "YouTube" &&
              (video.type === "Teaser" || video.type === "Clip")
          );
        setTrailer(trailerVideo);
      } catch (err) {
        console.error("Error fetching content details:", err);
        setError("Failed to load content details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContent();
    }
  }, [id, isMovie]);

  // Check user's item status (watchlist, favorites, watched) when userProfile changes
  useEffect(() => {
    if (userProfile && content) {
      const status = checkItemStatus(userProfile, parseInt(id), mediaType);
      setIsInWatchlist(status.inWatchlist);
      setIsLiked(status.inFavorites);
      setIsWatched(status.isWatched);
      setUserRating(status.rating);
    }
  }, [userProfile, content, id, mediaType]);

  const handleRating = (rating) => {
    setUserRating(rating);
  };

  const handleWatchedClick = async () => {
    if (!currentUser) {
      // You could trigger an auth modal here if needed
      return;
    }

    try {
      if (isWatched) {
        await removeFromWatched(currentUser.uid, parseInt(id), mediaType);
      } else {
        await markAsWatched(currentUser.uid, {
          id: parseInt(id),
          title: content.title || content.name,
          poster_path: content.poster_path,
          release_date: content.release_date || content.first_air_date,
          vote_average: content.vote_average,
          media_type: mediaType
        });
      }
      
      // Update local state
      setIsWatched(!isWatched);
      
      // Refresh user profile
      const { getUserProfile } = await import('../services/authService');
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating watched status:', error);
    }
  };

  const handleWatchlistClick = async () => {
    if (!currentUser) {
      // You could trigger an auth modal here if needed
      return;
    }

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(currentUser.uid, parseInt(id), mediaType);
      } else {
        await addToWatchlist(currentUser.uid, {
          id: parseInt(id),
          title: content.title || content.name,
          poster_path: content.poster_path,
          release_date: content.release_date || content.first_air_date,
          vote_average: content.vote_average,
          media_type: mediaType
        });
      }
      
      // Update local state
      setIsInWatchlist(!isInWatchlist);
      
      // Refresh user profile
      const { getUserProfile } = await import('../services/authService');
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const handleFavoriteClick = async () => {
    if (!currentUser) {
      // You could trigger an auth modal here if needed
      return;
    }

    try {
      if (isLiked) {
        await removeFromFavorites(currentUser.uid, parseInt(id), mediaType);
      } else {
        await addToFavorites(currentUser.uid, {
          id: parseInt(id),
          title: content.title || content.name,
          poster_path: content.poster_path,
          release_date: content.release_date || content.first_air_date,
          vote_average: content.vote_average,
          media_type: mediaType
        });
      }
      
      // Update local state
      setIsLiked(!isLiked);
      
      // Refresh user profile
      const { getUserProfile } = await import('../services/authService');
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleWatchTrailer = () => {
    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
    }
  };

  const getPosterUrl = (posterPath) => {
    if (!posterPath) return "/api/placeholder/400/600";
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const getBackdropUrl = (backdropPath) => {
    if (!backdropPath) return "/api/placeholder/1200/675";
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
    const regularSeasons = seasons.filter((season) => season.season_number > 0);
    const specials = seasons.filter((season) => season.season_number === 0);

    // Sort regular seasons by season number
    regularSeasons.sort((a, b) => a.season_number - b.season_number);

    return { regularSeasons, specials };
  };

  const renderSeasonCard = (season) => {
    const released = isSeasonReleased(season);
    const CardComponent = released ? Link : "div";
    const cardProps = released
      ? {
          to: `/tv/${id}/season/${season.season_number}`,
        }
      : {};

    return (
      <CardComponent
        key={season.id}
        {...cardProps}
        className={`season-card ${!released ? "unreleased" : ""}`}
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
              {season.air_date
                ? new Date(season.air_date).getFullYear()
                : "TBA"}
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
          <div className="error">{isMovie ? "Movie" : "TV Show"} not found</div>
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
      return "min";
    } else {
      return content.episode_run_time?.[0] ? "min/ep" : "seasons";
    }
  };

  return (
    <div className="movie-detail">
      <div
        className="hero-backdrop"
        style={{
          backgroundImage: `url(${getBackdropUrl(content.backdrop_path)})`,
        }}
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
                    {content.vote_average.toFixed(1)} (
                    {content.vote_count.toLocaleString()} votes)
                  </div>
                </div>

                <div className="genres">
                  {content.genres?.map((genre) => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>

                <p className="movie-overview">{content.overview}</p>

                <div className="action-buttons">
                  {trailer && (
                    <button
                      className="btn btn-primary"
                      onClick={handleWatchTrailer}
                      title={`Watch ${trailer.name || "Trailer"}`}
                    >
                      <Play size={18} />
                      Watch Trailer
                    </button>
                  )}
                  <button
                    className={`btn btn-secondary ${
                      isInWatchlist ? "active" : ""
                    }`}
                    onClick={handleWatchlistClick}
                  >
                    {isInWatchlist ? <Check size={18} /> : <Plus size={18} />}
                    {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                  </button>
                  <button
                    className={`btn btn-secondary ${isWatched ? "active watched" : ""}`}
                    onClick={handleWatchedClick}
                    title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                  >
                    {isWatched ? <Eye size={18} /> : <EyeOff size={18} />}
                    {isWatched ? "Watched" : "Mark as Watched"}
                  </button>
                  <button
                    className={`btn btn-icon ${isLiked ? "liked" : ""}`}
                    onClick={handleFavoriteClick}
                  >
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="user-rating">
                  <h3>Your Rating</h3>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`star-btn ${
                          star <= userRating ? "active" : ""
                        }`}
                        onClick={() => handleRating(star)}
                      >
                        <Star
                          size={24}
                          fill={star <= userRating ? "currentColor" : "none"}
                        />
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
        {!isMovie &&
          content.seasons &&
          content.seasons.length > 0 &&
          (() => {
            const { regularSeasons, specials } = getSeasonsByType(
              content.seasons
            );

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

        <CastCrew cast={cast} crew={crew} />
      </div>
    </div>
  );
};

export default MovieDetail;

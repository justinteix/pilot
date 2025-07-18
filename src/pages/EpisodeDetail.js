import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Heart, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { tvApi } from '../services/tmdbApi';
import SeasonNavigator from '../components/SeasonNavigator';
import EpisodeNavigator from '../components/EpisodeNavigator';
import QuickRating from '../components/QuickRating';
import './EpisodeDetail.css';

const EpisodeDetail = () => {
  const { tvId, seasonNumber, episodeNumber } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [season, setSeason] = useState(null);
  const [tvShow, setTvShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isWatched, setIsWatched] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const [episodeResponse, seasonResponse, tvResponse] = await Promise.all([
          tvApi.getEpisode(tvId, seasonNumber, episodeNumber),
          tvApi.getSeason(tvId, seasonNumber),
          tvApi.getDetails(tvId)
        ]);
        
        setEpisode(episodeResponse.data);
        setSeason(seasonResponse.data);
        setTvShow(tvResponse.data);
      } catch (err) {
        console.error('Error fetching episode details:', err);
        setError('Failed to load episode details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (tvId && seasonNumber && episodeNumber) {
      fetchEpisodeData();
    }
  }, [tvId, seasonNumber, episodeNumber]);

  const handleRating = (rating) => {
    setUserRating(rating);
  };

  const getStillUrl = (stillPath) => {
    if (!stillPath) return '/api/placeholder/800/450';
    return `https://image.tmdb.org/t/p/w780${stillPath}`;
  };

  if (loading) {
    return (
      <div className="episode-detail">
        <div className="container">
          <div className="loading">Loading episode details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="episode-detail">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  if (!episode || !tvShow || !season) {
    return (
      <div className="episode-detail">
        <div className="container">
          <div className="error">Episode not found</div>
        </div>
      </div>
    );
  }

  // Find current episode index and determine prev/next episodes
  const currentEpisodeIndex = season.episodes?.findIndex(ep => ep.episode_number === parseInt(episodeNumber));
  const prevEpisode = currentEpisodeIndex > 0 ? season.episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode = currentEpisodeIndex < season.episodes.length - 1 ? season.episodes[currentEpisodeIndex + 1] : null;

  return (
    <div className="episode-detail">
      <div className="container">
        <div className="episode-header">
          <button className="back-btn" onClick={() => navigate(`/tv/${tvId}/season/${seasonNumber}`)}>
            <ArrowLeft size={20} />
            Back to Season {seasonNumber}
          </button>
          
          <div className="breadcrumb">
            <span 
              className="breadcrumb-link" 
              onClick={() => navigate(`/tv/${tvId}`)}
            >
              {tvShow.name}
            </span>
            <span className="breadcrumb-separator">›</span>
            <span 
              className="breadcrumb-link" 
              onClick={() => navigate(`/tv/${tvId}/season/${seasonNumber}`)}
            >
              Season {seasonNumber}
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Episode {episodeNumber}</span>
          </div>
          
          <div className="navigation-controls">
            <SeasonNavigator tvShow={tvShow} currentSeason={seasonNumber} />
            <EpisodeNavigator season={season} currentEpisode={episodeNumber} />
          </div>
        </div>

        <div className="episode-hero">
          <div className="episode-still-large">
            <img
              src={getStillUrl(episode.still_path)}
              alt={episode.name}
              className="still-image"
            />
          </div>
          
          <div className="episode-info">
            <div className="episode-number-badge">
              Episode {episode.episode_number}
            </div>
            
            <h1 className="episode-title">{episode.name}</h1>
            
            <div className="episode-meta">
              <div className="meta-item">
                <Calendar size={16} />
                {new Date(episode.air_date).toLocaleDateString()}
              </div>
              {episode.runtime && (
                <div className="meta-item">
                  <Clock size={16} />
                  {episode.runtime} min
                </div>
              )}
              {episode.vote_average > 0 && (
                <div className="meta-item rating">
                  <Star size={16} fill="currentColor" />
                  {episode.vote_average.toFixed(1)} ({episode.vote_count} votes)
                </div>
              )}
            </div>
            
            {episode.overview && (
              <p className="episode-overview">{episode.overview}</p>
            )}
            
            <QuickRating
              initialRating={userRating}
              initialWatched={isWatched}
              initialLiked={isLiked}
              onRatingChange={setUserRating}
              onWatchedChange={setIsWatched}
              onLikedChange={setIsLiked}
              size="large"
              showLabels={true}
            />
          </div>
        </div>

        <div className="episode-navigation">
          <div className="nav-button-container">
            {prevEpisode ? (
              <button
                className="nav-button prev-button"
                onClick={() => navigate(`/tv/${tvId}/season/${seasonNumber}/episode/${prevEpisode.episode_number}`)}
              >
                <ChevronLeft size={20} />
                <div className="nav-episode-info">
                  <span className="nav-episode-label">Previous Episode</span>
                  <span className="nav-episode-title">{prevEpisode.name}</span>
                </div>
              </button>
            ) : (
              <div></div>
            )}
            
            {nextEpisode ? (
              <button
                className="nav-button next-button"
                onClick={() => navigate(`/tv/${tvId}/season/${seasonNumber}/episode/${nextEpisode.episode_number}`)}
              >
                <div className="nav-episode-info">
                  <span className="nav-episode-label">Next Episode</span>
                  <span className="nav-episode-title">{nextEpisode.name}</span>
                </div>
                <ChevronRight size={20} />
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>

        {episode.guest_stars && episode.guest_stars.length > 0 && (
          <div className="guest-stars-section">
            <h2>Guest Stars</h2>
            <div className="cast-grid">
              {episode.guest_stars.slice(0, 8).map((actor, index) => (
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

export default EpisodeDetail;
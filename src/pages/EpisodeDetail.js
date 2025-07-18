import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Heart, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { tvApi } from '../services/tmdbApi';
import SeasonNavigator from '../components/SeasonNavigator';
import EpisodeNavigator from '../components/EpisodeNavigator';
import EpisodeCastCrew from '../components/EpisodeCastCrew';
import StarRating from '../components/StarRating';
import './EpisodeDetail.css';

const EpisodeDetail = () => {
  const { tvId, seasonNumber, episodeNumber } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [season, setSeason] = useState(null);
  const [tvShow, setTvShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
            
            <div className="episode-actions">
              <div className="user-rating">
                <StarRating
                  contentId={parseInt(tvId)}
                  mediaType="tv"
                  size="medium"
                  showLabel={true}
                  seasonNumber={parseInt(seasonNumber)}
                  episodeNumber={parseInt(episodeNumber)}
                  showNumber={parseInt(tvId)}
                  content={episode}
                />
              </div>
              
              <div className="action-buttons">
                <button 
                  className={`btn btn-icon ${isLiked ? "liked" : ""}`}
                  onClick={() => setIsLiked(!isLiked)}
                  title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
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

        <EpisodeCastCrew 
          guestStars={episode.guest_stars} 
          crew={episode.crew} 
        />
      </div>
    </div>
  );
};

export default EpisodeDetail;
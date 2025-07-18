import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Play } from 'lucide-react';
import { tvApi } from '../services/tmdbApi';
import SeasonNavigator from '../components/SeasonNavigator';
import './SeasonDetail.css';

const SeasonDetail = () => {
  const { tvId, seasonNumber } = useParams();
  const navigate = useNavigate();
  const [season, setSeason] = useState(null);
  const [tvShow, setTvShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeasonData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const [seasonResponse, tvResponse] = await Promise.all([
          tvApi.getSeason(tvId, seasonNumber),
          tvApi.getDetails(tvId)
        ]);
        
        setSeason(seasonResponse.data);
        setTvShow(tvResponse.data);
      } catch (err) {
        console.error('Error fetching season details:', err);
        setError('Failed to load season details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (tvId && seasonNumber) {
      fetchSeasonData();
    }
  }, [tvId, seasonNumber]);

  const getPosterUrl = (posterPath) => {
    if (!posterPath) return '/api/placeholder/400/600';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const getStillUrl = (stillPath) => {
    if (!stillPath) return '/api/placeholder/400/225';
    return `https://image.tmdb.org/t/p/w500${stillPath}`;
  };

  const isEpisodeReleased = (episode) => {
    if (!episode.air_date) return false;
    const airDate = new Date(episode.air_date);
    const today = new Date();
    return airDate <= today;
  };

  if (loading) {
    return (
      <div className="season-detail">
        <div className="container">
          <div className="loading">Loading season details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="season-detail">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  if (!season || !tvShow) {
    return (
      <div className="season-detail">
        <div className="container">
          <div className="error">Season not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="season-detail">
      <div className="container">
        <div className="season-header">
          <button className="back-btn" onClick={() => navigate(`/tv/${tvId}`)}>
            <ArrowLeft size={20} />
            Back to {tvShow.name}
          </button>
          
          <SeasonNavigator tvShow={tvShow} currentSeason={seasonNumber} />
          
          <div className="season-info">
            <div className="season-poster">
              <img
                src={getPosterUrl(season.poster_path)}
                alt={season.name}
                className="poster-image"
              />
            </div>
            
            <div className="season-details">
              <h1 className="season-title">{season.name}</h1>
              <div className="season-meta">
                <div className="meta-item">
                  <Calendar size={16} />
                  {new Date(season.air_date).getFullYear()}
                </div>
                <div className="meta-item">
                  <Play size={16} />
                  {season.episodes?.length || 0} episodes
                </div>
                {season.vote_average > 0 && (
                  <div className="meta-item rating">
                    <Star size={16} fill="currentColor" />
                    {season.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="episodes-section">
          <h2>Episodes</h2>
          <div className="episodes-list">
            {season.episodes?.map((episode) => {
              const released = isEpisodeReleased(episode);
              const CardComponent = released ? Link : 'div';
              const cardProps = released ? {
                to: `/tv/${tvId}/season/${seasonNumber}/episode/${episode.episode_number}`
              } : {};

              return (
                <CardComponent
                  key={episode.id}
                  {...cardProps}
                  className={`episode-card ${!released ? 'unreleased' : ''}`}
                >
                  <div className="episode-still">
                    {released && episode.still_path ? (
                      <img
                        src={getStillUrl(episode.still_path)}
                        alt={episode.name}
                        className="still-image"
                      />
                    ) : (
                      <div className="still-placeholder">
                        <Play size={32} />
                        {!released && <span className="coming-soon">Coming Soon</span>}
                      </div>
                    )}
                    <div className="episode-number">
                      {episode.episode_number}
                    </div>
                  </div>
                
                  <div className="episode-info">
                    <h3 className="episode-title">
                      {episode.name || `Episode ${episode.episode_number}`}
                      {!released && <span className="unreleased-badge">Unreleased</span>}
                    </h3>
                    <div className="episode-meta">
                      <div className="meta-item">
                        <Calendar size={14} />
                        {episode.air_date ? 
                          new Date(episode.air_date).toLocaleDateString() : 
                          'TBA'
                        }
                      </div>
                      {episode.runtime && (
                        <div className="meta-item">
                          <Clock size={14} />
                          {episode.runtime} min
                        </div>
                      )}
                      {released && episode.vote_average > 0 && (
                        <div className="meta-item rating">
                          <Star size={14} fill="currentColor" />
                          {episode.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    {episode.overview && released && (
                      <p className="episode-overview">{episode.overview}</p>
                    )}
                    
                    {!released && (
                      <p className="episode-overview unreleased-text">
                        This episode hasn't aired yet. Check back after the air date!
                      </p>
                    )}
                  </div>
                </CardComponent>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonDetail;
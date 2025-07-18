import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Play } from 'lucide-react';
import './EpisodeNavigator.css';

const EpisodeNavigator = ({ season, currentEpisode }) => {
  const { tvId, seasonNumber } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!season?.episodes || season.episodes.length <= 1) {
    return null;
  }

  const currentEpisodeNumber = parseInt(currentEpisode);
  const episodes = season.episodes;

  return (
    <div className="episode-navigator">
      <button 
        className="episode-navigator-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Play size={14} />
        <span>Episode {currentEpisodeNumber}</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isExpanded && (
        <div className="episode-navigator-dropdown">
          <div className="episode-navigator-header">
            <span>All Episodes</span>
          </div>
          <div className="episode-navigator-list">
            {episodes.map((episode) => (
              <Link
                key={episode.id}
                to={`/tv/${tvId}/season/${seasonNumber}/episode/${episode.episode_number}`}
                className={`episode-navigator-item ${
                  episode.episode_number === currentEpisodeNumber ? 'active' : ''
                }`}
                onClick={() => setIsExpanded(false)}
              >
                <div className="episode-navigator-number">
                  {episode.episode_number}
                </div>
                <div className="episode-navigator-info">
                  <span className="episode-name">{episode.name}</span>
                  <span className="episode-date">
                    {new Date(episode.air_date).toLocaleDateString()}
                  </span>
                </div>
                {episode.vote_average > 0 && (
                  <div className="episode-rating">
                    ★ {episode.vote_average.toFixed(1)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EpisodeNavigator;
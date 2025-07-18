import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './SeasonNavigator.css';

const SeasonNavigator = ({ tvShow, currentSeason }) => {
  const { tvId } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tvShow?.seasons || tvShow.seasons.length <= 1) {
    return null;
  }

  const currentSeasonNumber = parseInt(currentSeason);
  const seasons = tvShow.seasons.filter(season => season.season_number >= 0); // Filter out specials if needed

  return (
    <div className="season-navigator">
      <button 
        className="season-navigator-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Season {currentSeasonNumber}</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isExpanded && (
        <div className="season-navigator-dropdown">
          {seasons.map((season) => (
            <Link
              key={season.id}
              to={`/tv/${tvId}/season/${season.season_number}`}
              className={`season-navigator-item ${
                season.season_number === currentSeasonNumber ? 'active' : ''
              }`}
              onClick={() => setIsExpanded(false)}
            >
              <div className="season-navigator-info">
                <span className="season-name">{season.name}</span>
                <span className="season-episodes">{season.episode_count} episodes</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeasonNavigator;
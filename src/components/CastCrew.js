import React from 'react';
import './CastCrew.css';

const CastCrew = ({ cast = [], crew = [], showCastTitle = true, showCrewTitle = true, maxCast = 12, maxCrew = 8 }) => {
  // Filter key crew members
  const keyCrewJobs = ['Director', 'Producer', 'Executive Producer', 'Writer', 'Screenplay', 'Story', 'Creator', 'Showrunner'];
  const keyCrew = crew.filter(member => 
    keyCrewJobs.includes(member.job) || member.department === 'Directing' || member.department === 'Writing'
  ).slice(0, maxCrew);

  const displayCast = cast.slice(0, maxCast);

  if (displayCast.length === 0 && keyCrew.length === 0) {
    return null;
  }

  return (
    <div className="cast-crew-section">
      {displayCast.length > 0 && (
        <div className="cast-section">
          {showCastTitle && <h2>Cast</h2>}
          <div className="cast-grid">
            {displayCast.map((actor, index) => (
              <div key={`cast-${index}`} className="cast-member">
                <div className="cast-avatar">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                      className="cast-photo"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {actor.name.charAt(0)}
                    </div>
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

      {keyCrew.length > 0 && (
        <div className="crew-section">
          {showCrewTitle && <h2>Crew</h2>}
          <div className="crew-grid">
            {keyCrew.map((member, index) => (
              <div key={`crew-${index}`} className="crew-member">
                <div className="crew-avatar">
                  {member.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                      alt={member.name}
                      className="crew-photo"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="crew-info">
                  <div className="crew-name">{member.name}</div>
                  <div className="crew-job">{member.job}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CastCrew;
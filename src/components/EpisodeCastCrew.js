import React from 'react';
import './EpisodeCastCrew.css';

const EpisodeCastCrew = ({ guestStars = [], crew = [], maxGuests = 8, maxCrew = 6 }) => {
  // Filter key crew members for episodes (directors, writers)
  const keyCrewJobs = ['Director', 'Writer', 'Teleplay', 'Story'];
  const keyCrew = crew.filter(member => keyCrewJobs.includes(member.job)).slice(0, maxCrew);

  const displayGuests = guestStars.slice(0, maxGuests);

  if (displayGuests.length === 0 && keyCrew.length === 0) {
    return null;
  }

  return (
    <div className="episode-cast-crew-section">
      {displayGuests.length > 0 && (
        <div className="guest-stars-section">
          <h2>Guest Stars</h2>
          <div className="cast-grid">
            {displayGuests.map((actor, index) => (
              <div key={`guest-${index}`} className="cast-member">
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
        <div className="episode-crew-section">
          <h2>Episode Crew</h2>
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

export default EpisodeCastCrew;
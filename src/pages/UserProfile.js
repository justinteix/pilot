import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Film, Tv, Star, Calendar, TrendingUp, Heart, MapPin, Globe, Edit3, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getUserStats } from '../services/authService';
import MovieCard from '../components/MovieCard';
import ProfileEditModal from '../components/ProfileEditModal';
import PilotLogo from '../components/PilotLogo';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile: currentUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('watchlist');
  const [profileData, setProfileData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userMovies, setUserMovies] = useState({
    watchlist: [],
    favorites: [],
    ratings: [],
    watched: []
  });

  const isOwnProfile = currentUser && (userId === currentUser.uid || !userId);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        
        let targetUserId = userId;
        let profile = null;
        
        // If no userId provided or it's current user's ID, show current user's profile
        if (!userId || (currentUser && userId === currentUser.uid)) {
          profile = currentUserProfile;
          targetUserId = currentUser?.uid;
        } else {
          // Load other user's profile
          profile = await getUserProfile(userId);
        }
        
        if (!profile) {
          navigate('/profile'); // Redirect to own profile if user not found
          return;
        }
        
        setProfileData(profile);
        
        // Load user stats
        const stats = await getUserStats(targetUserId);
        setUserStats(stats);
        
        // Load user's movies (watchlist, favorites, etc.)
        // This would typically come from the profile data
        const allWatched = [
          ...(profile.watchedMovies || []),
          ...(profile.watchedTVShows || [])
        ];
        
        setUserMovies({
          watchlist: profile.watchlist || [],
          favorites: profile.favorites || [],
          ratings: Object.entries(profile.ratings || {}).map(([movieId, rating]) => ({
            movieId,
            rating,
            // You'd fetch movie details here
          })),
          watched: allWatched
        });
        
      } catch (error) {
        console.error('Error loading user profile:', error);
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, currentUser, currentUserProfile, navigate]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfileData(updatedProfile);
  };

  const tabs = [
    { id: 'watchlist', label: 'Watchlist', icon: Film, count: userMovies.watchlist.length },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: userMovies.favorites.length },
    { id: 'watched', label: 'Watched', icon: Eye, count: userMovies.watched.length },
    { id: 'ratings', label: 'Ratings', icon: Star, count: userMovies.ratings.length },
    { id: 'stats', label: 'Stats', icon: TrendingUp, count: null }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'watchlist':
        return (
          <div className="movies-grid">
            {userMovies.watchlist.length > 0 ? (
              userMovies.watchlist.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))
            ) : (
              <div className="empty-state">
                {isOwnProfile ? "Your watchlist is empty. Start adding some movies!" : "No movies in watchlist yet."}
              </div>
            )}
          </div>
        );
      case 'favorites':
        return (
          <div className="movies-grid">
            {userMovies.favorites.length > 0 ? (
              userMovies.favorites.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))
            ) : (
              <div className="empty-state">
                {isOwnProfile ? "No favorites yet. Start adding some!" : "No favorite movies yet."}
              </div>
            )}
          </div>
        );
      case 'watched':
        return (
          <div className="movies-grid">
            {userMovies.watched.length > 0 ? (
              userMovies.watched.map(movie => (
                <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} />
              ))
            ) : (
              <div className="empty-state">
                {isOwnProfile ? "No watched movies or shows yet. Start watching!" : "No watched content yet."}
              </div>
            )}
          </div>
        );
      case 'ratings':
        return (
          <div className="movies-grid">
            {userMovies.ratings.length > 0 ? (
              userMovies.ratings.map(item => (
                <div key={item.movieId} className="rated-movie">
                  {/* Movie card with rating overlay */}
                  <div className="rating-badge">
                    <Star size={12} />
                    {item.rating}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                {isOwnProfile ? "No ratings yet. Rate some movies!" : "No movie ratings yet."}
              </div>
            )}
          </div>
        );
      case 'stats':
        return (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Film />
              </div>
              <div className="stat-info">
                <div className="stat-number">{userStats?.moviesWatched || 0}</div>
                <div className="stat-label">Movies Watched</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Tv />
              </div>
              <div className="stat-info">
                <div className="stat-number">{userStats?.tvShowsWatched || 0}</div>
                <div className="stat-label">TV Shows Watched</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Star />
              </div>
              <div className="stat-info">
                <div className="stat-number">{userStats?.totalRatings || 0}</div>
                <div className="stat-label">Total Ratings</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp />
              </div>
              <div className="stat-info">
                <div className="stat-number">{userStats?.averageRating || 0}</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-error">
        <h2>Profile not found</h2>
        <p>The user profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  const joinDate = profileData.createdAt ? 
    new Date(profileData.createdAt.seconds * 1000).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }) : 'Recently';

  return (
    <div className="user-profile">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {profileData.photoURL ? (
              <img src={profileData.photoURL} alt={profileData.displayName} className="avatar-image" />
            ) : (
              <User size={40} />
            )}
          </div>
          
          <div className="profile-info">
            <div className="profile-header-top">
              <div>
                <h1 className="profile-name">{profileData.displayName || 'Movie Enthusiast'}</h1>
                {profileData.handle && (
                  <p className="profile-username">@{profileData.handle}</p>
                )}
              </div>
              
              {isOwnProfile && (
                <button 
                  className="edit-profile-btn"
                  onClick={() => setEditModalOpen(true)}
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              )}
            </div>
            
            {profileData.bio && (
              <p className="profile-bio">{profileData.bio}</p>
            )}
            
            <div className="profile-meta">
              <div className="meta-item">
                <Calendar size={16} />
                Joined {joinDate}
              </div>
              {profileData.location && (
                <div className="meta-item">
                  <MapPin size={16} />
                  {profileData.location}
                </div>
              )}
              {profileData.website && (
                <div className="meta-item">
                  <Globe size={16} />
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={18} />
                {tab.label}
                {tab.count !== null && (
                  <span className="tab-count">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="profile-content">
          {renderTabContent()}
        </div>
      </div>
      
      {isOwnProfile && (
        <ProfileEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default UserProfile;
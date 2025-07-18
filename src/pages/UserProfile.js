import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Film, Tv, Star, Calendar, TrendingUp, Heart, MapPin, Globe, Edit3, Eye, ArrowUpDown, Clock, Award, ChevronDown, ChevronUp, Play } from 'lucide-react';
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
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all', 'movie', 'tv'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'rating', 'recent', 'newest'
  const [sortExpanded, setSortExpanded] = useState(false); // Controls sort visibility
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
        
        // Process ratings data - convert from new format to displayable items
        const ratingsArray = [];
        const ratings = profile.ratings || {};
        
        Object.entries(ratings).forEach(([contentKey, ratingData]) => {
          // Skip season and episode ratings for now, only show movie/TV ratings
          if (contentKey.startsWith('movie_') || contentKey.startsWith('tv_')) {
            const [mediaType, contentId] = contentKey.split('_');
            const rating = ratingData.rating || ratingData; // Handle both new and old format
            
            // Find the content in watchlist, favorites, or watched to get details
            const allContent = [
              ...(profile.watchlist || []),
              ...(profile.favorites || []),
              ...(profile.watchedMovies || []),
              ...(profile.watchedTVShows || [])
            ];
            
            let contentDetails = allContent.find(item => 
              item.id === parseInt(contentId) && 
              (item.media_type === mediaType || (mediaType === 'movie' && item.title) || (mediaType === 'tv' && item.name))
            );
            
            // If not found in user's lists, create a minimal object
            if (!contentDetails) {
              contentDetails = {
                id: parseInt(contentId),
                media_type: mediaType,
                title: mediaType === 'movie' ? `Movie ${contentId}` : undefined,
                name: mediaType === 'tv' ? `TV Show ${contentId}` : undefined,
                poster_path: null,
                vote_average: 0
              };
            }
            
            ratingsArray.push({
              ...contentDetails,
              userRating: rating,
              ratedAt: ratingData.ratedAt || new Date().toISOString(),
              contentKey
            });
          }
        });
        
        setUserMovies({
          watchlist: profile.watchlist || [],
          favorites: profile.favorites || [],
          ratings: ratingsArray,
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

  // Reset filter and sort when changing tabs
  useEffect(() => {
    setMediaFilter('all');
    setSortBy('default');
    setSortExpanded(false); // Collapse sorting when switching tabs
  }, [activeTab]);

  // Function to sort content by different criteria
  const sortContent = (items, sortOption) => {
    if (sortOption === 'default') return items;
    
    const sortedItems = [...items].sort((a, b) => {
      switch (sortOption) {
        case 'rating':
          // Sort by TMDB/community rating
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'userRating':
          // Sort by user's personal rating (highest to lowest)
          return (b.userRating || 0) - (a.userRating || 0);
        case 'recent':
          // Use ratedAt for ratings, otherwise use addedAt/watchedAt
          const aDate = new Date(a.ratedAt || a.addedAt || a.watchedAt || 0);
          const bDate = new Date(b.ratedAt || b.addedAt || b.watchedAt || 0);
          return bDate - aDate;
        case 'newest':
          const aRelease = new Date(a.release_date || a.first_air_date || 0);
          const bRelease = new Date(b.release_date || b.first_air_date || 0);
          return bRelease - aRelease;
        default:
          return 0;
      }
    });
    
    return sortedItems;
  };

  // Function to filter content by media type
  const filterByMediaType = (items, filter) => {
    if (filter === 'all') return items;
    return items.filter(item => item.media_type === filter);
  };

  // Function to apply both filtering and sorting
  const processContent = (items, filter, sort) => {
    const filtered = filterByMediaType(items, filter);
    return sortContent(filtered, sort);
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfileData(updatedProfile);
  };

  // Get filtered counts for tab labels
  const getFilteredCount = (items, filter) => {
    return filterByMediaType(items, filter).length;
  };

  const tabs = [
    { id: 'watchlist', label: 'Watchlist', icon: Film, count: getFilteredCount(userMovies.watchlist, mediaFilter) },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: getFilteredCount(userMovies.favorites, mediaFilter) },
    { id: 'watched', label: 'Watched', icon: Eye, count: getFilteredCount(userMovies.watched, mediaFilter) },
    { id: 'ratings', label: 'Ratings', icon: Star, count: userMovies.ratings.length },
    { id: 'stats', label: 'Stats', icon: TrendingUp, count: null }
  ];

  const renderFilterControls = () => {
    if (activeTab === 'stats') return null;
    
    return (
      <div className="controls-section">
        <div className="filter-controls">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${mediaFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMediaFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${mediaFilter === 'movie' ? 'active' : ''}`}
              onClick={() => setMediaFilter('movie')}
            >
              <Film size={14} />
              Movies
            </button>
            <button 
              className={`filter-btn ${mediaFilter === 'tv' ? 'active' : ''}`}
              onClick={() => setMediaFilter('tv')}
            >
              <Tv size={14} />
              TV Shows
            </button>
          </div>
        </div>
        
        <div className="sort-controls">
          <div className="sort-header">
            <div className="sort-label">
              <ArrowUpDown size={16} />
              <span>Sort</span>
              {!sortExpanded && sortBy !== 'default' && (
                <span className="sort-indicator">
                  ({sortBy === 'rating' && 'Rating'} 
                   {sortBy === 'userRating' && 'Your Rating'}
                   {sortBy === 'recent' && 'Recent'}
                   {sortBy === 'newest' && 'Newest'})
                </span>
              )}
            </div>
            <button 
              className="sort-toggle"
              onClick={() => setSortExpanded(!sortExpanded)}
              title={sortExpanded ? 'Collapse sorting' : 'Expand sorting'}
            >
              {sortExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {sortExpanded && (
            <div className="sort-buttons">
              <button 
                className={`sort-btn ${sortBy === 'default' ? 'active' : ''}`}
                onClick={() => setSortBy('default')}
              >
                Default
              </button>
              <button 
                className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                <Award size={14} />
                Rating
              </button>
              <button 
                className={`sort-btn ${sortBy === 'userRating' ? 'active' : ''}`}
                onClick={() => setSortBy('userRating')}
              >
                <Star size={14} />
                Your Rating
              </button>
              <button 
                className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
                onClick={() => setSortBy('recent')}
              >
                <Clock size={14} />
                Recent
              </button>
              <button 
                className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
                onClick={() => setSortBy('newest')}
              >
                <Calendar size={14} />
                Newest
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'watchlist':
        const filteredWatchlist = filterByMediaType(userMovies.watchlist, mediaFilter);
        const sortedWatchlist = sortContent(filteredWatchlist, sortBy);
        return (
          <div>
            {renderFilterControls()}
            <div className="movies-grid">
              {sortedWatchlist.length > 0 ? (
                sortedWatchlist.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))
              ) : (
                <div className="empty-state">
                  {mediaFilter === 'all' 
                    ? (isOwnProfile ? "Your watchlist is empty. Start adding some movies!" : "No movies in watchlist yet.")
                    : `No ${mediaFilter === 'movie' ? 'movies' : 'TV shows'} in watchlist.`
                  }
                </div>
              )}
            </div>
          </div>
        );
      case 'favorites':
        const filteredFavorites = filterByMediaType(userMovies.favorites, mediaFilter);
        const sortedFavorites = sortContent(filteredFavorites, sortBy);
        return (
          <div>
            {renderFilterControls()}
            <div className="movies-grid">
              {sortedFavorites.length > 0 ? (
                sortedFavorites.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))
              ) : (
                <div className="empty-state">
                  {mediaFilter === 'all' 
                    ? (isOwnProfile ? "No favorites yet. Start adding some!" : "No favorite movies yet.")
                    : `No ${mediaFilter === 'movie' ? 'movies' : 'TV shows'} in favorites.`
                  }
                </div>
              )}
            </div>
          </div>
        );
      case 'watched':
        const filteredWatched = filterByMediaType(userMovies.watched, mediaFilter);
        const sortedWatched = sortContent(filteredWatched, sortBy);
        return (
          <div>
            {renderFilterControls()}
            <div className="movies-grid">
              {sortedWatched.length > 0 ? (
                sortedWatched.map(movie => (
                  <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} />
                ))
              ) : (
                <div className="empty-state">
                  {mediaFilter === 'all' 
                    ? (isOwnProfile ? "No watched movies or shows yet. Start watching!" : "No watched content yet.")
                    : `No ${mediaFilter === 'movie' ? 'movies' : 'TV shows'} watched yet.`
                  }
                </div>
              )}
            </div>
          </div>
        );
      case 'ratings':
        const filteredRatings = filterByMediaType(userMovies.ratings, mediaFilter);
        const sortedRatings = sortContent(filteredRatings, sortBy);
        return (
          <div>
            {renderFilterControls()}
            <div className="movies-grid">
              {sortedRatings.length > 0 ? (
                sortedRatings.map(item => (
                  <div key={item.contentKey} className="rated-movie">
                    <MovieCard movie={item} />
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  {mediaFilter === 'all' 
                    ? (isOwnProfile ? "No ratings yet. Rate some movies!" : "No movie ratings yet.")
                    : `No ${mediaFilter === 'movie' ? 'movies' : 'TV shows'} rated yet.`
                  }
                </div>
              )}
            </div>
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
            
            {userStats?.movieRatings > 0 && (
              <div className="stat-card">
                <div className="stat-icon">
                  <Film />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{userStats.movieRatings}</div>
                  <div className="stat-label">Movie Ratings</div>
                </div>
              </div>
            )}
            
            {userStats?.tvRatings > 0 && (
              <div className="stat-card">
                <div className="stat-icon">
                  <Tv />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{userStats.tvRatings}</div>
                  <div className="stat-label">TV Show Ratings</div>
                </div>
              </div>
            )}
            
            {userStats?.episodeRatings > 0 && (
              <div className="stat-card">
                <div className="stat-icon">
                  <Play />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{userStats.episodeRatings}</div>
                  <div className="stat-label">Episode Ratings</div>
                </div>
              </div>
            )}
            
            {userStats?.seasonRatings > 0 && (
              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{userStats.seasonRatings}</div>
                  <div className="stat-label">Season Ratings</div>
                </div>
              </div>
            )}
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
          <div className="profile-page-avatar">
            {profileData.photoURL ? (
              <img src={profileData.photoURL} alt={profileData.displayName} className="avatar-image" />
            ) : (
              <User />
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
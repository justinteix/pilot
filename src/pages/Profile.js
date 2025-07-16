import React, { useState } from 'react';
import { User, Film, Tv, Star, Calendar, TrendingUp, Heart } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('watchlist');

  // Mock user data
  const user = {
    name: "Movie Enthusiast",
    username: "@moviefan",
    joinDate: "January 2023",
    stats: {
      moviesWatched: 247,
      tvShowsWatched: 89,
      totalRatings: 156,
      averageRating: 4.2
    }
  };

  // Mock watchlist data
  const watchlistMovies = [
    {
      id: 1,
      title: "Dune: Part Two",
      poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      release_date: "2024-03-01",
      vote_average: 8.5,
      genre_ids: [878, 12]
    },
    {
      id: 2,
      title: "Oppenheimer",
      poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      release_date: "2023-07-21",
      vote_average: 8.3,
      genre_ids: [18, 36]
    }
  ];

  const tabs = [
    { id: 'watchlist', label: 'Watchlist', icon: Film, count: watchlistMovies.length },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: 12 },
    { id: 'ratings', label: 'Ratings', icon: Star, count: user.stats.totalRatings },
    { id: 'stats', label: 'Stats', icon: TrendingUp, count: null }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'watchlist':
        return (
          <div className="movies-grid">
            {watchlistMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        );
      case 'favorites':
        return <div className="empty-state">No favorites yet. Start adding some!</div>;
      case 'ratings':
        return <div className="empty-state">No ratings yet. Rate some movies!</div>;
      case 'stats':
        return (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Film />
              </div>
              <div className="stat-info">
                <div className="stat-number">{user.stats.moviesWatched}</div>
                <div className="stat-label">Movies Watched</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Tv />
              </div>
              <div className="stat-info">
                <div className="stat-number">{user.stats.tvShowsWatched}</div>
                <div className="stat-label">TV Shows Watched</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Star />
              </div>
              <div className="stat-info">
                <div className="stat-number">{user.stats.totalRatings}</div>
                <div className="stat-label">Total Ratings</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp />
              </div>
              <div className="stat-info">
                <div className="stat-number">{user.stats.averageRating}</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={40} />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-username">{user.username}</p>
            <div className="profile-meta">
              <div className="meta-item">
                <Calendar size={16} />
                Joined {user.joinDate}
              </div>
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
    </div>
  );
};

export default Profile;
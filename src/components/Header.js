import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Film, Tv } from 'lucide-react';
import './Header.css';

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <Film className="logo-icon" />
            <span>WatchList</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">
              <Film size={18} />
              Movies
            </Link>
            <Link to="/?type=tv" className="nav-link">
              <Tv size={18} />
              TV Shows
            </Link>
          </nav>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search movies and TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>

          <Link to="/profile" className="profile-link">
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
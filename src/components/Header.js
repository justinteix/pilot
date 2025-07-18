import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Film, Tv, LogOut, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOutUser } from "../services/authService";
import UserSearch from "./UserSearch";
import "./Header.css";
import PilotIcon from "../images/PilotIcon.svg";
import PilotText from "../images/PilotText.svg";

const Header = ({ searchQuery, setSearchQuery, onAuthClick }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);

  // Sync input value with search query prop
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
      navigate(`/?search=${encodeURIComponent(inputValue.trim())}`);
    } else {
      setSearchQuery('');
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src={PilotIcon} alt="Pilot Icon" className="logo-icon" />
            <img src={PilotText} alt="Pilot Text" className="logo-text" />
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="search-input"
              />
            </div>
          </form>

          <div className="auth-section">
            {currentUser ? (
              <div className="user-menu">
                <button 
                  onClick={() => setUserSearchOpen(true)}
                  className="user-search-btn"
                  title="Find Users"
                >
                  <Users size={18} />
                </button>
                <Link to="/profile" className="profile-link">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Profile"
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="profile-avatar">
                      {userProfile?.displayName?.charAt(0) ||
                        currentUser.email?.charAt(0) ||
                        "U"}
                    </div>
                  )}
                  <div className="profile-info">
                    <div className="profile-name">
                      {userProfile?.displayName || "User"}
                    </div>
                    <div className="profile-handle">
                      @{userProfile?.handle || "loading..."}
                    </div>
                  </div>
                </Link>
                <button onClick={handleSignOut} className="sign-out-btn">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  onClick={() => onAuthClick("signin")}
                  className="auth-btn signin"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onAuthClick("signup")}
                  className="auth-btn signup"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <UserSearch 
        isOpen={userSearchOpen} 
        onClose={() => setUserSearchOpen(false)} 
      />
    </header>
  );
};

export default Header;

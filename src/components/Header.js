import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Film, Tv, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOutUser } from "../services/authService";
import "./Header.css";
import PilotIcon from "../images/PilotIcon.svg";
import PilotText from "../images/PilotText.svg";

const Header = ({ searchQuery, setSearchQuery, onAuthClick }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
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
          <Link to="/" className="logo-link">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>

          <div className="auth-section">
            {currentUser ? (
              <div className="user-menu">
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
                      @
                      {userProfile?.displayName
                        ?.toLowerCase()
                        .replace(/\s+/g, "") ||
                        currentUser?.email?.split("@")[0] ||
                        "user"}
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
    </header>
  );
};

export default Header;

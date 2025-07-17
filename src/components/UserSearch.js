import React, { useState, useEffect } from 'react';
import { Search, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/authService';
import './UserSearch.css';

const UserSearch = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsers(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="user-search-overlay" onClick={onClose}>
      <div className="user-search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-header">
          <h3>Find Users</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by handle or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>

        <div className="search-results">
          {loading && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          )}
          
          {!loading && searchTerm.length >= 2 && searchResults.length === 0 && (
            <div className="no-results">
              <p>No users found matching "{searchTerm}"</p>
            </div>
          )}
          
          {!loading && searchResults.map(user => (
            <div
              key={user.id}
              className="user-result"
              onClick={() => handleUserClick(user.id)}
            >
              <div className="user-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.displayName || 'Anonymous User'}</div>
                {user.handle && (
                  <div className="user-username">@{user.handle}</div>
                )}
                {user.bio && (
                  <div className="user-bio">{user.bio}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
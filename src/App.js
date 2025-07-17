import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Landing from './pages/Landing';
import MovieDetail from './pages/MovieDetail';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import AuthModal from './components/AuthModal';
import './App.css';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const { currentUser } = useAuth();

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  // Show Landing page for non-authenticated users
  if (!currentUser) {
    return (
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing onAuthClick={openAuthModal} />} />
          <Route path="/movie/:id" element={<Landing onAuthClick={openAuthModal} />} />
          <Route path="/tv/:id" element={<Landing onAuthClick={openAuthModal} />} />
          <Route path="/profile" element={<Landing onAuthClick={openAuthModal} />} />
        </Routes>
        
        <AuthModal 
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  // Show main app for authenticated users
  return (
    <div className="App">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onAuthClick={openAuthModal}
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home searchQuery={searchQuery} onAuthRequired={openAuthModal} />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/tv/:id" element={<MovieDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:userId" element={<UserProfile />} />
        </Routes>
      </main>
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
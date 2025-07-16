import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Profile from './pages/Profile';
import AuthModal from './components/AuthModal';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            onAuthClick={openAuthModal}
          />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/tv/:id" element={<MovieDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          
          <AuthModal 
            isOpen={authModalOpen}
            onClose={closeAuthModal}
            initialMode={authModalMode}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
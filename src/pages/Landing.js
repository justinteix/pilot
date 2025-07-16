import React from 'react';
import { Film, Star, Heart, Plus, TrendingUp, Users, Shield } from 'lucide-react';
import './Landing.css';

const Landing = ({ onAuthClick }) => {
  const features = [
    {
      icon: Film,
      title: "Track Everything",
      description: "Keep track of all the movies and TV shows you've watched, want to watch, and love."
    },
    {
      icon: Star,
      title: "Rate & Review",
      description: "Rate your favorite content and see how your taste compares with others."
    },
    {
      icon: Heart,
      title: "Create Lists",
      description: "Build custom watchlists and favorite collections that reflect your unique taste."
    },
    {
      icon: TrendingUp,
      title: "Discover New Content",
      description: "Get personalized recommendations based on what you love."
    },
    {
      icon: Users,
      title: "Join the Community",
      description: "Connect with fellow movie and TV enthusiasts from around the world."
    },
    {
      icon: Shield,
      title: "Your Data, Your Control",
      description: "Your viewing history and preferences are private and secure."
    }
  ];

  const mockMovies = [
    { title: "The Dark Knight", poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", rating: 9.0 },
    { title: "Inception", poster: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", rating: 8.8 },
    { title: "Interstellar", poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", rating: 8.6 },
    { title: "The Matrix", poster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", rating: 8.7 },
    { title: "Pulp Fiction", poster: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", rating: 8.9 },
    { title: "The Shawshank Redemption", poster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", rating: 9.3 }
  ];

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-logo">
                <Film className="hero-logo-icon" />
                <h1 className="hero-logo-text">Pilot</h1>
              </div>
              <h2 className="hero-title">Your Entertainment Journey Starts Here</h2>
              <p className="hero-subtitle">
                Track, rate, and discover your next favorite movie or TV show. 
                Join thousands of entertainment enthusiasts building their perfect watchlists.
              </p>
              <div className="hero-actions">
                <button 
                  className="cta-button primary"
                  onClick={() => onAuthClick('signup')}
                >
                  Get Started Free
                </button>
                <button 
                  className="cta-button secondary"
                  onClick={() => onAuthClick('signin')}
                >
                  Sign In
                </button>
              </div>
              <p className="hero-note">
                Free forever • No credit card required • Join in seconds
              </p>
            </div>
            
            <div className="hero-visual">
              <div className="movie-showcase">
                {mockMovies.slice(0, 4).map((movie, index) => (
                  <div key={index} className={`showcase-card card-${index + 1}`}>
                    <img 
                      src={`https://image.tmdb.org/t/p/w300${movie.poster}`}
                      alt={movie.title}
                      className="showcase-poster"
                    />
                    <div className="showcase-overlay">
                      <div className="showcase-rating">
                        <Star size={12} fill="currentColor" />
                        {movie.rating}
                      </div>
                      <button className="showcase-action">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need to Track Your Entertainment</h2>
            <p className="section-subtitle">
              Pilot gives you all the tools to organize, discover, and enjoy your favorite content.
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Movies & Shows</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Ratings Given</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Always Updated</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-subtitle">
              Join Pilot today and never lose track of what to watch next.
            </p>
            <button 
              className="cta-button primary large"
              onClick={() => onAuthClick('signup')}
            >
              Create Your Free Account
            </button>
            <p className="cta-note">
              Already have an account? 
              <button 
                className="link-button"
                onClick={() => onAuthClick('signin')}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
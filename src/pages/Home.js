import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, Star, Calendar, ChevronRight, Film } from "lucide-react";
import MovieCard from "../components/MovieCard";
import "./Home.css";

const Home = ({ searchQuery }) => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("trending");

  // Mock data for demonstration
  const mockMovies = [
    {
      id: 1,
      title: "The Dark Knight",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      release_date: "2008-07-18",
      vote_average: 9.0,
      genre_ids: [28, 80, 18],
    },
    {
      id: 2,
      title: "Inception",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      release_date: "2010-07-16",
      vote_average: 8.8,
      genre_ids: [28, 878, 53],
    },
    {
      id: 3,
      title: "Interstellar",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      release_date: "2014-11-07",
      vote_average: 8.6,
      genre_ids: [18, 878],
    },
    {
      id: 4,
      title: "The Matrix",
      poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      release_date: "1999-03-31",
      vote_average: 8.7,
      genre_ids: [28, 878],
    },
    {
      id: 5,
      title: "Pulp Fiction",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      release_date: "1994-10-14",
      vote_average: 8.9,
      genre_ids: [80, 18],
    },
    {
      id: 6,
      title: "The Shawshank Redemption",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      release_date: "1994-09-23",
      vote_average: 9.3,
      genre_ids: [18],
    },
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      let filteredMovies = [...mockMovies];

      if (searchQuery) {
        filteredMovies = mockMovies.filter((movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setMovies(filteredMovies);
      setLoading(false);
    }, 1000);
  }, [searchQuery, activeFilter]);

  const filters = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "popular", label: "Popular", icon: Star },
    { id: "recent", label: "Recent", icon: Calendar },
  ];

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <div className="loading">Loading amazing content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="container">
        {!searchQuery && (
          <div className="hero-section">
            <div className="hero-logo">
              <Film className="hero-logo-icon" />
              <h1 className="hero-logo-text">Pilot</h1>
            </div>
            <h2 className="hero-title">Track Your Entertainment</h2>
            <p className="hero-subtitle">
              Discover, rate, and keep track of all your favorite movies and TV
              shows. Join a community of entertainment enthusiasts.
            </p>
          </div>
        )}

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp className="section-icon" />
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Trending Now"}
            </h2>
            {!searchQuery && (
              <a href="#" className="view-all-btn">
                View All <ChevronRight size={16} />
              </a>
            )}
          </div>

          {!searchQuery && (
            <div className="filters">
              {filters.map((filter) => {
                const IconComponent = filter.icon;
                return (
                  <button
                    key={filter.id}
                    className={`filter-btn ${
                      activeFilter === filter.id ? "active" : ""
                    }`}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    <IconComponent size={16} style={{ marginRight: "6px" }} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          )}

          {movies.length > 0 ? (
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              {searchQuery
                ? "No movies found for your search."
                : "No movies available."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

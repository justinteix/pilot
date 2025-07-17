import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, Star, Calendar, ChevronRight, Film } from "lucide-react";
import MovieCard from "../components/MovieCard";
import PilotLogo from "../components/PilotLogo";
import { useAuth } from "../contexts/AuthContext";
import { movieApi, tvApi, searchApi } from "../services/tmdbApi";
import "./Home.css";

const Home = ({ searchQuery, onAuthRequired }) => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("trending");
  const [error, setError] = useState("");
  const { currentUser, userProfile } = useAuth();

  const mediaType = searchParams.get("type") || "movie";

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError("");
      
      try {
        let response;
        
        if (searchQuery) {
          // Search for movies/TV shows
          response = await searchApi.multi(searchQuery);
        } else {
          // Fetch based on active filter and media type
          switch (activeFilter) {
            case "popular":
              response = mediaType === "tv" ? await tvApi.getPopular() : await movieApi.getPopular();
              break;
            case "recent":
              response = mediaType === "tv" ? await tvApi.getTopRated() : await movieApi.getNowPlaying();
              break;
            default: // trending
              response = mediaType === "tv" ? await tvApi.getTrending() : await movieApi.getTrending();
          }
        }
        
        // Add media_type to items that don't have it
        const moviesWithType = response.data.results.map(item => ({
          ...item,
          media_type: item.media_type || (item.title ? 'movie' : 'tv')
        }));
        
        setMovies(moviesWithType);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load content. Please check your API configuration.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchQuery, activeFilter, mediaType]);

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


        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              {searchQuery ? (
                <>
                  <TrendingUp className="section-icon" />
                  {`Search Results for "${searchQuery}"`}
                </>
              ) : (
                `Welcome back, ${userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}!`
              )}
            </h2>
            {!searchQuery && (
              <button className="view-all-btn" onClick={() => {}}>
                View All <ChevronRight size={16} />
              </button>
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

          {error ? (
            <div className="error-message">{error}</div>
          ) : movies.length > 0 ? (
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard 
                  key={`${movie.id}-${movie.media_type}`} 
                  movie={movie} 
                  onAuthRequired={onAuthRequired}
                />
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

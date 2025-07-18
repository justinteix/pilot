import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, Star, Calendar, ChevronRight, Film } from "lucide-react";
import MovieCard from "../components/MovieCard";
import PilotLogo from "../components/PilotLogo";
import { useAuth } from "../contexts/AuthContext";
import { movieApi, tvApi, searchApi } from "../services/tmdbApi";
import "./Home.css";

const Home = ({ onAuthRequired }) => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("popular");
  const [error, setError] = useState("");
  const { currentUser, userProfile } = useAuth();

  const mediaType = searchParams.get("type") || "movie";
  const searchQuery = searchParams.get("search") || "";

  // Filter function to remove incomplete movie/TV data
  const filterValidItems = (items) => {
    return items.filter(item => {
      // Must have an ID
      if (!item.id) return false;
      
      // Must have a title or name
      if (!item.title && !item.name) return false;
      
      // Must have a poster image
      if (!item.poster_path) return false;
      
      // Must have a release date or first air date
      if (!item.release_date && !item.first_air_date) return false;
      
      // Filter out adult content if needed
      if (item.adult === true) return false;
      
      // Must have some basic metadata
      if (!item.overview && !item.vote_average && !item.popularity) return false;
      
      return true;
    });
  };

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
              response = mediaType === "tv" ? await tvApi.getTrending() : await movieApi.getTrending();
              break;
            case "recent":
              response = mediaType === "tv" ? await tvApi.getOnTheAir() : await movieApi.getUpcoming();
              break;
            case "trending":
              response = mediaType === "tv" ? await tvApi.getTopRated() : await movieApi.getTopRated();
              break;
            default:
              response = mediaType === "tv" ? await tvApi.getTrending() : await movieApi.getTrending();
          }
        }
        
        // Add media_type to items that don't have it
        const moviesWithType = response.data.results.map(item => ({
          ...item,
          media_type: item.media_type || (item.title ? 'movie' : 'tv')
        }));
        
        // Filter out incomplete items
        const validMovies = filterValidItems(moviesWithType);
        
        setMovies(validMovies);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load content. Please check your API configuration.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchParams, activeFilter, mediaType]);

  const filters = [
    { id: "popular", label: "Trending", icon: TrendingUp },
    { id: "recent", label: "Recent", icon: Calendar },
    { id: "trending", label: "Top Rated", icon: Star },
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

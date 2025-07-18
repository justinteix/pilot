import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, Star, Calendar, ChevronRight, Film } from "lucide-react";
import MovieCard from "../components/MovieCard";
import PilotLogo from "../components/PilotLogo";
import { useAuth } from "../contexts/AuthContext";
import { movieApi, tvApi, searchApi } from "../services/tmdbApi";
import "./Home.css";

const Home = ({ onAuthRequired }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { currentUser, userProfile } = useAuth();

  const mediaType = searchParams.get("type") || "movie";
  const searchQuery = searchParams.get("search") || "";
  const activeFilter = searchParams.get("filter") || "popular";

  // Create a unique key for this filter/media combination
  const cacheKey = `home-${activeFilter}-${mediaType}-${searchQuery || 'no-search'}`;

  // Save state to sessionStorage
  const saveState = (moviesData, page, totalPagesData) => {
    const state = {
      movies: moviesData,
      currentPage: page,
      totalPages: totalPagesData,
      timestamp: Date.now()
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(state));
  };

  // Load state from sessionStorage
  const loadState = () => {
    try {
      const saved = sessionStorage.getItem(cacheKey);
      if (saved) {
        const state = JSON.parse(saved);
        // Only use cached data if it's less than 10 minutes old
        if (Date.now() - state.timestamp < 10 * 60 * 1000) {
          return state;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached state:', error);
    }
    return null;
  };

  // Save scroll position
  const saveScrollPosition = () => {
    const scrollY = window.scrollY;
    sessionStorage.setItem(`${cacheKey}-scroll`, scrollY.toString());
    console.log('Saved scroll position:', scrollY); // Debug log
  };



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

  const fetchMovies = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
      setCurrentPage(1);
    } else {
      setLoadingMore(true);
    }
    setError("");
    
    try {
      let response;
      
      if (searchQuery) {
        // Search for movies/TV shows
        response = await searchApi.multi(searchQuery, page);
      } else {
        // Fetch based on active filter and media type
        switch (activeFilter) {
          case "popular":
            response = mediaType === "tv" ? await tvApi.getTrending('week', page) : await movieApi.getTrending('week', page);
            break;
          case "recent":
            response = mediaType === "tv" ? await tvApi.getOnTheAir(page) : await movieApi.getUpcoming(page);
            break;
          case "trending":
            response = mediaType === "tv" ? await tvApi.getTopRated(page) : await movieApi.getTopRated(page);
            break;
          default:
            response = mediaType === "tv" ? await tvApi.getTrending('week', page) : await movieApi.getTrending('week', page);
        }
      }
      
      // Add media_type to items that don't have it
      const moviesWithType = response.data.results.map(item => ({
        ...item,
        media_type: item.media_type || (item.title ? 'movie' : 'tv')
      }));
      
      // Filter out incomplete items
      const validMovies = filterValidItems(moviesWithType);
      
      let newMovies;
      if (append) {
        newMovies = [...movies, ...validMovies];
        setMovies(newMovies);
      } else {
        newMovies = validMovies;
        setMovies(newMovies);
      }
      
      const newCurrentPage = response.data.page;
      const newTotalPages = response.data.total_pages;
      
      setCurrentPage(newCurrentPage);
      setTotalPages(newTotalPages);
      
      // Save state to sessionStorage
      saveState(newMovies, newCurrentPage, newTotalPages);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to load content. Please check your API configuration.");
      if (!append) setMovies([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Simple approach: always try to load cached state first
    const cachedState = loadState();
    
    if (cachedState && !isInitialLoad) {
      // Load from cache for navigation back
      setMovies(cachedState.movies);
      setCurrentPage(cachedState.currentPage);
      setTotalPages(cachedState.totalPages);
      setLoading(false);
    } else {
      // Fresh load or initial load
      fetchMovies(1, false);
    }
    
    setIsInitialLoad(false);
  }, [searchParams, activeFilter, mediaType]);

  // Simple scroll restoration after content loads
  useEffect(() => {
    if (!loading && movies.length > 0) {
      const savedScroll = sessionStorage.getItem(`${cacheKey}-scroll`);
      if (savedScroll) {
        // Simple, reliable scroll restoration
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll));
          console.log('Restored scroll to:', savedScroll);
        }, 50);
      }
    }
  }, [loading, movies.length, cacheKey]);

  // Enable browser's native scroll restoration and save position
  useEffect(() => {
    // Enable browser's scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Save scroll position periodically and on navigation
    const saveScrollPeriodically = () => {
      saveScrollPosition();
    };

    // Save scroll position every 2 seconds while scrolling
    let scrollTimer;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(saveScrollPeriodically, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveScrollPosition);
    
    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveScrollPosition);
      saveScrollPosition(); // Save on unmount
    };
  }, [cacheKey]);

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
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set("filter", filter.id);
                      setSearchParams(newParams);
                    }}
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
            <>
              <div className="movies-grid">
                {movies.map((movie) => (
                  <div key={`${movie.id}-${movie.media_type}`} onClick={saveScrollPosition}>
                    <MovieCard 
                      movie={movie} 
                      onAuthRequired={onAuthRequired}
                    />
                  </div>
                ))}
              </div>
              
              {!searchQuery && currentPage < totalPages && (
                <div className="load-more-section">
                  <button 
                    className="load-more-btn" 
                    onClick={() => fetchMovies(currentPage + 1, true)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <div className="loading-spinner"></div>
                        Loading more...
                      </>
                    ) : (
                      <>
                        Load More <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                  <p className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              )}
            </>
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

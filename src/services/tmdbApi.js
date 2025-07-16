import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

// Create axios instance with default config
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// Movie and TV Show API functions
export const movieApi = {
  // Get trending movies
  getTrending: (timeWindow = 'week') =>
    tmdbApi.get(`/trending/movie/${timeWindow}`),

  // Get popular movies
  getPopular: (page = 1) =>
    tmdbApi.get('/movie/popular', { params: { page } }),

  // Get top rated movies
  getTopRated: (page = 1) =>
    tmdbApi.get('/movie/top_rated', { params: { page } }),

  // Get now playing movies
  getNowPlaying: (page = 1) =>
    tmdbApi.get('/movie/now_playing', { params: { page } }),

  // Get upcoming movies
  getUpcoming: (page = 1) =>
    tmdbApi.get('/movie/upcoming', { params: { page } }),

  // Get movie details
  getDetails: (movieId) =>
    tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,videos,similar,reviews'
      }
    }),

  // Search movies
  search: (query, page = 1) =>
    tmdbApi.get('/search/movie', { params: { query, page } }),

  // Get movie genres
  getGenres: () =>
    tmdbApi.get('/genre/movie/list'),
};

export const tvApi = {
  // Get trending TV shows
  getTrending: (timeWindow = 'week') =>
    tmdbApi.get(`/trending/tv/${timeWindow}`),

  // Get popular TV shows
  getPopular: (page = 1) =>
    tmdbApi.get('/tv/popular', { params: { page } }),

  // Get top rated TV shows
  getTopRated: (page = 1) =>
    tmdbApi.get('/tv/top_rated', { params: { page } }),

  // Get TV show details
  getDetails: (tvId) =>
    tmdbApi.get(`/tv/${tvId}`, {
      params: {
        append_to_response: 'credits,videos,similar,reviews'
      }
    }),

  // Search TV shows
  search: (query, page = 1) =>
    tmdbApi.get('/search/tv', { params: { query, page } }),

  // Get TV genres
  getGenres: () =>
    tmdbApi.get('/genre/tv/list'),
};

// Multi search (movies and TV shows)
export const searchApi = {
  multi: (query, page = 1) =>
    tmdbApi.get('/search/multi', { params: { query, page } }),
};

// Helper functions
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/api/placeholder/300/450';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return '/api/placeholder/1200/675';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default tmdbApi;
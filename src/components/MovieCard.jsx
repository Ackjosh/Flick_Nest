import React, { useState, useEffect } from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function MovieCard({ movie, onMovieClick, isDarkMode, userId, userWatchlist = [], userFavorites = [], onUserToggleSuccess }) {
  const [currentIsFavorite, setCurrentIsFavorite] = useState(() =>
    userFavorites.some(fav => String(fav.id) === String(movie.id) && fav.media_type === movie.media_type)
  );
  const [isWatchlisted, setIsWatchlisted] = useState(() =>
    userWatchlist.some(item => String(item.id) === String(movie.id) && item.media_type === movie.media_type)
  );

  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const itemId = movie.id;
  const mediaType = movie.media_type;

  useEffect(() => {
    setCurrentIsFavorite(userFavorites.some(
      fav => String(fav.id) === String(itemId) && fav.media_type === mediaType
    ));
  }, [userFavorites, itemId, mediaType]);

  useEffect(() => {
    setIsWatchlisted(userWatchlist.some(
      item => String(item.id) === String(itemId) && item.media_type === mediaType
    ));
  }, [userWatchlist, itemId, mediaType]);


  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (isLoadingFavorite || !userId || !itemId || !mediaType) {
      if (!userId) alert('Please sign in to favorite items.');
      console.warn('Favorite toggle skipped: Missing userId, itemId, or mediaType. Or already loading.');
      console.log('Current values:', { userId, itemId, mediaType, isLoadingFavorite });
      return;
    }

    setIsLoadingFavorite(true);
    try {
      const url = `${API_BASE_URL}/user/${userId}/favorites`;

      if (currentIsFavorite) {
        console.log(`Attempting DELETE to ${url} with params:`, { mediaId: String(itemId), mediaType: mediaType });
        await axios.delete(url, {
          params: { mediaId: String(itemId), mediaType: mediaType }
        });
      } else {
        console.log(`Attempting POST to ${url} with data:`, { itemId: String(itemId), mediaType: mediaType });
        await axios.post(url, {
          itemId: String(itemId),
          mediaType: mediaType
        });
      }
      if (onUserToggleSuccess) {
          await onUserToggleSuccess();
      }

    } catch (error) {
      console.error("Error updating favorites:", error.response?.data || error.message);
      alert('Failed to update favorite status. Please try again.');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const toggleWatchlist = async (e) => {
    e.stopPropagation();
    if (isLoadingWatchlist || !userId || !itemId || !mediaType) {
      if (!userId) alert('Please sign in to manage your watchlist.');
      console.warn('Watchlist toggle skipped: Missing userId, itemId, or mediaType. Or already loading.');
      console.log('Current values:', { userId, itemId, mediaType, isLoadingWatchlist });
      return;
    }

    setIsLoadingWatchlist(true);
    try {
      const url = `${API_BASE_URL}/user/${userId}/watchlist`;

      if (isWatchlisted) {
        console.log(`Attempting DELETE to ${url} with params:`, { mediaId: String(itemId), mediaType: mediaType });
        await axios.delete(url, {
          params: { mediaId: String(itemId), mediaType: mediaType },
        });
      } else {
        console.log(`Attempting POST to ${url} with data:`, { itemId: String(itemId), mediaType: mediaType });
        await axios.post(url, {
          itemId: String(itemId),
          mediaType: mediaType,
        });
      }
      if (onUserToggleSuccess) {
          await onUserToggleSuccess();
      }

    } catch (error) {
      console.error("Error updating watchlist:", error.response?.data || error.message);
      alert('Failed to update watchlist. Please try again.');
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-image.jpg';

  const titleOrName = movie.title || movie.name || 'N/A';
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : (movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : 'N/A');

  return (
    <div
      className={`
        movie-card
        w-80 h-105 mb-10 m-auto rounded-lg overflow-hidden shadow-lg
        cursor-pointer transition transform hover:scale-105
        bg-gray-800 text-white
      `}
      onClick={() => onMovieClick(movie)}
    >
      <div className="h-83 overflow-hidden relative bg-gray-700 rounded">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-600" />
        )}
        <img
          src={posterUrl}
          alt={titleOrName}
          className={`w-full h-full object-cover rounded transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-image.jpg';
            setImgLoaded(true);
          }}
          loading="lazy"
        />
        {userId && (
          <button
            onClick={toggleFavorite}
            disabled={isLoadingFavorite}
            className={`
              absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center
              cursor-pointer transition duration-200
              ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}
              ${currentIsFavorite ? 'text-red-500' : 'text-gray-400 hover:text-white'}
            `}
            aria-label={currentIsFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              fill={currentIsFavorite ? 'currentColor' : 'none'}
              stroke={currentIsFavorite ? 'currentColor' : 'white'}
              size={20}
            />
          </button>
        )}

        {userId && (
          <button
            onClick={toggleWatchlist}
            disabled={isLoadingWatchlist}
            className={`
                absolute top-2 left-2 p-1 rounded-full text-sm font-semibold transition-colors duration-200
                ${isLoadingWatchlist ? 'opacity-50 cursor-not-allowed' : ''}
                ${isWatchlisted
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }
              `}
            aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isWatchlisted ? (
              <Check size={18} />
            ) : (
              <Plus size={18} />
            )}
          </button>
        )}
      </div>
      <div className="p-2">
        <h3 className="text-sm font-bold truncate">{titleOrName}</h3>
        <p className="text-xs truncate">
          {releaseYear} | {mediaType ? mediaType.toUpperCase() : 'N/A'}
        </p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs">Score: {movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
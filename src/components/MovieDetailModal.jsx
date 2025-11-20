import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, Heart, X, Plus, Check } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function MovieDetailModal({ movie, isOpen, onClose, isDarkMode, userId, userWatchlist = [], userFavorites = [], onUserToggleSuccess }) {

  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  const [imgLoaded, setImgLoaded] = useState(false);

  const itemId = movie?.id;
  const mediaType = movie?.media_type;

  useEffect(() => {
    if (isOpen && userId && itemId && mediaType) {
      setIsWatchlisted(userWatchlist.some(
        (item) => String(item.id) === String(itemId) && item.media_type === mediaType
      ));
      setIsFavorite(userFavorites.some(
        (fav) => String(fav.id) === String(itemId) && fav.media_type === mediaType
      ));
    } else if (!isOpen) {
      setIsWatchlisted(false);
      setIsFavorite(false);
      setImgLoaded(false);
    }
  }, [isOpen, userId, itemId, mediaType, userWatchlist, userFavorites]);

  const toggleWatchlist = async (e) => {
    e.stopPropagation();
    if (isLoadingWatchlist || !userId || !itemId || !mediaType) {
      if (!userId) console.error("Cannot update watchlist: No user ID provided");
      if (!mediaType) console.error("Cannot update watchlist: No media type provided");
      return;
    }

    setIsLoadingWatchlist(true);
    try {
      if (isWatchlisted) {
        await axios.delete(`${API_BASE_URL}/user/${userId}/watchlist`, {
          params: { mediaId: String(itemId), mediaType: mediaType },
        });
      } else {
        await axios.post(`${API_BASE_URL}/user/${userId}/watchlist`, {
          itemId: String(itemId),
          mediaType: mediaType
        });
      }

      if (onUserToggleSuccess) {
        await onUserToggleSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error updating watchlist:", error.response?.data || error.message);
      alert('Failed to update watchlist. Please try again.');
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (isLoadingFavorite || !userId || !itemId || !mediaType) {
      if (!userId) alert('Please sign in to favorite items.');
      return;
    }

    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        await axios.delete(`${API_BASE_URL}/user/${userId}/favorites`, {
          params: { mediaId: String(itemId), mediaType: mediaType }
        });
      } else {
        await axios.post(`${API_BASE_URL}/user/${userId}/favorites`, {
          mediaId: String(itemId),
          mediaType: mediaType
        });
      }

      if (onUserToggleSuccess) {
        await onUserToggleSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error updating favorite status:", error.response?.data || error.message);
      alert('Failed to update favorite status. Please try again.');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  if (!isOpen || !movie) {
    return null;
  }

  const displayTitle = movie?.title || movie?.name || movie?.original_title || movie?.original_name || 'N/A';
  const displayOriginalTitle = movie?.original_title || movie?.original_name || 'N/A';

  const displayReleaseDate = mediaType === 'tv' ? movie?.first_air_date : movie?.release_date || 'N/A';

  let displayRuntime = 'N/A';
  if (mediaType === 'movie' && movie?.runtime) {
    displayRuntime = `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`;
  } else if (mediaType === 'tv' && movie?.episode_run_time && movie.episode_run_time.length > 0) {
    displayRuntime = `${movie.episode_run_time[0]}m (avg. episode)`;
  }

  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-image.jpg';

  const genres = movie?.genres && movie.genres.length > 0
    ? movie.genres.map(g => g.name).join(', ')
    : 'N/A';

  const studios = movie?.production_companies && movie.production_companies.length > 0
    ? movie.production_companies.map(s => s.name).join(', ')
    : 'N/A';

  const displayStatus = movie?.status
    ? movie.status.replace('_', ' ').toUpperCase()
    : 'N/A';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto ${isDarkMode ? 'bg-opacity-70' : ''}`}>
      <div className={`relative flex w-full h-full max-w-full max-h-full overflow-hidden bg-gray-800 text-white`}>
        <button
          className={`absolute top-4 right-8 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-red-700 text-white cursor-pointer`}
          onClick={onClose}
        >
          ✕
        </button>

        <div className="w-2/8 h-full flex flex-col flex-wrap relative">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-600" />
          )}
          <img
            src={posterUrl}
            alt={displayTitle}
            className={`h-[55vh] object-cover absolute top-15 left-13 rounded transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'
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
              className={`
                  flex absolute top-128 left-25 py-2 px-2 rounded-md font-semibold
                  transition-colors duration-200 cursor-pointer
                  ${isLoadingWatchlist ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isWatchlisted
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }
                `}
              onClick={toggleWatchlist}
              disabled={isLoadingWatchlist}
            >
              <Bookmark className="mr-2 h-5 w-5" fill={isWatchlisted ? 'currentColor' : 'none'} />
              {isLoadingWatchlist
                ? (isWatchlisted ? 'Removing...' : 'Adding...')
                : (isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist')
              }
            </button>
          )}
        </div>

        <div className={`w-6/8 p-8 overflow-y-auto bg-gray-800 text-gray-200`}>
          <h2 className="text-4xl font-bold mb-6">{displayTitle}</h2>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <p className="font-semibold">Original Title</p>
              <p>{displayOriginalTitle}</p>
            </div>
            <div>
              <p className="font-semibold">Type</p>
              <p>{mediaType ? mediaType.toUpperCase() : 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">Runtime</p>
              <p>{displayRuntime}</p>
            </div>
            <div>
              <p className="font-semibold">Score</p>
              <p>{movie?.vote_average ? `${movie.vote_average}/10` : 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">Release Date</p>
              <p>{displayReleaseDate}</p>
            </div>
            <div>
              <p className="font-semibold">Status</p>
              <p>{displayStatus}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Overview</h3>
            <p className="text-base leading-relaxed">
              {movie?.overview || 'No description available.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Additional Details</h3>
              <div>
                <p className="font-semibold">Genres</p>
                <p className="text-base">{genres}</p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4">Production</h3>
              <div>
                <p className="font-semibold">Studios</p>
                <p className="text-base">{studios}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailModal;
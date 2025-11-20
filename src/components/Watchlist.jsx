import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Layout from './Layout';
import MovieDetailModal from './MovieDetailModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Watchlist = ({ auth, isDarkMode, toggleDarkMode, userId, userWatchlist, userFavorites, onUserToggleSuccess }) => {
  const [watchlistedMedia, setWatchlistedMedia] = useState([]);
  const [loadingMediaDetails, setLoadingMediaDetails] = useState(true);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      setLoadingMediaDetails(true);

      if (!userId || userWatchlist === null || userWatchlist.length === 0) {
        setWatchlistedMedia([]);
        setLoadingMediaDetails(false);
        console.log("Watchlist: No userId or empty userWatchlist. Cleared media details.");
        return;
      }

      console.log(`Watchlist: Fetching TMDB details for ${userWatchlist.length} items.`);
      const mediaDetailsPromises = userWatchlist.map(async (item) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/media/${item.media_type}/${item.id}`);
          return { ...response.data, media_type: item.media_type };
        } catch (error) {
          console.error(`Watchlist: Error fetching details for ${item.media_type} ${item.id}:`, error);
          return null;
        }
      });

      const mediaDetails = await Promise.all(mediaDetailsPromises);
      const validMedia = mediaDetails.filter(media => media !== null);
      setWatchlistedMedia(validMedia);
      setLoadingMediaDetails(false);
      console.log(`Watchlist: Finished fetching TMDB details. Found ${validMedia.length} valid items.`);
    };

    fetchMediaDetails();
  }, [userId, userWatchlist]);

  const handleMediaClick = (media) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
    if (onUserToggleSuccess) {
      console.log("Watchlist: Closing modal, calling onUserToggleSuccess to re-fetch App.jsx data.");
      await onUserToggleSuccess();
    }
  };

  if (loadingMediaDetails) {
    return (
      <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-3 text-white">Loading your watchlisted movie/show details...</p>
        </div>
      </Layout>
    );
  }

  if (watchlistedMedia.length === 0) {
    return (
      <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
        <div className="container mx-auto p-4">
          <p className="text-3xl font-bold mb-7 ma-5 ml-7 text-white">
            My Watchlist
          </p>
          <div className="text-center py-10 text-white">
            <p className="text-lg mb-4">Your watchlist is empty.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <div className="container mx-auto p-4">
        <p className="text-3xl font-bold mb-7 ml-7 text-white">
          My Watchlist
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 text-white border-collapse">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-2 px-4 text-left border-b border-gray-600"></th>
                <th className="py-2 px-4 text-left border-b border-gray-600">#</th>
                <th className="py-2 px-4 text-left border-b border-gray-600">Image</th>
                <th className="py-2 px-4 text-left border-b border-gray-600">Title</th>
                <th className="py-2 px-4 text-center border-b border-gray-600">Score</th>
                <th className="py-2 px-6 text-center border-b border-gray-600">Type</th>
                <th className="py-2 px-8 text-center border-b border-gray-600">Episodes / Runtime</th>
              </tr>
            </thead>
            <tbody>

              {watchlistedMedia.map((media, index) => {
                const titleOrName = media.title || media.name || 'N/A';
                const posterUrl = media.poster_path
                  ? `https://image.tmdb.org/t/p/w92${media.poster_path}`
                  : '/placeholder-image.jpg';
                const score = media.vote_average ? media.vote_average.toFixed(1) : '-';
                const type = media.media_type ? media.media_type.toUpperCase() : 'N/A';

                let progressInfo = '-';
                if (media.media_type === 'tv') {
                  progressInfo = `${media.number_of_episodes || '?'} total`;
                } else if (media.media_type === 'movie') {
                  progressInfo = media.runtime ? `${media.runtime} min` : '-';
                }

                return (
                  <tr key={`${media.id}-${media.media_type}`} className="hover:bg-gray-700 transition">
                    <td className="py-2 px-4 border-b border-gray-700 text-center">

                      <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto" title="Watchlisted"></div>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700">{index + 1}</td>
                    <td className="py-2 px-4 border-b border-gray-700">
                      <img
                        src={posterUrl}
                        alt={titleOrName}
                        className="w-12 h-18 object-cover rounded"
                      />
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleMediaClick(media); }}
                        className="text-blue-400 hover:underline font-semibold"
                      >
                        {titleOrName}
                      </a>
                      <div className="add-edit-more text-xs text-gray-400 mt-1">
                        <span className="edit">Edit</span> - <span className="more">More</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700 text-center">
                      <span className="score-label">{score}</span>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700 text-center">{type}</td>
                    <td className="py-2 px-4 border-b border-gray-700 text-center">{progressInfo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMedia && (
        <MovieDetailModal
          movie={selectedMedia}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isDarkMode={isDarkMode}
          userId={userId}
          userWatchlist={userWatchlist}
          userFavorites={userFavorites}
          onUserToggleSuccess={onUserToggleSuccess}
        />
      )}
    </Layout>
  );
};

export default Watchlist;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Layout from './Layout';
import MovieDetailModal from './MovieDetailModal';
import Header from './Header';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Favorites = ({ auth, isDarkMode, toggleDarkMode, userId, userFavorites, onUserToggleSuccess }) => {
  const [favoritedMedia, setFavoritedMedia] = useState([]);
  const [loadingMediaDetails, setLoadingMediaDetails] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      setLoadingMediaDetails(true);

      if (!userId || userFavorites === null || userFavorites.length === 0) {
        setFavoritedMedia([]);
        setLoadingMediaDetails(false);
        console.log("Favorites: No userId or empty userFavorites. Cleared media details.");
        return;
      }

      console.log(`Favorites: Fetching TMDB details for ${userFavorites.length} items.`);
      const mediaDetailsPromises = userFavorites.map(async (item) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/media/${item.media_type}/${item.id}`);
          return { ...response.data, media_type: item.media_type };
        } catch (error) {
          console.error(`Favorites: Error fetching details for favorite ${item.media_type} ${item.id}:`, error);
          return null;
        }
      });

      const mediaDetails = await Promise.all(mediaDetailsPromises);
      const validMedia = mediaDetails.filter(media => media !== null);
      setFavoritedMedia(validMedia);
      setLoadingMediaDetails(false);
      console.log(`Favorites: Finished fetching TMDB details. Found ${validMedia.length} valid items.`);
    };

    fetchMediaDetails();
  }, [userId, userFavorites]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        let url = `${API_BASE_URL}/media/browse?page=${currentPage}`;
        if (searchQuery.trim()) {
          url += `&query=${encodeURIComponent(searchQuery)}`;
        }

        const res = await axios.get(url);
        const data = res.data;

        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error('Failed to fetch media:', err);
        setMovies([]);
        setTotalPages(1);
      }
      setIsLoading(false);
    };

    fetchMedia();
  }, [currentPage, searchQuery]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigate('/sign-in');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const resetMovieList = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleMediaClick = (media) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
    if (onUserToggleSuccess) {
      console.log("Favorites: Closing modal, calling onUserToggleSuccess to re-fetch App.jsx data.");
      await onUserToggleSuccess();
    }
  };

  if (loadingMediaDetails) {
    return (
      <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-3 text-white">Loading your favorite movie/show details...</p>
        </div>
      </Layout>
    );
  }

  if (favoritedMedia.length === 0) {
    return (
      <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
        <div className="container mx-auto p-4">
          <p className="text-3xl font-bold mb-7 ml-7 text-white">
            My Favorites
          </p>
          <div className="text-center py-10 text-white">
            <p className="text-lg mb-4">Your favorites list is empty.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <div className="container mx-auto p-4">
        <div className='mb-6'>
          <Header
            user={user}
            onLogout={handleLogout}
            onSearch={handleSearch}
            onResetList={resetMovieList}
            toggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
          />
        </div>
        <p className="text-3xl font-bold mb-7 ml-7 text-white">
          My Favorites
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
              {favoritedMedia.map((media, index) => {
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
                      <div className="w-3 h-3 rounded-full bg-green-500 mx-auto" title="Favorited"></div>
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
          userFavorites={userFavorites}
          onUserToggleSuccess={onUserToggleSuccess}
        />
      )}
    </Layout>
  );
};

export default Favorites;
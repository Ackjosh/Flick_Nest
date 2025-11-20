import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';
import Layout from './Layout';
import Header from './Header';
import MovieList from './MovieList';
import MovieDetailModal from './MovieDetailModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function HomePage({ auth, isDarkMode, toggleDarkMode, userWatchlist, userFavorites, onUserToggleSuccess }) {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  const maxPagesToShow = 20;

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

  const showMovieDetails = async (movie) => {
    console.log("Clicked media object:", movie);
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < Math.min(totalPages, maxPagesToShow)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <Header
          user={user}
          onLogout={handleLogout}
          onSearch={handleSearch}
          onResetList={resetMovieList}
          toggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
        />
        <main className="flex-grow overflow-y-auto p-4 bg-[rgb(17,17,17)]">
          {isLoading ? (
            <div className="flex justify-center items-center text-white text-xl mt-10">
              Loading...
            </div>
          ) : (
            <MovieList
              movies={movies}
              onMovieClick={showMovieDetails}
              isDarkMode={isDarkMode}
              userId={user?.uid}
              userWatchlist={userWatchlist}
              userFavorites={userFavorites}
              onUserToggleSuccess={onUserToggleSuccess} 
            />
          )}

          {selectedMovie && (
            <MovieDetailModal
              movie={selectedMovie}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              isDarkMode={isDarkMode}
              userId={!loadingAuth && user ? user.uid : null}
              userWatchlist={userWatchlist}
              userFavorites={userFavorites}
              onUserToggleSuccess={onUserToggleSuccess} 
            />
          )}

          {totalPages > 1 && !isLoading && (
            <div className="flex justify-center items-center mt-6 gap-10">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded cursor-pointer ${currentPage === 1
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-blue-300'
                  } text-white transition`}
              >
                Previous
              </button>

              <span className="text-white">
                Page {currentPage} of {Math.min(totalPages, maxPagesToShow)}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage >= Math.min(totalPages, maxPagesToShow)}
                className={`px-4 py-2 rounded cursor-pointer ${currentPage >= Math.min(totalPages, maxPagesToShow)
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-blue-300'
                  } text-white transition`}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}

export default HomePage;
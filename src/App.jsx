import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

import { app } from './firebase';
import Layout from './components/Layout';
import SignUp from "./(auth)/sign-up.tsx";
import SignIn from "./(auth)/sign-in.tsx";
import HomePage from './components/HomePage';
import Favorites from './components/Favorites';
import Watchlist from './components/Watchlist';
import './utility.css';
import './App.css';

const auth = getAuth(app);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [userWatchlist, setUserWatchlist] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loadingAuthAndUserData, setLoadingAuthAndUserData] = useState(true);

  console.log(`[App Render] Start. user UID: ${user?.uid}, loadingAuthAndUserData: ${loadingAuthAndUserData}`);


  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const fetchUserCollections = useCallback(async (firebaseUid) => {
    console.log(`[fetchUserCollections] Called for UID: ${firebaseUid || 'none'}`);
    if (!firebaseUid) {
      setUserWatchlist([]);
      setUserFavorites([]);
      console.log("[fetchUserCollections] No UID provided, cleared collections.");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/user/${firebaseUid}`);
      setUserWatchlist(response.data.watchlist || []);
      setUserFavorites(response.data.favorites || []);
      console.log(`[fetchUserCollections] Success. Favs: ${response.data.favorites?.length}, WL: ${response.data.watchlist?.length}`);
    } catch (error) {
      console.error("[fetchUserCollections] Error fetching collections:", error.response?.data || error.message);
      setUserWatchlist([]);
      setUserFavorites([]);
    }
  }, []);

  useEffect(() => {
    console.log("[App useEffect Auth] Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log(`[onAuthStateChanged Callback] Firebase provided user: ${currentUser?.uid || 'null'}`);

      setUser(currentUser);

      if (currentUser) {
        await fetchUserCollections(currentUser.uid); 
      } else {
        setUserWatchlist([]);
        setUserFavorites([]);
        console.log("[onAuthStateChanged Callback] User is null, collections cleared.");
      }

      setLoadingAuthAndUserData(false);
      console.log(`[onAuthStateChanged Callback] Loading set to false. Final user: ${currentUser?.uid || 'null'}`);
    });

    return () => {
      unsubscribe();
      console.log("[App useEffect Auth] onAuthStateChanged listener unsubscribed.");
    };
  }, [auth, fetchUserCollections]);

  const handleUserToggleSuccess = useCallback(async () => {
    console.log("[handleUserToggleSuccess] Triggered.");
    if (user?.uid) {
      console.log(`[handleUserToggleSuccess] Re-fetching for user: ${user.uid}`);
      await fetchUserCollections(user.uid);
    } else {
      console.warn("[handleUserToggleSuccess] No user.uid available for re-fetch. Collections already cleared?");
      setUserWatchlist([]);
      setUserFavorites([]);
    }
  }, [user, fetchUserCollections]);

  if (loadingAuthAndUserData) {
    console.log("[App Render] Showing loading screen.");
    return (
      <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
        <div className="flex justify-center items-center h-screen text-white text-xl">
          Loading application and user data...
        </div>
      </Layout>
    );
  }

  console.log(`[App Render] Rendering routes. User UID: ${user?.uid}`);
  return (
    <Router>
      <Routes>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            user ? (
              <HomePage
                auth={auth}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                userId={user.uid}
                userWatchlist={userWatchlist}
                userFavorites={userFavorites}
                onUserToggleSuccess={handleUserToggleSuccess}
              />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
        <Route
          path="/favorites"
          element={
            user ? (
              <Favorites
                auth={auth}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                userId={user.uid}
                userFavorites={userFavorites}
                userWatchlist={userWatchlist}
                onUserToggleSuccess={handleUserToggleSuccess}
              />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
        <Route
          path="/watchlist"
          element={
            user ? (
              <Watchlist
                auth={auth}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                userId={user.uid}
                userWatchlist={userWatchlist}
                userFavorites={userFavorites}
                onUserToggleSuccess={handleUserToggleSuccess}
              />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
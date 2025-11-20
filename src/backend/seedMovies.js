import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import axios from 'axios';
import Movie from './models/movie.js';

const MONGODB_URI = process.env.MONGODB_URI;
const TMDB_API_KEY = process.env.TMDB_API_KEY;


const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0',
  },
});



async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axiosInstance.get(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Retrying request... (${i + 1})`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function seedMovies() {
  await mongoose.connect(MONGODB_URI);

  const totalPages = 5;

  try {
    for (let page = 1; page <= totalPages; page++) {
      const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
      const response = await fetchWithRetry(url);
      const movies = response.data.results;

      for (const m of movies) {
        const movieData = {
          tmdbId: m.id,
          title: m.title,
          posterPath: m.poster_path,
          releaseDate: m.release_date,
          mediaType: 'movie',
          voteAverage: m.vote_average,
        };

        await Movie.findOneAndUpdate({ tmdbId: m.id }, movieData, { upsert: true });
      }

      console.log(`Page ${page} movies seeded.`);
    }

    console.log('Movies seeded successfully.');
  } catch (err) {
    console.error('Error seeding movies:', err);
  } finally {
    await mongoose.connection.close();
  }
}


seedMovies();

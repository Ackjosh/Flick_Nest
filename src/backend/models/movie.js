import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, unique: true, required: true },
  title: { type: String, required: true },
  posterPath: String,
  releaseDate: String,
  mediaType: String,
  voteAverage: Number,
  episodes: Number
},
{ timestamps: true }
);

export default mongoose.model('Movie', movieSchema);
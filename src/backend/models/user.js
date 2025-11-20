import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true
    },
    watchlist: [{
      id: { type: String, required: true },
      media_type: { type: String, required: true, enum: ['movie', 'tv'] }
    }, { _id: false }],
    favorites: [{
      id: { type: String, required: true },
      media_type: { type: String, required: true, enum: ['movie', 'tv'] }
    }, { _id: false }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
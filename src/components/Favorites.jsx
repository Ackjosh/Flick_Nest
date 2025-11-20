import express from 'express';
import User from '../models/user.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const firebaseUid = req.params.userId;
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.json({
        favorites: [],
        watchlist: []
      });
    }

    res.json({
      favorites: user.favorites,
      watchlist: user.watchlist
    });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:userId/favorites', async (req, res) => {
  const firebaseUid = req.params.userId;
  const { itemId, mediaType } = req.body;

  if (!firebaseUid || typeof firebaseUid !== 'string' || firebaseUid.length === 0 || firebaseUid === 'null') {
    console.error('Validation failed: A valid user ID is required for this action.');
    return res.status(400).json({ message: 'A valid user ID is required.' });
  }

  if (!itemId || !mediaType) {
    return res.status(400).json({ message: 'itemId and mediaType are required in the request body.' });
  }

  try {
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = new User({ firebaseUid, favorites: [] });
      await user.save();
    }

    const itemToAdd = { id: String(itemId), media_type: mediaType };

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      { $addToSet: { favorites: itemToAdd } },
      { new: true }
    );

    res.status(200).json({
      message: 'Item added to favorites',
      favorites: updatedUser.favorites
    });
  } catch (err) {
    console.error('Error adding to favorites:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:userId/favorites', async (req, res) => {
  const firebaseUid = req.params.userId;
  const { mediaId, mediaType } = req.query;

  if (!mediaId || !mediaType) {
    return res.status(400).json({ message: 'mediaId and mediaType are required query parameters.' });
  }

  try {
    const itemToRemove = { id: String(mediaId), media_type: mediaType };

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { $pull: { favorites: itemToRemove } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Item removed from favorites',
      favorites: user.favorites
    });
  } catch (err) {
    console.error('Error removing from favorites:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:userId/watchlist', async (req, res) => {
  const firebaseUid = req.params.userId;
  const { itemId, mediaType } = req.body;

  if (!itemId || !mediaType) {
    return res.status(400).json({ message: 'itemId and mediaType are required in the request body.' });
  }

  try {
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = new User({ firebaseUid, watchlist: [] });
      await user.save();
    }

    const itemToAdd = { id: String(itemId), media_type: mediaType };

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      { $addToSet: { watchlist: itemToAdd } },
      { new: true }
    );

    res.status(200).json({
      message: 'Item added to watchlist',
      watchlist: updatedUser.watchlist
    });
  } catch (err) {
    console.error('Error adding to watchlist:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:userId/watchlist', async (req, res) => {
  const firebaseUid = req.params.userId;
  const { mediaId, mediaType } = req.query;

  if (!mediaId || !mediaType) {
    return res.status(400).json({ message: 'mediaId and mediaType are required query parameters.' });
  }

  try {
    const itemToRemove = { id: String(mediaId), media_type: mediaType };

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { $pull: { watchlist: itemToRemove } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Item removed from watchlist',
      watchlist: user.watchlist
    });
  } catch (err) {
    console.error('Error removing from watchlist:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
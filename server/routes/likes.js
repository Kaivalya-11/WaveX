const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

// Get user's liked songs
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const likes = await db.collection('likedSongs')
      .find({ userId })
      .sort({ addedAt: -1 })
      .toArray();
      
    res.json(likes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Like a song
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const { userId, track } = req.body;
    if (!userId || !track || !track.id) return res.status(400).json({ error: "Missing userId or track data" });

    // Use track.id as trackId
    const likeDoc = {
      userId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover, // The frontend uses 'cover', not 'thumbnail'
      duration: track.duration,
      src: track.src,
      addedAt: new Date()
    };

    await db.collection('likedSongs').updateOne(
      { userId, trackId: track.id },
      { $setOnInsert: likeDoc },
      { upsert: true }
    );
    
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unlike a song
router.delete('/:trackId', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    await db.collection('likedSongs').deleteOne({ userId, trackId: req.params.trackId });
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

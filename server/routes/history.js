const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

// Get user's listening history
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const history = await db.collection('recentlyPlayed')
      .find({ userId })
      .sort({ playedAt: -1 })
      .limit(50) // Limit to 50 recent tracks
      .toArray();
      
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Record a played track
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const { userId, track } = req.body;
    if (!userId || !track || !track.id) return res.status(400).json({ error: "Missing userId or track data" });

    const trackDoc = {
      userId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover,
      duration: track.duration,
      src: track.src,
      playedAt: new Date()
    };

    // Update if exists to bump the playedAt timestamp, otherwise insert
    await db.collection('recentlyPlayed').updateOne(
      { userId, trackId: track.id },
      { $set: trackDoc },
      { upsert: true }
    );
    
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

// Get user's downloaded tracks metadata
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const downloads = await db.collection('downloads')
      .find({ userId })
      .sort({ addedAt: -1 })
      .toArray();
      
    res.json(downloads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add downloaded track metadata
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const { userId, track } = req.body;
    if (!userId || !track || !track.id) return res.status(400).json({ error: "Missing userId or track data" });

    const downloadDoc = {
      userId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover,
      duration: track.duration,
      src: track.src,
      addedAt: new Date()
    };

    await db.collection('downloads').updateOne(
      { userId, trackId: track.id },
      { $setOnInsert: downloadDoc },
      { upsert: true }
    );
    
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove a download
router.delete('/:trackId', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    await db.collection('downloads').deleteOne({ userId, trackId: req.params.trackId });
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

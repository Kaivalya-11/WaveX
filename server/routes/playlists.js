const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all playlists for a user
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const playlists = await db.collection('playlists').find({ userId }).sort({ createdAt: -1 }).toArray();
    res.json(playlists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific playlist
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const playlist = await db.collection('playlists').findOne({ _id: new ObjectId(req.params.id) });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    
    res.json(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a playlist
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const { userId, name, description } = req.body;
    if (!userId || !name) return res.status(400).json({ error: "Missing userId or name" });

    const result = await db.collection('playlists').insertOne({
      userId,
      name,
      description: description || "",
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const newPlaylist = await db.collection('playlists').findOne({ _id: result.insertedId });
    res.status(201).json(newPlaylist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add track to playlist
router.post('/:id/tracks', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const { track } = req.body;
    if (!track || !track.id) return res.status(400).json({ error: "Missing track data" });

    const playlist = await db.collection('playlists').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $push: { 
          tracks: {
            trackId: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            duration: track.duration,
            src: track.src,
            addedAt: new Date()
          } 
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
    
    res.json(playlist.value || playlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackId', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const playlist = await db.collection('playlists').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $pull: { tracks: { trackId: req.params.trackId } },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
    
    res.json(playlist.value || playlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    await db.collection('playlists').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

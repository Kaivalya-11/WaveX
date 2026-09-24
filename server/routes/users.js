const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get user profile/preferences
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const user = await db.collection('users').findOne({ googleId: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create/Update user (Auth sync)
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const { googleId, name, email, avatar, preferences } = req.body;
    if (!googleId) return res.status(400).json({ error: "Missing googleId" });

    const result = await db.collection('users').findOneAndUpdate(
      { googleId },
      { 
        $set: { 
          name, 
          email, 
          avatar, 
          updatedAt: new Date() 
        },
        $setOnInsert: {
          googleId,
          preferences: preferences || { audioQuality: 320, explicitContent: false, searchView: "list" },
          createdAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    res.json(result.value || result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update preferences
router.patch('/:id/preferences', async (req, res) => {
  try {
    const db = getDB();
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const { preferences } = req.body;
    const result = await db.collection('users').findOneAndUpdate(
      { googleId: req.params.id },
      { $set: { preferences, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    res.json(result.value || result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

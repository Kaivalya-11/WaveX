const { MongoClient } = require('mongodb');

let db = null;
let client = null;

const connectDB = async () => {
  if (db) return db;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI is not defined in environment variables.');
    return null; // Don't crash, just operate in degraded mode
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('wavex');
    console.log('[DB] Successfully connected to MongoDB.');
    return db;
  } catch (error) {
    console.error('[DB] Failed to connect to MongoDB:', error.message);
    db = null;
    return null;
  }
};

const getDB = () => db;

module.exports = { connectDB, getDB };

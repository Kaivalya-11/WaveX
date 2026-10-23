import { MongoClient, Db } from 'mongodb';

const globalWithMongo = global as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoDb?: Db;
};

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db | null> {
  if (process.env.NODE_ENV === 'development' && globalWithMongo._mongoDb) {
    return globalWithMongo._mongoDb;
  }
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI is not defined in environment variables.');
    return null;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('wavex');
    if (process.env.NODE_ENV === 'development') {
      globalWithMongo._mongoClient = client;
      globalWithMongo._mongoDb = db;
    }
    console.log('[DB] Connected to MongoDB wavex database.');
    return db;
  } catch (error: any) {
    console.error('[DB] Failed to connect to MongoDB:', error.message);
    return null;
  }
}

export async function getDB(): Promise<Db | null> {
  if (process.env.NODE_ENV === 'development' && globalWithMongo._mongoDb) {
    return globalWithMongo._mongoDb;
  }
  if (db) return db;
  return connectDB();
}


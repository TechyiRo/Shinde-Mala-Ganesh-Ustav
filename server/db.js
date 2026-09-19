import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import {
  initialMandalSettings,
  initialPavtiList,
  initialExpenseList,
  initialEventList
} from '../src/data/initialData.js';

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://srohidas0_db_user:gOZTyVbZPwxaYNx2@cluster0.cosetsy.mongodb.net/ganesh_utsav?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let dbInstance = null;

export async function connectDB() {
  if (dbInstance) return dbInstance;
  try {
    await client.connect();
    dbInstance = client.db('ganesh_utsav');
    console.log('✅ Connected successfully to MongoDB Atlas (database: ganesh_utsav)');
    
    // Seed initial data if collections are empty
    await seedInitialData(dbInstance);
    return dbInstance;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error);
    throw error;
  }
}

export function getDB() {
  if (!dbInstance) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return dbInstance;
}

export async function wipeAllData() {
  const db = getDB();
  await Promise.all([
    db.collection('pavtis').deleteMany({}),
    db.collection('expenses').deleteMany({}),
    db.collection('events').deleteMany({})
  ]);
  console.log('🧹 Cleaned all pavtis, expenses, and events from MongoDB Atlas');
}

async function seedInitialData(db) {
  try {
    // 1. Settings (Ensure official mandal information and committee is saved)
    const settingsCol = db.collection('settings');
    const settingsCount = await settingsCol.countDocuments();
    if (settingsCount === 0) {
      await settingsCol.insertOne({
        _id: 'mandal_settings',
        ...initialMandalSettings,
        createdAt: new Date().toISOString()
      });
      console.log('🌱 Seeded official Mandal Settings to MongoDB Atlas');
    }
    // Note: Pavtis, expenses, and events are not automatically re-seeded
    // to preserve a clean slate for production deployment.
  } catch (seedErr) {
    console.warn('⚠️ Seeding notice (non-fatal):', seedErr.message);
  }
}

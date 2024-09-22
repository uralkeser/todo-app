import { MongoClient } from 'mongodb';
import { databaseConfig } from './configConstant.js';

const { DATABASE_URI, DATABASE_NAME } = databaseConfig;

let dbInstance;

// Function to connect to MongoDB and return the database instance
export const mongoConnection = async () => {
  if (dbInstance) {
    return dbInstance; // If already connected, return the db instance
  }

  try {
    const client = await MongoClient.connect(DATABASE_URI);
    dbInstance = client.db(DATABASE_NAME);
    return dbInstance;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

import { mongoConnection } from '../config/mongoConfig.js';

const collections = ['tasks', 'projects'];

async function createCollections(db) {
  for (const collection of collections) {
    await db.createCollection(collection);
    console.log(`Collection created: ${collection}`);
  }
}

async function createDatabase() {
  try {
    const db = await mongoConnection();
    console.log(`Connected to database: ${db.databaseName}`);

    // Call the function to create collections
    await createCollections(db);

    console.log('All collections created successfully');
  } catch (error) {
    console.error('Error creating collections:', error);
  } finally {
    // Terminate the process
    process.exit(0);
  }
}

createDatabase();

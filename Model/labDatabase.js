const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function connectToDB() {
  try {
    await client.connect();
    return client.db();
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    throw error;
  }
}

module.exports = { connectToDB };

process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed on program shutdown (SIGINT)');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection on program shutdown (SIGINT):', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed on program shutdown (SIGTERM)');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection on program shutdown (SIGTERM):', error);
    process.exit(1);
  }
});

process.on('SIGQUIT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed on program shutdown (SIGQUIT)');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection on program shutdown (SIGQUIT):', error);
    process.exit(1);
  }
});


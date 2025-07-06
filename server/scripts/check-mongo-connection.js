#!/usr/bin/env node
// filepath: /home/prakhar/Repos/AceAI/server/scripts/check-mongo-connection.js

/**
 * MongoDB Connection Check Script
 * 
 * This script tests the MongoDB connection using the configuration in .env
 * Usage: node scripts/check-mongo-connection.js
 */

// Load environment variables
require('dotenv').config();

const { MongoClient } = require('mongodb');
const config = require('../config');

async function checkConnection() {
  console.log('MongoDB Connection Check');
  console.log('=======================');
  console.log(`URI: ${maskConnectionString(config.mongodb.uri)}`);
  console.log(`Database: ${config.mongodb.dbName}`);
  console.log(`Collection: ${config.mongodb.chatCollection}`);
  console.log('------------------------');

  let client;
  try {
    // Create new MongoDB client
    client = new MongoClient(config.mongodb.uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connection successful');
    
    // Access the database
    console.log(`Accessing database '${config.mongodb.dbName}'...`);
    const db = client.db(config.mongodb.dbName);
    await db.command({ ping: 1 });
    console.log('✅ Database access successful');
    
    // List collections
    console.log('Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collection(s):`);
    collections.forEach(c => console.log(` - ${c.name}`));
    
    // Check if our chat collection exists
    const chatCollectionExists = collections.some(c => c.name === config.mongodb.chatCollection);
    if (chatCollectionExists) {
      console.log(`✅ Chat collection '${config.mongodb.chatCollection}' exists`);
      
      // Check document count
      const count = await db.collection(config.mongodb.chatCollection).countDocuments();
      console.log(`   Documents in collection: ${count}`);
    } else {
      console.log(`ℹ️ Chat collection '${config.mongodb.chatCollection}' does not exist yet`);
      console.log('   It will be created when the first chat message is stored');
    }
    
    console.log('\n✅ MongoDB connection check completed successfully');
    console.log('You can use MongoDB for chat history persistence.');
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:');
    console.error(error.message);
    
    // Provide helpful troubleshooting tips
    console.log('\nTroubleshooting tips:');
    console.log('1. Ensure MongoDB is running');
    console.log('2. Check your connection string in .env file');
    console.log('3. Verify network connectivity to your MongoDB instance');
    console.log('4. Check for any authentication requirements');
    
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Helper function to mask sensitive connection string details
function maskConnectionString(uri) {
  if (!uri) return 'undefined';
  
  try {
    // Simple masking for MongoDB connection strings
    if (uri.includes('@')) {
      const parts = uri.split('@');
      const credentials = parts[0].split('://')[1];
      
      if (credentials.includes(':')) {
        const [username, password] = credentials.split(':');
        const maskedPassword = password ? '•'.repeat(Math.min(password.length, 10)) : '';
        return uri.replace(`${username}:${password}`, `${username}:${maskedPassword}`);
      }
      
      return uri;
    }
    
    return uri;
  } catch (e) {
    return uri; // Return original if parsing fails
  }
}

// Run the check
checkConnection().catch(console.error);

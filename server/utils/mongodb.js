const { MongoClient } = require('mongodb');
const config = require('../config');
const logger = require('./logger');

class MongoDBClient {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Initialize and connect to MongoDB
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.isConnected) {
      return;
    }

    try {
      // Validate MongoDB URI
      if (!config.mongodb.uri) {
        throw new Error('MongoDB URI is not defined. Please check your .env file.');
      }
      
      logger.info('Connecting to MongoDB...');
      this.client = new MongoClient(config.mongodb.uri, {
        connectTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
      });
      
      // Add connection event listeners
      this.client.on('connectionReady', () => {
        logger.debug('MongoDB connection ready');
      });
      
      this.client.on('error', (err) => {
        logger.error('MongoDB client error:', err);
      });
      
      await this.client.connect();
      this.db = this.client.db(config.mongodb.dbName);
      this.isConnected = true;
      
      logger.info(`Connected to MongoDB: ${config.mongodb.dbName}`);
      
      // Test the connection by pinging the database
      await this.db.command({ ping: 1 });
      logger.debug('MongoDB ping successful');
    } catch (error) {
      logger.error('Error connecting to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Get database instance
   * @returns {import('mongodb').Db}
   */
  async getDB() {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.db;
  }
  
  /**
   * Initialize database indexes for better performance
   */
  async createIndexes() {
    try {
      const db = await this.getDB();
      const collection = db.collection(config.mongodb.chatCollection);
      
      // Create index on sessionId for better chat retrieval performance
      await collection.createIndex({ sessionId: 1 });
      logger.info(`Created index on ${config.mongodb.chatCollection}.sessionId`);
      
      // Create compound index on sessionId and timestamp for sorted retrieval
      await collection.createIndex({ sessionId: 1, timestamp: 1 });
      logger.info(`Created compound index on ${config.mongodb.chatCollection}.sessionId and timestamp`);
      
      return true;
    } catch (error) {
      logger.error('Error creating MongoDB indexes:', error);
      return false;
    }
  }

  /**
   * Get a collection from the database
   * @param {string} collectionName 
   * @returns {import('mongodb').Collection}
   */
  async getCollection(collectionName) {
    const db = await this.getDB();
    return db.collection(collectionName);
  }

  /**
   * Close the MongoDB connection
   */
  async close() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      logger.info('MongoDB connection closed');
    }
  }
}

// Singleton instance
const mongoDBClient = new MongoDBClient();

module.exports = mongoDBClient;

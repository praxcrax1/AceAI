const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
const { BufferMemory } = require('langchain/memory');
const { MongoDBChatMessageHistory } = require('@langchain/mongodb');
const { ConversationalRetrievalQAChain } = require('langchain/chains');
const config = require('../config');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { AppError } = require('../utils/errorHandler');
const mongoDBClient = require('../utils/mongodb');

class ChatService {
  constructor() {
    this.pineconeClient = null;
    this.pineconeIndex = null;
    this.sessionMemory = new Map();
    this.mongoInitialized = false;

    // Initialize AI models only when needed
    this._initializeAI();
  }
  
  async initMongoDB() {
    if (this.mongoInitialized) return;
    
    try {
      // Connect to MongoDB
      await mongoDBClient.connect();
      
      // Create indexes for better performance
      await mongoDBClient.createIndexes();
      
      this.mongoInitialized = true;
      logger.info('MongoDB initialized successfully for chat service');
    } catch (error) {
      logger.error('Error initializing MongoDB for chat service:', error);
      throw new AppError('Failed to initialize MongoDB: ' + error.message, 500);
    }
  }

  _initializeAI() {
    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('Google API key is not defined');
      }

      console.log(`Initializing embeddings with model: ${config.embeddings.modelName}`);
      this.embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: apiKey,
        modelName: config.embeddings.modelName,
      });
      
      console.log(`Initializing LLM with model: ${config.llm.modelName}`);
      this.llm = new ChatGoogleGenerativeAI({
        apiKey: apiKey,
        model: config.llm.modelName, // Using model instead of modelName
        maxOutputTokens: config.llm.maxOutputTokens,
        temperature: config.llm.temperature,
      });
      
      console.log('LLM initialized successfully');
    } catch (error) {
      console.error('Error initializing LLM or embeddings:', error);
      throw new AppError('Failed to initialize AI models: ' + error.message, 500);
    }
  }

  async initPinecone() {
    if (this.pineconeClient) return;

    try {
      // Initialize Pinecone client with v6 API
      this.pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

      // Get the index (note the lowercase 'index' method)
      this.pineconeIndex = this.pineconeClient.index(process.env.PINECONE_INDEX_NAME);
      console.log('Pinecone initialized successfully');
    } catch (error) {
      console.error('Error initializing Pinecone:', error);
      throw error;
    }
  }

  async getOrCreateMemory(sessionId) {
    try {
      // Ensure MongoDB is initialized
      await this.initMongoDB();
      
      if (!this.sessionMemory.has(sessionId)) {
        logger.debug(`Creating new MongoDB chat history for session: ${sessionId}`);
        
        // Get MongoDB database and collection references
        const db = await mongoDBClient.getDB();
        const collection = db.collection(config.mongodb.chatCollection);
        
        // Create MongoDB chat message history with collection object
        const messageHistory = new MongoDBChatMessageHistory({
          collection, // Pass the actual collection object instead of the name
          sessionId: sessionId,
        });

        // Create memory with MongoDB backing
        const memory = new BufferMemory({
          chatHistory: messageHistory,
          memoryKey: 'chat_history',
          returnMessages: true,
          inputKey: 'question',
          outputKey: 'text',
        });
        
        this.sessionMemory.set(sessionId, memory);
        logger.debug(`MongoDB chat history created for session: ${sessionId}`);
      }
      
      return this.sessionMemory.get(sessionId);
    } catch (error) {
      logger.error(`Error creating MongoDB chat memory for session ${sessionId}:`, error);
      
      // Fallback to in-memory storage if MongoDB fails
      logger.warn(`Falling back to in-memory chat history for session: ${sessionId}`);
      const fallbackMemory = new BufferMemory({
        memoryKey: 'chat_history',
        returnMessages: true,
        inputKey: 'question',
        outputKey: 'text',
      });
      
      this.sessionMemory.set(sessionId, fallbackMemory);
      return fallbackMemory;
    }
  }

  /**
   * Clear chat history for a specific session
   * @param {string} sessionId - The ID of the session to clear
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  async clearChatHistory(sessionId) {
    try {
      logger.debug(`Clearing chat history for session: ${sessionId}`);
      
      // Ensure MongoDB is initialized
      await this.initMongoDB();
      
      // Remove from in-memory cache
      this.sessionMemory.delete(sessionId);
      
      // Remove from MongoDB
      const db = await mongoDBClient.getDB();
      const collection = db.collection(config.mongodb.chatCollection);
      await collection.deleteMany({ sessionId });
      
      logger.info(`Chat history cleared for session: ${sessionId}`);
      return true;
    } catch (error) {
      logger.error(`Error clearing chat history for session ${sessionId}:`, error);
      return false;
    }
  }

  async processQuestion(question, sessionId, fileId) {
    try {
      // Check if namespace exists in Pinecone
      const vectorStoreKey = `vectorstore:${fileId}`;
      let vectorStore = cache.get(vectorStoreKey);
      
      if (!vectorStore) {
        logger.debug(`Vector store not in cache for fileId: ${fileId}, creating new instance`);
        
        // Initialize Pinecone
        await this.initPinecone();
        
        // Make sure MongoDB is initialized for chat history
        await this.initMongoDB();

        // Create a vector store for the specific document namespace
        try {
          vectorStore = await PineconeStore.fromExistingIndex(
            this.embeddings,
            {
              pineconeIndex: this.pineconeIndex,
              namespace: fileId,
            }
          );
          
          // Cache the vectorStore for future use (15 minutes)
          cache.set(vectorStoreKey, vectorStore, 900);
        } catch (error) {
          logger.error(`Error retrieving vectors for fileId ${fileId}:`, error);
          throw new AppError(
            `No document found with ID: ${fileId}. Please upload a document first.`,
            404,
            { fileId }
          );
        }
      }

      // Create a retriever
      const retriever = vectorStore.asRetriever({
        searchType: 'similarity',
        searchKwargs: { k: config.vectorSearch.topK }, // Retrieve top K most similar chunks
      });

      // Get or create memory for this session (now async)
      const memory = await this.getOrCreateMemory(sessionId);

      // Create a conversational chain
      const chain = ConversationalRetrievalQAChain.fromLLM(
        this.llm,
        retriever,
        {
          memory: memory,
          returnSourceDocuments: true,
          questionGeneratorChainOptions: {
            llm: this.llm,
          },
        }
      );

      // Process the question
      const response = await chain.call({
        question,
      });

      // Extract sources from the response
      const sources = response.sourceDocuments.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      }));

      return {
        answer: response.text,
        sources: sources.slice(0, 3), // Return the top 3 sources for reference
      };
    } catch (error) {
      console.error('Error processing question:', error);
      throw error;
    }
  }
  
  /**
   * Gracefully shutdown connections and resources
   */
  async shutdown() {
    logger.info('Shutting down chat service...');
    
    // Clear in-memory session cache
    this.sessionMemory.clear();
    
    // Close MongoDB connection if it was initialized
    if (this.mongoInitialized) {
      try {
        await mongoDBClient.close();
        logger.info('MongoDB connection closed');
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
      }
    }
    
    logger.info('Chat service shutdown complete');
  }
}

module.exports = new ChatService();

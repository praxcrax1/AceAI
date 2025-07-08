const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
const { BufferMemory } = require('langchain/memory');
const { MongoDBChatMessageHistory } = require('@langchain/mongodb');
const config = require('../config');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { AppError } = require('../utils/errorHandler');
const mongoDBClient = require('../utils/mongodb');
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");

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
      await this.initMongoDB();
      if (!this.sessionMemory.has(sessionId)) {
        const db = await mongoDBClient.getDB();
        const collection = db.collection(config.mongodb.chatCollection);
        const messageHistory = new MongoDBChatMessageHistory({
          collection,
          sessionId: sessionId,
        });
        const memory = new BufferMemory({
          chatHistory: messageHistory,
          memoryKey: 'chat_history',
          returnMessages: true,
          inputKey: 'question',
          outputKey: 'text',
        });
        this.sessionMemory.set(sessionId, memory);
      }
      return this.sessionMemory.get(sessionId);
    } catch (error) {
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
    const userId = sessionId.split(':')[0];
    const pineconeNamespace = `${userId}:${fileId}`;
    try {
      let vectorStore = cache.get(`vectorstore:${pineconeNamespace}`);
      if (!vectorStore) {
        await this.initPinecone();
        await this.initMongoDB();
        try {
          vectorStore = await PineconeStore.fromExistingIndex(
            this.embeddings,
            {
              pineconeIndex: this.pineconeIndex,
              namespace: pineconeNamespace,
            }
          );
          cache.set(`vectorstore:${pineconeNamespace}`, vectorStore, 900);
        } catch (error) {
          throw new AppError(
            `No document found with ID: ${fileId}. Please upload a document first.`,
            404,
            { fileId }
          );
        }
      }
      const retriever = vectorStore.asRetriever({
        searchType: 'similarity',
        searchKwargs: { k: config.vectorSearch.topK },
      });
      const memory = await this.getOrCreateMemory(sessionId);
      let chatHistoryMessages = [];
      if (memory && typeof memory.chatHistory?.getMessages === 'function') {
        chatHistoryMessages = await memory.chatHistory.getMessages();
      }
      const relevantDocs = await retriever.getRelevantDocuments(question);
      const context = relevantDocs.map(doc => doc.pageContent).join("\n---\n");
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant for answering questions about a document. Use the provided context to answer. If you don't know, say so."],
        new MessagesPlaceholder("history"),
        ["user", "Context:\n{context}\n\nQuestion: {question}"]
      ]);
      const promptInput = {
        history: chatHistoryMessages,
        context,
        question
      };
      const messages = await prompt.formatMessages(promptInput);
      const response = await this.llm.invoke(messages);
      if (memory && typeof memory.saveContext === 'function') {
        await memory.saveContext({ question }, { text: response.content });
      }
      const sources = relevantDocs.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      }));
      return {
        answer: response.content,
        sources: sources.slice(0, 3),
      };
    } catch (error) {
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

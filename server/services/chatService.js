const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
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

    // Initialize AI models only when needed
    this._initializeAI();
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

  async processQuestion(question, sessionId, fileId) {
    const userId = sessionId.split(':')[0]; // Expect sessionId to be userId:sessionId
    const pineconeNamespace = `${userId}:${fileId}`;
    try {
      let vectorStore = cache.get(`vectorstore:${pineconeNamespace}`);
      if (!vectorStore) {
        logger.debug(`Vector store not in cache for fileId: ${fileId}, creating new instance`);
        await this.initPinecone();
        // No chat memory needed, so skip MongoDB chat history
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
          logger.error(`Error retrieving vectors for fileId ${fileId}:`, error);
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
      // No memory: stateless chain
      const chain = ConversationalRetrievalQAChain.fromLLM(
        this.llm,
        retriever,
        {
          returnSourceDocuments: true,
          questionGeneratorChainOptions: {
            llm: this.llm,
          },
        }
      );
      const response = await chain.call({ question });
      const sources = response.sourceDocuments.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      }));
      return {
        answer: response.text,
        sources: sources.slice(0, 3),
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

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
const { BufferMemory } = require('langchain/memory');
const { ConversationalRetrievalQAChain } = require('langchain/chains');
const config = require('../config');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { AppError } = require('../utils/errorHandler');

class ChatService {
  constructor() {
    this.pineconeClient = null;
    this.pineconeIndex = null;
    this.sessionMemory = new Map();

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

  getOrCreateMemory(sessionId) {
    if (!this.sessionMemory.has(sessionId)) {
      const memory = new BufferMemory({
        memoryKey: 'chat_history',
        returnMessages: true,
        inputKey: 'question',
        outputKey: 'text',
      });
      this.sessionMemory.set(sessionId, memory);
    }
    return this.sessionMemory.get(sessionId);
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

      // Get or create memory for this session
      const memory = this.getOrCreateMemory(sessionId);

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
}

module.exports = new ChatService();

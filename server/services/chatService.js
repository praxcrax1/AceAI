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
const { 
  ChatPromptTemplate, 
  MessagesPlaceholder,
} = require("@langchain/core/prompts");

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
      await mongoDBClient.connect();
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
        model: config.llm.modelName,
        maxOutputTokens: config.llm.maxOutputTokens,
        temperature: config.llm.temperature,
      });
      
      // Create a separate LLM instance for query contextualization
      this.queryLLM = new ChatGoogleGenerativeAI({
        apiKey: apiKey,
        model: config.llm.modelName,
        maxOutputTokens: 200, // Shorter responses for query generation
        temperature: 0.1, // Lower temperature for more focused queries
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
      this.pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

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
        
        // Fixed: Use consistent keys and proper memory configuration
        const memory = new BufferMemory({
          chatHistory: messageHistory,
          memoryKey: 'chat_history',
          returnMessages: true,
          // Remove inputKey and outputKey to use default behavior
        });
        
        this.sessionMemory.set(sessionId, memory);
      }
      return this.sessionMemory.get(sessionId);
    } catch (error) {
      logger.warn('Falling back to in-memory chat history due to MongoDB error:', error);
      const fallbackMemory = new BufferMemory({
        memoryKey: 'chat_history',
        returnMessages: true,
      });
      this.sessionMemory.set(sessionId, fallbackMemory);
      return fallbackMemory;
    }
  }

  /**
   * Save conversation to memory - Fixed implementation
   */
  async saveToMemory(memory, humanMessage, aiMessage) {
    try {
      if (memory && memory.chatHistory) {
        // Add messages directly to chat history
        await memory.chatHistory.addUserMessage(humanMessage);
        await memory.chatHistory.addAIMessage(aiMessage);
        logger.debug('Successfully saved conversation to memory');
      }
    } catch (error) {
      logger.error('Error saving to memory:', error);
      // Don't throw error, just log it so conversation can continue
    }
  }

  /**
   * Generate a contextualized query based on chat history
   * This is crucial for handling follow-up questions that reference previous context
   */
  async contextualizeQuery(question, chatHistory) {
    if (!chatHistory || chatHistory.length === 0) {
      return question;
    }

    // Create a prompt template for query contextualization
    const contextualizePrompt = ChatPromptTemplate.fromMessages([
      ["system", `Given a chat history and the latest user question which might reference context in the chat history, 
        formulate a standalone question which can be understood without the chat history. 
        Do NOT answer the question, just reformulate it if needed and otherwise return it as is.
        
        Examples:
        Chat History: [Human: "What is task decomposition?", AI: "Task decomposition is breaking down complex tasks into smaller, manageable steps."]
        Follow-up Question: "What are common ways of doing it?"
        Standalone Question: "What are common ways of doing task decomposition?"
        
        Chat History: [Human: "Tell me about machine learning", AI: "Machine learning is a subset of AI..."]
        Follow-up Question: "How does it work?"
        Standalone Question: "How does machine learning work?"
        
        Chat History: [Human: "My name is John", AI: "Nice to meet you, John!"]
        Follow-up Question: "Do you remember my name?"
        Standalone Question: "Do you remember my name from our conversation?"`],
      new MessagesPlaceholder("chat_history"),
      ["human", "Question: {question}"]
    ]);

    try {
      const messages = await contextualizePrompt.formatMessages({
        chat_history: chatHistory,
        question: question
      });

      const response = await this.queryLLM.invoke(messages);
      const contextualizedQuery = response.content.trim();
      
      logger.debug(`Original question: "${question}"`);
      logger.debug(`Contextualized query: "${contextualizedQuery}"`);
      
      return contextualizedQuery;
    } catch (error) {
      logger.error('Error contextualizing query:', error);
      return question; // Fallback to original question
    }
  }

  /**
   * Enhanced routing that better handles conversational context
   */
  async shouldRetrieveDocuments(question, chatHistory) {
    const routingPrompt = ChatPromptTemplate.fromMessages([
      ["system", `You are an expert at routing user questions to the appropriate handler.
        
        Given a user question and chat history, determine if it requires searching through documents to answer,
        or if it can be answered directly as a general conversation.
        
        Questions that need document retrieval:
        - Specific questions about document content, data, or information
        - Questions asking for facts that would be in documents
        - Follow-up questions that build on previous document-based answers
        - Technical questions that require specific information
        
        Questions that don't need document retrieval:
        - General greetings ("hello", "hi", "how are you")
        - Personal introductions ("my name is...", "I'm...")
        - General conversation ("thank you", "goodbye")
        - Questions about names, personal details shared in conversation
        - Questions about your capabilities or memory
        - Simple clarification requests
        - Questions about previous conversation context (like "do you remember my name?")
        
        IMPORTANT: If the question is about remembering personal details, names, or conversation context,
        this should be answered directly from chat history, not from documents.
        
        Respond with only "RETRIEVE" or "DIRECT"`],
      new MessagesPlaceholder("chat_history"),
      ["human", "Question: {question}"]
    ]);

    try {
      const messages = await routingPrompt.formatMessages({
        chat_history: chatHistory.slice(-6), // Use more history for better context
        question: question
      });

      const response = await this.queryLLM.invoke(messages);
      const decision = response.content.trim().toUpperCase();
      
      logger.debug(`Routing decision for "${question}": ${decision}`);
      return decision === "RETRIEVE";
    } catch (error) {
      logger.error('Error in routing decision:', error);
      return false; // Default to direct response when in doubt
    }
  }

  /**
   * Generate a direct response without document retrieval - Enhanced for memory
   */
  async generateDirectResponse(question, chatHistory) {
    const directPrompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a helpful assistant with excellent memory of our conversation. 
        Use the chat history to maintain context and remember personal details like names, 
        preferences, and previous topics discussed.
        
        Guidelines:
        - Remember and use names and personal details shared in conversation
        - Reference previous topics when relevant
        - Be conversational and friendly
        - If asked about remembering something, check the chat history carefully
        - Keep responses concise but warm and personal`],
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"]
    ]);

    const messages = await directPrompt.formatMessages({
      chat_history: chatHistory,
      question: question
    });

    const response = await this.llm.invoke(messages);
    return {
      answer: response.content,
      sources: [],
      requiresRetrieval: false
    };
  }

  /**
   * Clear chat history for a specific session
   */
  async clearChatHistory(sessionId) {
    try {
      logger.debug(`Clearing chat history for session: ${sessionId}`);
      
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
      // Get memory and chat history
      const memory = await this.getOrCreateMemory(sessionId);
      let chatHistory = [];
      
      if (memory && memory.chatHistory && typeof memory.chatHistory.getMessages === 'function') {
        chatHistory = await memory.chatHistory.getMessages();
      }

      // Check if we need to retrieve documents
      const needsRetrieval = await this.shouldRetrieveDocuments(question, chatHistory);
      
      let answer, sources = [], requiresRetrieval = false, contextualizedQuery = null;

      if (!needsRetrieval) {
        logger.debug('Generating direct response without document retrieval');
        const directResponse = await this.generateDirectResponse(question, chatHistory);
        answer = directResponse.answer;
        sources = directResponse.sources;
        requiresRetrieval = directResponse.requiresRetrieval;
      } else {
        logger.debug('Processing question with document retrieval');
        
        // Contextualize the query for better retrieval
        contextualizedQuery = await this.contextualizeQuery(question, chatHistory);
        
        // Get or create vector store
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

        // Retrieve relevant documents using contextualized query
        const retriever = vectorStore.asRetriever({
          searchType: 'similarity',
          searchKwargs: { k: config.vectorSearch.topK },
        });

        const relevantDocs = await retriever.getRelevantDocuments(contextualizedQuery);
        const context = relevantDocs.map(doc => doc.pageContent).join("\n---\n");

        // Create enhanced prompt with better context integration
        const prompt = ChatPromptTemplate.fromMessages([
            [
              "system",
              `You are Ace, an intelligent and friendly assistant who helps users interact with their uploaded PDF documents.

              Your job is to:
              - Accurately answer questions based on the *provided document context*.
              - Maintain conversational memory and recall user details from prior messages (e.g., names, preferences, topics discussed).
              - Be clear, concise, and personable in your responses.

              Guidelines:
              - Always prioritize answering using the current **document context**.
              - If the context is insufficient, respond honestly and encourage the user to rephrase or ask something else.
              - Reference specific parts of the document when useful (e.g., "On page 4...").
              - Use memory to personalize responses (e.g., "As you mentioned earlier, Prakhar...").
              - If the question is unrelated to the document or memory, politely explain that the answer isn't available.
              - Maintain a warm, professional tone — avoid sounding robotic.
              - Keep answers short but meaningful. Avoid unnecessary filler.
              - Continue the flow naturally, especially when follow-ups build on past exchanges.

              Context:
              {context}`
            ],
            new MessagesPlaceholder("chat_history"),
            ["human", "{question}"]
        ]);

        const messages = await prompt.formatMessages({
          context: context,
          chat_history: chatHistory,
          question: question
        });

        const response = await this.llm.invoke(messages);
        answer = response.content;
        
        sources = relevantDocs.map(doc => ({
          content: doc.pageContent,
          metadata: doc.metadata,
        })).slice(0, 3);
        
        requiresRetrieval = true;
      }

      // Save conversation to memory using the fixed method
      await this.saveToMemory(memory, question, answer);

      return {
        answer: answer,
        sources: sources,
        requiresRetrieval: requiresRetrieval,
        contextualizedQuery: contextualizedQuery !== question ? contextualizedQuery : null
      };

    } catch (error) {
      logger.error('Error processing question:', error);
      throw error;
    }
  }
  
  /**
   * Get conversation history for a session
   */
  async getConversationHistory(sessionId, limit = 10) {
    try {
      const memory = await this.getOrCreateMemory(sessionId);
      
      if (memory && memory.chatHistory && typeof memory.chatHistory.getMessages === 'function') {
        const messages = await memory.chatHistory.getMessages();
        return messages.slice(-limit * 2); // Get last N exchanges (question + answer pairs)
      }
      
      return [];
    } catch (error) {
      logger.error('Error retrieving conversation history:', error);
      return [];
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
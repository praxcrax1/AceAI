const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
const { BufferMemory } = require('langchain/memory');
const { MongoDBChatMessageHistory } = require('@langchain/mongodb');
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { createToolCallingAgent, AgentExecutor } = require("langchain/agents");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
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
        const memory = new BufferMemory({
          chatHistory: messageHistory,
          memoryKey: 'chat_history',
          returnMessages: true,
          inputKey: 'input',
          outputKey: 'output',
        });
        this.sessionMemory.set(sessionId, memory);
      }
      return this.sessionMemory.get(sessionId);
    } catch (error) {
      const fallbackMemory = new BufferMemory({
        memoryKey: 'chat_history',
        returnMessages: true,
        inputKey: 'input',
        outputKey: 'output',
      });
      this.sessionMemory.set(sessionId, fallbackMemory);
      return fallbackMemory;
    }
  }

  /**
   * Create the search_document tool for the agent
   */
  createSearchDocumentTool(vectorStore, similarityThreshold = 0.7) {
    return tool(
      async ({ query }, config) => {
        try {
          // Perform similarity search with scores
          const results = await vectorStore.similaritySearchWithScore(query, config.vectorSearch?.topK || 3);

          // Always return all results with their scores for the agent to evaluate
          const allResults = results.map(([doc, score]) => ({
            content: doc.pageContent,
            metadata: doc.metadata,
            similarity_score: score
          }));

          // Check if we have any results
          if (!results || results.length === 0) {
            return JSON.stringify({
              status: "no_results",
              message: "No content found in the document for this query",
              results: [],
              max_similarity: 0,
              threshold: similarityThreshold
            });
          }

          const maxScore = Math.max(...results.map(([doc, score]) => score));
          const relevantResults = results.filter(([doc, score]) => score >= similarityThreshold);

          return JSON.stringify({
            status: relevantResults.length > 0 ? "found" : "low_similarity",
            message: relevantResults.length > 0
              ? `Found ${relevantResults.length} relevant results`
              : `Found ${results.length} results but similarity scores below threshold`,
            results: allResults,
            max_similarity: maxScore,
            threshold: similarityThreshold,
            relevant_count: relevantResults.length,
            total_count: results.length
          });

        } catch (error) {
          logger.error('Error in search_document tool:', error);
          return JSON.stringify({
            status: "error",
            message: "Error occurred while searching the document",
            error: error.message,
            results: []
          });
        }
      },
      {
        name: "search_document",
        description: `ALWAYS use this tool first for every user question. Search the uploaded document for relevant information.
        This tool will return all search results with similarity scores. You must always call this tool before answering any question.
        After getting the results, provide a complete answer using both document content (if relevant) and your knowledge.`,
        schema: z.object({
          query: z.string().describe("The user's question or search query"),
        }),
      }
    );
  }

  /**
   * Create the agent with search_document tool
   */
  async createAgent(vectorStore) {
    const searchTool = this.createSearchDocumentTool(vectorStore);
    const tools = [searchTool];

    // Create a prompt that enforces tool usage and comprehensive responses
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a helpful AI assistant that answers questions by searching through uploaded documents.

        IMPORTANT INSTRUCTIONS:
        1. ALWAYS start by using the search_document tool for every user question - no exceptions
        2. After searching, provide a complete and helpful answer that combines:
          - Relevant information from the document (if similarity scores are good)
          - Your general knowledge to provide context and completeness
          - Clear indication of what information comes from where

        Response Guidelines:
        - If search finds relevant content (good similarity scores): Use it as the primary source and supplement with your knowledge
        - If search finds low similarity content: Acknowledge what was found but rely more on your general knowledge
        - If search finds no results: Use your general knowledge while noting the document doesn't contain this information
        - Always aim to be maximally helpful regardless of search results

        Be conversational, comprehensive, and transparent about your sources.`],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // Create the agent
    const agent = await createToolCallingAgent({
      llm: this.llm,
      tools,
      prompt,
    });

    // Create agent executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true, // Enable for debugging
      returnIntermediateSteps: true, // Return reasoning steps
    });

    return agentExecutor;
  }

  /**
   * Process question using the agentic approach
   */
  async processQuestion(question, sessionId, fileId) {
    const userId = sessionId.split(':')[0];
    const pineconeNamespace = `${userId}:${fileId}`;

    try {
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

      // Get or create agent executor for this namespace
      let agentExecutor = cache.get(`agent:${pineconeNamespace}`);
      if (!agentExecutor) {
        agentExecutor = await this.createAgent(vectorStore);
        cache.set(`agent:${pineconeNamespace}`, agentExecutor, 900);
      }

      // Get memory for this session
      const memory = await this.getOrCreateMemory(sessionId);

      // Get chat history
      let chatHistory = [];
      if (memory && typeof memory.chatHistory?.getMessages === 'function') {
        chatHistory = await memory.chatHistory.getMessages();
      }

      // Execute agent with input and chat history
      const result = await agentExecutor.invoke({
        input: question,
        chat_history: chatHistory,
      });

      // Save conversation to memory
      if (memory && typeof memory.saveContext === 'function') {
        await memory.saveContext(
          { input: question },
          { output: result.output }
        );
      }

      // Extract sources from intermediate steps if available
      let sources = [];
      if (result.intermediateSteps) {
        for (const step of result.intermediateSteps) {
          if (step.observation) {
            try {
              const parsed = JSON.parse(step.observation);
              if (parsed.results && Array.isArray(parsed.results)) {
                sources = parsed.results.map(item => ({
                  content: item.content,
                  metadata: item.metadata,
                  similarity_score: item.similarity_score
                }));
              }
            } catch (e) {
              // If parsing fails, it's not from our search tool
            }
          }
        }
      }

      return {
        answer: result.output,
        sources: sources.slice(0, 3), // Limit to top 3 sources
        reasoning: result.intermediateSteps || [], // Include agent's reasoning steps
      };

    } catch (error) {
      logger.error('Error in processQuestion:', error);
      throw error;
    }
  }

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

}

module.exports = new ChatService();
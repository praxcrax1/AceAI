const path = require('path');

module.exports = {
  // Application configuration
  app: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    uploadDir: path.join(__dirname, '../uploads'),
  },
  
  // LLM configuration
  llm: {
    modelName: 'gemini-2.5-flash',
    maxOutputTokens: 4096,
    temperature: 0.5,
  },
  
  // Embeddings configuration
  embeddings: {
    modelName: 'text-embedding-004',
  },
  
  // Text splitting configuration
  textSplitter: {
    chunkSize: 1000,
    chunkOverlap: 200,
  },
  
  // Vector search configuration
  vectorSearch: {
    topK: 1,
  },
  
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'aceai',
    chatCollection: process.env.MONGODB_CHAT_COLLECTION || 'chat_memory',
  },
};

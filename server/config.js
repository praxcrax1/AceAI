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
    modelName: 'gemini-2.0-flash',
    maxOutputTokens: 2048,
    temperature: 0.3,
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
    topK: 5,
  },
};

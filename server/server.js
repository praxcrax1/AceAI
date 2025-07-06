#!/usr/bin/env node

/**
 * This is the entry point for the AceAI RAG application.
 * It loads environment variables first before importing the main application.
 */
// Configure dotenv to suppress promotional messages
process.env.DOTENV_DISABLE_LOG = true;
require('dotenv').config({ override: true });

// Check required environment variables
const requiredEnvVars = [
  'GOOGLE_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_ENVIRONMENT',
  'PINECONE_INDEX_NAME'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`- ${varName}`);
  });
  console.error('Please check your .env file');
  process.exit(1);
}

// Log successful env loading
console.log('Environment variables loaded successfully:');
console.log(`- GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? 'is set' : 'is NOT set'}`);
console.log(`- PINECONE_API_KEY: ${process.env.PINECONE_API_KEY ? 'is set' : 'is NOT set'}`);
console.log(`- PINECONE_ENVIRONMENT: ${process.env.PINECONE_ENVIRONMENT ? 'is set' : 'is NOT set'}`);
console.log(`- PINECONE_INDEX_NAME: ${process.env.PINECONE_INDEX_NAME ? 'is set' : 'is NOT set'}`);

// Start the server
require('./index');

#!/usr/bin/env node
// filepath: /home/prakhar/Repos/AceAI/server/scripts/test-mongo-integration.js

/**
 * Test script for MongoDB chat history integration
 * 
 * This script tests the MongoDB connection and chat history functionality
 * Run with: node scripts/test-mongo-integration.js
 */

// Load environment variables
require('dotenv').config();
const { MongoDBChatMessageHistory } = require('@langchain/mongodb');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const { MongoClient } = require('mongodb');
const config = require('../config');

// Test parameters
const testSessionId = `test-session-${Date.now()}`;
const testMessages = [
  new HumanMessage("Hello, I have a question about quantum computing."),
  new AIMessage("Sure, I'd be happy to help with your quantum computing question. What would you like to know?"),
  new HumanMessage("How do quantum qubits differ from classical bits?"),
  new AIMessage("Quantum qubits differ from classical bits in several fundamental ways:\n\n1. **Superposition**: While classical bits can only be in one state (0 or 1) at a time, qubits can exist in a superposition of both states simultaneously.\n\n2. **Entanglement**: Qubits can be entangled, meaning the state of one qubit is dependent on the state of another, regardless of distance.\n\n3. **Measurement**: When you measure a classical bit, it doesn't change its state. When you measure a qubit, it collapses from superposition to either 0 or 1.")
];

async function runTest() {
  let client;
  try {
    console.log('Testing MongoDB Chat History Integration');
    console.log('---------------------------------------');
    
    // Step 1: Test direct MongoDB connection
    console.log('Step 1: Testing direct MongoDB connection...');
    client = new MongoClient(config.mongodb.uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    await client.connect();
    const db = client.db(config.mongodb.dbName);
    await db.command({ ping: 1 });
    console.log('✅ MongoDB direct connection successful');
    
    // Step 2: Test collection access
    console.log(`Step 2: Testing collection access to '${config.mongodb.chatCollection}'...`);
    const collection = db.collection(config.mongodb.chatCollection);
    await collection.findOne({ _id: 'test' }); // Just testing access, not expecting results
    console.log('✅ Collection access successful');
    
    // Step 3: Test LangChain MongoDB chat history
    console.log('Step 3: Testing LangChain MongoDB chat history...');
    
    // Pass the actual collection object, not just the name
    const chatHistory = new MongoDBChatMessageHistory({
      collection,
      sessionId: testSessionId,
    });

    // Add messages
    console.log('Adding test messages...');
    for (const message of testMessages) {
      await chatHistory.addMessage(message);
    }
    console.log('✅ Added test messages successfully');
    
    // Get messages
    console.log('Retrieving messages...');
    const retrievedMessages = await chatHistory.getMessages();
    console.log(`✅ Retrieved ${retrievedMessages.length} messages`);
    
    // Validate message content
    const lastOriginal = testMessages[testMessages.length - 1].content;
    const lastRetrieved = retrievedMessages[retrievedMessages.length - 1].content;
    
    console.log('Validating message content...');
    if (lastOriginal === lastRetrieved) {
      console.log('✅ Message content validation successful');
    } else {
      console.error('❌ Message content mismatch');
      console.log('Original:', lastOriginal.substring(0, 50) + '...');
      console.log('Retrieved:', lastRetrieved.substring(0, 50) + '...');
    }
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await collection.deleteMany({ sessionId: testSessionId });
    console.log('✅ Test cleanup successful');
    
    console.log('\n✅ All MongoDB integration tests passed!');
    console.log('You can now use MongoDB for chat history persistence.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
runTest().catch(console.error);

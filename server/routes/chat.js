const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { chatLimiter } = require('../utils/rateLimiter');
const { authMiddleware } = require('../services/userService');

// Route for handling chat messages
router.post('/chat', chatLimiter, authMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const { question, fileId } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    if (!fileId) {
      return res.status(400).json({ error: 'FileId is required' });
    }

    // Use userId in session and Pinecone namespace
    const chatSessionId = `${userId}:${fileId}`;
    
    logger.info(`Processing question for session ${chatSessionId} on document ${fileId}: "${question.substring(0, 100)}${question.length > 100 ? '...' : ''}"`);

    // Check cache for identical question in same session/document
    const cacheKey = `chat:${userId}:${fileId}:${chatSessionId}:${question}`;
    const cachedResponse = cache.get(cacheKey);
    
    let response;
    if (cachedResponse) {
      logger.info(`Cache hit for question in session ${chatSessionId}`);
      response = cachedResponse;
    } else {
      // Process the question
      response = await chatService.processQuestion(question, chatSessionId, fileId);
      
      // Cache the response (for 10 minutes)
      cache.set(cacheKey, response, 600);
    }
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    // Return the answer and new session ID
    res.json({
      answer: response.answer,
      sources: response.sources,
      sessionId: chatSessionId,
      processingTime: `${processingTime.toFixed(2)} seconds`,
      cached: !!cachedResponse
    });
    
    logger.info(`Question answered in ${processingTime.toFixed(2)}s for session ${chatSessionId}`);
  } catch (error) {
    logger.error('Error in chat route:', error);
    res.status(500).json({
      error: 'Failed to process question',
      details: error.message
    });
  }
});

// Route for fetching chat history for a session
router.get('/chat/history', authMiddleware, async (req, res) => {
  try {
    const { sessionId, limit } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    // Default limit to 20 messages (10 exchanges)
    const messageLimit = limit ? parseInt(limit) : 20;
    const messages = await chatService.getConversationHistory(sessionId, messageLimit / 2);
    res.json({ sessionId, messages });
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history', details: error.message });
  }
});

module.exports = router;

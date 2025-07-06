const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { chatLimiter } = require('../utils/rateLimiter');

// Route for handling chat messages
router.post('/chat', chatLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const { question, sessionId, fileId } = req.body;

    // Validate required fields
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    if (!fileId) {
      return res.status(400).json({ error: 'FileId is required' });
    }

    // If no sessionId is provided, create a new one
    const chatSessionId = sessionId || uuidv4();
    
    logger.info(`Processing question for session ${chatSessionId} on document ${fileId}: "${question.substring(0, 100)}${question.length > 100 ? '...' : ''}"`);

    // Check cache for identical question in same session/document
    const cacheKey = `chat:${fileId}:${chatSessionId}:${question}`;
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

// Route for clearing chat history
router.delete('/chat/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }
    
    logger.info(`Clearing chat history for session ${sessionId}`);
    
    const result = await chatService.clearChatHistory(sessionId);
    
    if (result) {
      // Clear any cached responses for this session
      const cachePattern = `chat:*:${sessionId}:*`;
      cache.clearPattern(cachePattern);
      
      res.json({
        success: true,
        message: `Chat history for session ${sessionId} cleared successfully`
      });
    } else {
      res.status(500).json({
        error: 'Failed to clear chat history'
      });
    }
  } catch (error) {
    logger.error('Error in clear chat history route:', error);
    res.status(500).json({
      error: 'Failed to clear chat history',
      details: error.message
    });
  }
});

// Route for clearing chat history
router.delete('/chat/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }
    
    logger.info(`Request to clear chat history for session: ${sessionId}`);
    
    // Clear the chat history
    const success = await chatService.clearChatHistory(sessionId);
    
    // Also clear any cached chat responses for this session
    const cachePattern = `chat:*:${sessionId}:*`;
    const clearedCount = cache.clearPattern(cachePattern);
    
    if (success) {
      logger.info(`Chat history cleared for session: ${sessionId}, removed ${clearedCount} cached responses`);
      return res.json({ 
        success: true, 
        message: `Chat history for session ${sessionId} cleared successfully`,
        clearedCacheEntries: clearedCount
      });
    } else {
      logger.warn(`Failed to clear chat history for session: ${sessionId}`);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to clear chat history' 
      });
    }
  } catch (error) {
    logger.error('Error clearing chat history:', error);
    res.status(500).json({
      error: 'Failed to clear chat history',
      details: error.message
    });
  }
});

module.exports = router;

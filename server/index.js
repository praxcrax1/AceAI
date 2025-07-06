const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const http = require('http');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const documentsRoutes = require('./routes/documents');
const logger = require('./utils/logger');
const config = require('./config');
const setupGracefulShutdown = require('./utils/gracefulShutdown');
const { globalLimiter } = require('./utils/rateLimiter');
const { errorHandler } = require('./utils/errorHandler');

// Environment variables already loaded by server.js

// Log env variables to debug (redacted for security)
logger.info(`Environment loaded: NODE_ENV=${process.env.NODE_ENV || 'development'}`);
logger.debug(`GOOGLE_API_KEY=${process.env.GOOGLE_API_KEY ? '***' + process.env.GOOGLE_API_KEY.slice(-4) : 'not set'}`);
logger.debug(`PINECONE_API_KEY=${process.env.PINECONE_API_KEY ? '***' + process.env.PINECONE_API_KEY.slice(-4) : 'not set'}`);
logger.debug(`PINECONE_ENVIRONMENT=${process.env.PINECONE_ENVIRONMENT || 'not set'}`);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure directories exist
if (!fs.existsSync(config.app.uploadDir)) {
  fs.mkdirSync(config.app.uploadDir, { recursive: true });
  logger.info(`Created uploads directory: ${config.app.uploadDir}`);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));
app.use(globalLimiter); // Apply global rate limiting

// Serve static files from the public directory
app.use(express.static('public'));

// Routes
app.use('/api', uploadRoutes);
app.use('/api', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentsRoutes);

// Simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AceAI RAG API is running' });
});

// Serve the HTML interface
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Custom 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Error logging middleware
app.use((err, req, res, next) => {
  logger.error('Application error:', err);
  next(err);
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Setup graceful shutdown
setupGracefulShutdown(server, {
  timeout: 30000,
  onShutdown: async () => {
    logger.info('Performing cleanup before shutdown');
    // Additional cleanup logic can go here
    return Promise.resolve();
  }
});

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Web interface: http://localhost:${PORT}/`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`System info: http://localhost:${PORT}/api/admin/system`);
});

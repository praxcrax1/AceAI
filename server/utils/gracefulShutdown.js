/**
 * Graceful shutdown handler for Node.js server
 * 
 * This module sets up handlers for various termination signals
 * and allows the server to gracefully close connections before exiting.
 */

const logger = require('./logger');

/**
 * Setup graceful shutdown for an Express server
 * @param {Object} server - HTTP server instance
 * @param {Object} options - Shutdown options
 */
function setupGracefulShutdown(server, options = {}) {
  const {
    timeout = 10000, // Default timeout: 10 seconds
    signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'], // Signals to handle
    onShutdown = async () => {} // Additional cleanup function
  } = options;

  let shuttingDown = false;

  // Function to initiate the shutdown process
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    
    shuttingDown = true;
    logger.info(`${signal} received. Starting graceful shutdown...`);

    // Set a timeout to force exit if graceful shutdown takes too long
    const forceExit = setTimeout(() => {
      logger.error(`Graceful shutdown timed out after ${timeout}ms. Forcing exit.`);
      process.exit(1);
    }, timeout);
    
    // Clear the timeout if we exit normally
    forceExit.unref();

    try {
      // Execute any provided shutdown hooks
      await onShutdown();
      
      // Close the server
      server.close(() => {
        logger.info('HTTP server closed successfully');
        process.exit(0);
      });
      
      // If there are no active connections, server.close() may never call its callback
      setTimeout(() => {
        logger.info('No active connections, exiting now');
        process.exit(0);
      }, 1000).unref();
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  // Set up signal handlers
  signals.forEach(signal => {
    process.on(signal, () => shutdown(signal));
  });

  // Handle uncaught exceptions and unhandled promise rejections
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection:', reason);
    shutdown('unhandledRejection');
  });

  logger.info('Graceful shutdown handler configured');
}

module.exports = setupGracefulShutdown;

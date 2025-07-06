/**
 * Custom error class for application errors
 * Provides standardized error format with status codes
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} details - Additional error details
   */
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Flag to identify operational vs programming errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create an error response object
 * @param {Error} err - Error object
 * @returns {Object} Formatted error object
 */
const formatError = (err) => {
  // Format AppError instances
  if (err instanceof AppError) {
    return {
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      ...(Object.keys(err.details).length > 0 && { details: err.details })
    };
  }
  
  // Handle standard errors
  return {
    status: 'error',
    statusCode: 500,
    message: err.message || 'Internal Server Error'
  };
};

/**
 * Global error handler middleware for Express
 */
const errorHandler = (err, req, res, next) => {
  const formattedError = formatError(err);
  res.status(formattedError.statusCode).json(formattedError);
};

/**
 * Async error handler to avoid try/catch blocks
 * @param {Function} fn - Async function to handle
 * @returns {Function} Middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  formatError,
  errorHandler,
  catchAsync
};

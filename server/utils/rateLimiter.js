const rateLimit = require('express-rate-limit');
const logger = require('./logger');

/**
 * Create rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(options.statusCode).json({
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000 / 60) // in minutes
      });
    },
    keyGenerator: (req) => {
      return req.ip; // Use IP address as default key
    },
  };

  const limiterOptions = { ...defaultOptions, ...options };
  
  return rateLimit(limiterOptions);
};

/**
 * Global API rate limiter (applies to all routes)
 */
const globalLimiter = createRateLimiter();

/**
 * Stricter rate limiter for upload endpoint
 */
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // 10 uploads per hour
  message: 'Too many file uploads, please try again later.'
});

/**
 * Rate limiter for chat endpoint
 */
const chatLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
});

module.exports = {
  globalLimiter,
  uploadLimiter,
  chatLimiter
};

const NodeCache = require('node-cache');
const logger = require('./logger');

// Create a cache instance with standard TTL of 30 minutes and check period of 10 minutes
const cache = new NodeCache({ stdTTL: 1800, checkperiod: 600 });

/**
 * Wrapper for get/set operations with logging
 */
module.exports = {
  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined if not found
   */
  get: (key) => {
    const value = cache.get(key);
    if (value) {
      logger.debug(`Cache hit for key: ${key}`);
    } else {
      logger.debug(`Cache miss for key: ${key}`);
    }
    return value;
  },

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds (optional)
   * @returns {boolean} True if successful
   */
  set: (key, value, ttl = undefined) => {
    const result = cache.set(key, value, ttl);
    logger.debug(`Cache set for key: ${key}${ttl ? ` with TTL ${ttl}s` : ''}`);
    return result;
  },

  /**
   * Remove a value from cache
   * @param {string} key - Cache key
   * @returns {number} Number of deleted entries
   */
  del: (key) => {
    const result = cache.del(key);
    logger.debug(`Cache delete for key: ${key}, deleted: ${result}`);
    return result;
  },

  /**
   * Flush all cache entries
   * @returns {void}
   */
  flush: () => {
    cache.flushAll();
    logger.info('Cache flushed');
  },

  /**
   * Get cache statistics
   * @returns {Object} Statistics object
   */
  stats: () => {
    return cache.getStats();
  },
  
  /**
   * Clear cache entries based on a pattern
   * @param {string} pattern - Pattern to match keys (using simple wildcard matching with *)
   * @returns {number} Number of deleted entries
   */
  clearPattern: (pattern) => {
    // Get all keys
    const keys = cache.keys();
    
    // Convert pattern to regex by escaping special chars and converting * to .*
    const regexPattern = new RegExp('^' + 
      pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
             .replace(/\*/g, '.*') + 
      '$');
    
    // Filter keys matching the pattern
    const matchingKeys = keys.filter(key => regexPattern.test(key));
    
    // Delete matching keys
    const count = matchingKeys.length > 0 ? cache.del(matchingKeys) : 0;
    
    logger.debug(`Cache clear pattern: ${pattern}, deleted: ${count} entries`);
    return count;
  }
};

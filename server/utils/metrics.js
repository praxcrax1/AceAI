/**
 * Simple in-memory metrics collection for the AceAI application
 */
const os = require('os');

class Metrics {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        failed: 0,
        byEndpoint: {}
      },
      uploads: {
        total: 0,
        success: 0,
        failed: 0,
        totalSize: 0,
        processingTimes: []
      },
      chat: {
        total: 0,
        cached: 0,
        totalResponseTime: 0
      },
      errors: []
    };
  }

  /**
   * Record an API request
   * @param {string} endpoint - API endpoint
   * @param {boolean} success - Whether request was successful
   */
  recordRequest(endpoint, success = true) {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.failed++;
    }
    
    // Track by endpoint
    if (!this.metrics.requests.byEndpoint[endpoint]) {
      this.metrics.requests.byEndpoint[endpoint] = { total: 0, success: 0, failed: 0 };
    }
    
    this.metrics.requests.byEndpoint[endpoint].total++;
    if (success) {
      this.metrics.requests.byEndpoint[endpoint].success++;
    } else {
      this.metrics.requests.byEndpoint[endpoint].failed++;
    }
  }

  /**
   * Record a file upload
   * @param {boolean} success - Whether upload was successful
   * @param {number} fileSize - Size of uploaded file in bytes
   * @param {number} processingTime - Processing time in ms
   */
  recordUpload(success, fileSize, processingTime) {
    this.metrics.uploads.total++;
    
    if (success) {
      this.metrics.uploads.success++;
      this.metrics.uploads.totalSize += fileSize;
      this.metrics.uploads.processingTimes.push(processingTime);
    } else {
      this.metrics.uploads.failed++;
    }
  }

  /**
   * Record a chat interaction
   * @param {boolean} cached - Whether response was served from cache
   * @param {number} responseTime - Response time in ms
   */
  recordChat(cached, responseTime) {
    this.metrics.chat.total++;
    
    if (cached) {
      this.metrics.chat.cached++;
    }
    
    this.metrics.chat.totalResponseTime += responseTime;
  }

  /**
   * Record an error
   * @param {string} type - Error type
   * @param {string} message - Error message
   */
  recordError(type, message) {
    // Keep only the most recent 50 errors
    if (this.metrics.errors.length >= 50) {
      this.metrics.errors.shift();
    }
    
    this.metrics.errors.push({
      timestamp: new Date().toISOString(),
      type,
      message
    });
  }

  /**
   * Get application metrics
   * @param {boolean} detailed - Whether to include detailed metrics
   * @returns {Object} Collected metrics
   */
  getMetrics(detailed = false) {
    const system = {
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: process.memoryUsage(),
      cpu: {
        loadAvg: os.loadavg(),
        cpus: os.cpus().length
      }
    };
    
    // Calculate averages
    const avgProcessingTime = this.metrics.uploads.processingTimes.length > 0
      ? this.metrics.uploads.processingTimes.reduce((a, b) => a + b, 0) / this.metrics.uploads.processingTimes.length
      : 0;
    
    const avgResponseTime = this.metrics.chat.total > 0
      ? this.metrics.chat.totalResponseTime / this.metrics.chat.total
      : 0;
    
    // Basic metrics
    const basicMetrics = {
      system,
      summary: {
        uptime: system.uptime,
        totalRequests: this.metrics.requests.total,
        successRate: this.metrics.requests.total > 0
          ? (this.metrics.requests.success / this.metrics.requests.total * 100).toFixed(2) + '%'
          : '0%',
        uploads: this.metrics.uploads.total,
        chats: this.metrics.chat.total,
        cacheHitRate: this.metrics.chat.total > 0
          ? (this.metrics.chat.cached / this.metrics.chat.total * 100).toFixed(2) + '%'
          : '0%',
        avgProcessingTime: avgProcessingTime.toFixed(2) + 'ms',
        avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
        recentErrors: this.metrics.errors.slice(-5)
      }
    };
    
    // Return detailed or basic metrics
    if (detailed) {
      return {
        ...basicMetrics,
        detailed: this.metrics
      };
    }
    
    return basicMetrics;
  }

  /**
   * Reset all metrics
   */
  resetMetrics() {
    this.startTime = Date.now();
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        failed: 0,
        byEndpoint: {}
      },
      uploads: {
        total: 0,
        success: 0,
        failed: 0,
        totalSize: 0,
        processingTimes: []
      },
      chat: {
        total: 0,
        cached: 0,
        totalResponseTime: 0
      },
      errors: []
    };
  }
}

// Create and export a singleton instance
module.exports = new Metrics();

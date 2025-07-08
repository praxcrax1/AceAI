const os = require('os');
const cache = require('../utils/cache');
const metrics = require('../utils/metrics');
const logger = require('../utils/logger');
const { Pinecone } = require('@pinecone-database/pinecone');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

// Service for admin/health/system/cache/metrics logic
// ...to be implemented: logic will be moved from routes/admin.js

exports.healthCheck = async (req, res) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memoryUsage: process.memoryUsage(),
      cpuLoad: os.loadavg(),
      services: { pinecone: 'unknown', googleai: 'unknown' }
    };
    try {
      const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
      pinecone.index(process.env.PINECONE_INDEX_NAME);
      healthData.services.pinecone = 'ok';
    } catch (error) {
      healthData.services.pinecone = 'error';
      healthData.pineconeError = error.message;
    }
    try {
      const llm = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        modelName: 'gemini-2.5-flash',
      });
      const response = await llm.invoke('Hello, are you working?');
      healthData.services.googleai = response ? 'ok' : 'error';
    } catch (error) {
      healthData.services.googleai = 'error';
      healthData.googleaiError = error.message;
    }
    healthData.cache = cache.stats();
    res.json(healthData);
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};

exports.systemStatus = async (req, res) => {
  try {
    const systemInfo = {
      platform: {
        type: os.type(),
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        uptime: os.uptime(),
        loadavg: os.loadavg(),
        totalmem: os.totalmem(),
        freemem: os.freemem(),
        cpus: os.cpus().length
      },
      process: {
        versions: process.versions,
        env: { NODE_ENV: process.env.NODE_ENV },
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      cache: cache.stats()
    };
    res.json(systemInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearCache = (req, res) => {
  try {
    cache.flush();
    logger.info('Cache cleared via admin endpoint');
    res.json({ status: 'ok', message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMetrics = (req, res) => {
  const detailed = req.query.detailed === 'true';
  res.json(metrics.getMetrics(detailed));
};

exports.resetMetrics = (req, res) => {
  metrics.resetMetrics();
  logger.info('Metrics reset via admin endpoint');
  res.json({ status: 'ok', message: 'Metrics reset successfully' });
};

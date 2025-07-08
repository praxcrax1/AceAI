const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');

// Basic health check
router.get('/health', adminService.healthCheck);

// Detailed system status (admin only)
router.get('/system', adminService.systemStatus);

// Cache management (admin only)
router.post('/cache/clear', adminService.clearCache);

// Metrics endpoints
router.get('/metrics', adminService.getMetrics);
router.post('/metrics/reset', adminService.resetMetrics);

module.exports = router;

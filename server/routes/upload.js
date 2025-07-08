const express = require('express');
const router = express.Router();
const { uploadLimiter } = require('../utils/rateLimiter');
const { authMiddleware } = require('../services/userService');
const uploadService = require('../services/uploadService');

// Route for uploading PDF (use memoryStorage from uploadService)
router.post('/upload', uploadLimiter, authMiddleware, uploadService.upload.single('pdf'), uploadService.handleUpload);

module.exports = router;

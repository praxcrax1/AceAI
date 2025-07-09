// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadLimiter } = require('../utils/rateLimiter');
const { authMiddleware } = require('../services/userService');
const uploadService = require('../services/uploadService');

// Local file upload (PDF)
router.post(
  '/upload/file',
  uploadLimiter,
  authMiddleware,
  uploadService.upload.single('pdf'),
  uploadService.handleFileUpload
);

// Link-based upload (PDF URL)
router.post(
  '/upload/link',
  uploadLimiter,
  authMiddleware,
  uploadService.handleLinkUpload
);

module.exports = router;

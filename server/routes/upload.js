const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdfProcessor = require('../services/pdfProcessor');
const logger = require('../utils/logger');
const config = require('../config');
const metrics = require('../utils/metrics');
const documentStore = require('../utils/documentStore');
const { uploadLimiter } = require('../utils/rateLimiter');
const { catchAsync, AppError } = require('../utils/errorHandler');
const fs = require('fs');
const uploadService = require('../services/uploadService');
const upload = uploadService.upload;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileId = uuidv4();
    req.fileId = fileId; // Store fileId in request object
    cb(null, fileId + path.extname(file.originalname));
  }
});

// File filter to only accept PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const uploadMiddleware = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  }
});

// Route for uploading PDF
router.post('/upload', uploadLimiter, upload.single('pdf'), uploadService.handleUpload);

module.exports = router;

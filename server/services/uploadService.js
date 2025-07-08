const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdfProcessor = require('./pdfProcessor');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');
const documentStore = require('../utils/documentStore');
const fs = require('fs');

// Multer config (to be used in route)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileId = uuidv4();
    req.fileId = fileId;
    cb(null, fileId + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};
exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

exports.handleUpload = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }
    const filePath = req.file.path;
    const fileId = req.fileId;
    const originalFilename = req.file.originalname;
    logger.info(`Processing uploaded PDF: ${originalFilename} (${fileId})`);
    const result = await pdfProcessor.processPDF(filePath, fileId);
    const processingTime = (Date.now() - startTime) / 1000;
    const fileSize = req.file.size;
    const docMetadata = {
      id: fileId,
      filename: originalFilename,
      title: path.parse(originalFilename).name,
      filePath: filePath,
      chunkCount: result.chunksCount,
      pageCount: result.pageCount || 0,
      size: fileSize,
      processingTime: processingTime
    };
    documentStore.addDocument(docMetadata);
    metrics.recordUpload(true, fileSize, processingTime * 1000);
    res.json({
      success: true,
      message: 'PDF processed successfully',
      fileId: fileId,
      filename: originalFilename,
      chunksCount: result.chunksCount,
      processingTime: `${processingTime.toFixed(2)} seconds`
    });
    logger.info(`PDF processing completed in ${processingTime.toFixed(2)}s: ${originalFilename} (${fileId}) - ${result.chunksCount} chunks`);
  } catch (error) {
    logger.error('Error in upload route:', error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        logger.info(`Cleaned up file after error: ${req.file.path}`);
      } catch (unlinkError) {
        logger.error('Error cleaning up file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to process PDF', details: error.message });
  }
};

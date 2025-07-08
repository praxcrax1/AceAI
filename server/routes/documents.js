const express = require('express');
const router = express.Router();
const documentService = require('../services/documentService');
const { catchAsync } = require('../utils/errorHandler');
const { authMiddleware } = require('../services/userService');

// Get all documents
router.get('/', authMiddleware, catchAsync(documentService.getAllDocuments));

// Get document by ID
router.get('/:id', authMiddleware, catchAsync(documentService.getDocumentById));

// Delete document by ID
router.delete('/:id', authMiddleware, catchAsync(documentService.deleteDocumentById));

// Update document metadata
router.patch('/:id', authMiddleware, catchAsync(documentService.updateDocumentMetadata));

module.exports = router;

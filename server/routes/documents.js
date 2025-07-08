const express = require('express');
const router = express.Router();
const documentService = require('../services/documentService');
const { catchAsync } = require('../utils/errorHandler');

// Get all documents
router.get('/', catchAsync(documentService.getAllDocuments));

// Get document by ID
router.get('/:id', catchAsync(documentService.getDocumentById));

// Delete document by ID
router.delete('/:id', catchAsync(documentService.deleteDocumentById));

// Update document metadata
router.patch('/:id', catchAsync(documentService.updateDocumentMetadata));

module.exports = router;

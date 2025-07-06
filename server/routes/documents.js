const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const logger = require('../utils/logger');
const documentStore = require('../utils/documentStore');
const metrics = require('../utils/metrics');
const { AppError, catchAsync } = require('../utils/errorHandler');

// Get all documents
router.get('/', catchAsync(async (req, res) => {
  const documents = documentStore.getAllDocuments();
  
  metrics.recordRequest('/api/documents', true);
  res.json({
    count: documents.length,
    documents: documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      title: doc.title || doc.filename,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      pageCount: doc.pageCount,
      chunkCount: doc.chunkCount,
      size: doc.size
    }))
  });
}));

// Get document by ID
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const document = documentStore.getDocument(id);
  
  if (!document) {
    metrics.recordRequest('/api/documents/:id', false);
    throw new AppError(`Document not found with ID: ${id}`, 404);
  }
  
  metrics.recordRequest('/api/documents/:id', true);
  res.json(document);
}));

// Delete document by ID
router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const document = documentStore.getDocument(id);
  
  if (!document) {
    metrics.recordRequest('/api/documents/:id/delete', false);
    throw new AppError(`Document not found with ID: ${id}`, 404);
  }
  
  try {
    // Delete from Pinecone using v6 API
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    
    // Delete the namespace
    await index.namespace(id).deleteAll();
    
    // Delete from document store
    documentStore.deleteDocument(id);
    
    // Remove the PDF file if it still exists
    const filePath = document.filePath;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted file: ${filePath}`);
    }
    
    metrics.recordRequest('/api/documents/:id/delete', true);
    res.json({ 
      success: true, 
      message: `Document ${id} deleted successfully` 
    });
  } catch (error) {
    logger.error(`Error deleting document ${id}:`, error);
    metrics.recordRequest('/api/documents/:id/delete', false);
    throw new AppError(`Failed to delete document: ${error.message}`, 500);
  }
}));

// Update document metadata
router.patch('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Get existing document
  const document = documentStore.getDocument(id);
  
  if (!document) {
    metrics.recordRequest('/api/documents/:id/update', false);
    throw new AppError(`Document not found with ID: ${id}`, 404);
  }
  
  // Allowed fields to update
  const allowedUpdates = ['title', 'description', 'tags'];
  
  // Filter out updates that aren't allowed
  const validUpdates = Object.keys(updates)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});
  
  // Update the document
  const updatedDoc = documentStore.addDocument({
    ...document,
    ...validUpdates
  });
  
  metrics.recordRequest('/api/documents/:id/update', true);
  res.json(updatedDoc);
}));

module.exports = router;

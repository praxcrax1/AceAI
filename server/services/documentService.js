const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const logger = require('../utils/logger');
const documentStore = require('../utils/documentStore');
const metrics = require('../utils/metrics');
const { AppError } = require('../utils/errorHandler');

// Service for document management (list, get, delete, update)
// ...to be implemented: logic will be moved from routes/documents.js

exports.getAllDocuments = async (req, res) => {
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
};

exports.getDocumentById = async (req, res) => {
  const { id } = req.params;
  const document = documentStore.getDocument(id);
  if (!document) {
    metrics.recordRequest('/api/documents/:id', false);
    throw new AppError(`Document not found with ID: ${id}`, 404);
  }
  metrics.recordRequest('/api/documents/:id', true);
  res.json(document);
};

exports.deleteDocumentById = async (req, res) => {
  const { id } = req.params;
  const document = documentStore.getDocument(id);
  if (!document) {
    metrics.recordRequest('/api/documents/:id/delete', false);
    throw new AppError(`Document not found with ID: ${id}`, 404);
  }
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    await index.namespace(id).deleteAll();
    documentStore.deleteDocument(id);
    const filePath = document.filePath;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted file: ${filePath}`);
    }
    metrics.recordRequest('/api/documents/:id/delete', true);
    res.json({ success: true, message: `Document ${id} deleted successfully` });
  } catch (error) {
    logger.error(`Error deleting document ${id}:`, error);
    metrics.recordRequest('/api/documents/:id/delete', false);
    throw new AppError(`Failed to delete document: ${error.message}`, 500);
  }
};

exports.updateDocumentMetadata = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const document = documentStore.getDocument(id);
  if (!document) {
    metrics.recordRequest('/api/documents/:id/update', false);
    throw new AppError(`Document not found with ID: ${id}`, 404);
  }
  const allowedUpdates = ['title', 'description', 'tags'];
  const validUpdates = Object.keys(updates)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});
  const updatedDoc = documentStore.addDocument({ ...document, ...validUpdates });
  metrics.recordRequest('/api/documents/:id/update', true);
  res.json(updatedDoc);
};

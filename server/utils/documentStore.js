/**
 * Document metadata storage utility
 * 
 * Stores and retrieves document metadata in a simple in-memory database
 * In a production environment, this would be replaced with a persistent database
 */
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class DocumentStore {
  constructor() {
    this.documents = new Map();
    this.storePath = path.join(__dirname, '../data/documents.json');
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(this.storePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info(`Created data directory: ${dataDir}`);
    }
    
    // Load existing documents if available
    this.load();
  }
  
  /**
   * Load documents from disk
   */
  load() {
    try {
      if (fs.existsSync(this.storePath)) {
        const data = JSON.parse(fs.readFileSync(this.storePath, 'utf8'));
        data.forEach(doc => {
          this.documents.set(doc.id, doc);
        });
        logger.info(`Loaded ${this.documents.size} documents from storage`);
      }
    } catch (error) {
      logger.error('Error loading documents:', error);
    }
  }
  
  /**
   * Save documents to disk
   */
  save() {
    try {
      const data = Array.from(this.documents.values());
      fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2), 'utf8');
      logger.debug(`Saved ${data.length} documents to storage`);
    } catch (error) {
      logger.error('Error saving documents:', error);
    }
  }
  
  /**
   * Add or update a document
   * @param {Object} document - Document object
   */
  addDocument(document) {
    if (!document.id) {
      throw new Error('Document must have an id');
    }
    
    this.documents.set(document.id, {
      ...document,
      updatedAt: new Date().toISOString()
    });
    
    this.save();
    return this.documents.get(document.id);
  }
  
  /**
   * Get a document by id
   * @param {string} id - Document id
   */
  getDocument(id) {
    return this.documents.get(id);
  }
  
  /**
   * Delete a document by id
   * @param {string} id - Document id
   */
  deleteDocument(id) {
    const result = this.documents.delete(id);
    if (result) {
      this.save();
    }
    return result;
  }
  
  /**
   * Get all documents
   * @param {Object} options - Filter options
   */
  getAllDocuments(options = {}) {
    const docs = Array.from(this.documents.values());
    
    // Sort by date (newest first by default)
    docs.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return options.sortAsc ? dateA - dateB : dateB - dateA;
    });
    
    return docs;
  }
  
  /**
   * Get document count
   */
  getCount() {
    return this.documents.size;
  }
}

// Create and export a singleton instance
module.exports = new DocumentStore();

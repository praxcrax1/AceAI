const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const logger = require('../utils/logger');
const documentStore = require('../utils/documentStore');
const metrics = require('../utils/metrics');
const { AppError } = require('../utils/errorHandler');
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');

// Service for document management (list, get, delete, update)
// ...to be implemented: logic will be moved from routes/documents.js

exports.getAllDocuments = async (req, res) => {
  const userId = req.user && req.user.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const client = new MongoClient(config.mongodb.uri);
  await client.connect();
  const db = client.db(config.mongodb.dbName);
  const documents = db.collection('documents');
  const docs = await documents.find({ userId: new ObjectId(userId) }).toArray();
  await client.close();
  res.json({ count: docs.length, documents: docs });
};

exports.getDocumentById = async (req, res) => {
  const userId = req.user && req.user.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const client = new MongoClient(config.mongodb.uri);
  await client.connect();
  const db = client.db(config.mongodb.dbName);
  const documents = db.collection('documents');
  const doc = await documents.findOne({ _id: id, userId: new ObjectId(userId) });
  await client.close();
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json(doc);
};

exports.deleteDocumentById = async (req, res) => {
  const userId = req.user && req.user.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const client = new MongoClient(config.mongodb.uri);
  await client.connect();
  const db = client.db(config.mongodb.dbName);
  const documents = db.collection('documents');
  const doc = await documents.findOne({ _id: id, userId: new ObjectId(userId) });
  if (!doc) {
    await client.close();
    return res.status(404).json({ error: 'Document not found' });
  }
  await documents.deleteOne({ _id: id, userId: new ObjectId(userId) });
  await client.close();
  // TODO: Remove from Pinecone and Firebase if needed
  res.json({ success: true });
};

exports.updateDocumentMetadata = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user && req.user.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const client = new MongoClient(config.mongodb.uri);
  await client.connect();
  const db = client.db(config.mongodb.dbName);
  const documents = db.collection('documents');
  const doc = await documents.findOne({ _id: id, userId: new ObjectId(userId) });
  if (!doc) {
    await client.close();
    return res.status(404).json({ error: 'Document not found' });
  }
  const allowedUpdates = ['title', 'description', 'tags'];
  const validUpdates = Object.keys(updates)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});
  await documents.updateOne({ _id: id, userId: new ObjectId(userId) }, { $set: validUpdates });
  const updatedDoc = await documents.findOne({ _id: id, userId: new ObjectId(userId) });
  await client.close();
  res.json(updatedDoc);
};

const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');
const Document = require('../models/document');
const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

exports.getAllDocuments = async (req, res) => {
  const userId = req.user && req.user.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const client = new MongoClient(config.mongodb.uri);
  await client.connect();
  const db = client.db(config.mongodb.dbName);
  const documents = db.collection('documents');
  const docs = await documents.find({ userId: new ObjectId(userId) }).toArray();
  await client.close();
  res.json({ count: docs.length, documents: docs.map(doc => Document.fromDocument(doc)) });
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
  res.json(Document.fromDocument(doc));
};

exports.deleteDocumentById = async (req, res) => {
  const userId = req.user && req.user.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const index = pc.index(process.env.PINECONE_INDEX_NAME)
  await index.namespace(`${userId}:${id}`).deleteAll();
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
  res.json(Document.fromDocument(updatedDoc));
};

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const USERS_COLLECTION = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUsersCollection() {
  const client = new MongoClient(config.mongodb.uri);
  await client.connect();
  const db = client.db(config.mongodb.dbName);
  return db.collection(USERS_COLLECTION);
}

exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const users = await getUsersCollection();
  const existing = await users.findOne({ email });
  if (existing) return res.status(409).json({ error: 'User already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = { email, password: hash, createdAt: new Date() };
  const result = await users.insertOne(user);
  const token = jwt.sign({ userId: result.insertedId, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, userId: result.insertedId });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const users = await getUsersCollection();
  const user = await users.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user._id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, userId: user._id });
};

exports.authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

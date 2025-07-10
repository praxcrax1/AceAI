// uploadService.js
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const pdfProcessor = require('./pdfProcessor');
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');
const { v2: cloudinary } = require('cloudinary');
const Document = require('../models/document');

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config: only PDFs, max 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed!'), false);
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

exports.upload = upload;

const uploadToCloudinary = (buffer, fileName) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: fileName,
        format: 'pdf',
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

exports.handleFileUpload = async (req, res) => {
  const client = new MongoClient(config.mongodb.uri);
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileId = uuidv4();
    const fileName = `${userId}/${fileId}.pdf`;

    // Parallel upload & processing
    const [uploadResult, processResult] = await Promise.all([
      uploadToCloudinary(req.file.buffer, fileName),
      pdfProcessor.processPDF(req.file.buffer, `${userId}:${fileId}`, fileId, req.file.originalname, true),
    ]);

    const fileUrl = uploadResult.secure_url;
    const currentDate = new Date();

    await client.connect();
    const db = client.db(config.mongodb.dbName);
    const documents = db.collection('documents');

    const docMeta = new Document({
      _id: fileId,
      userId: new ObjectId(userId),
      filename: req.file.originalname,
      cloudinaryUrl: fileUrl,
      fileId,
      pageCount: processResult.pageCount,
      processedAt: currentDate,
      createdAt: currentDate,
      updatedAt: currentDate,
    });

    await documents.insertOne(docMeta.toDocument());

    res.json({ success: true, fileId, fileUrl, pageCount: processResult.pageCount, createdAt: currentDate, processedAt: currentDate, updatedAt: currentDate });
  } catch (err) {
    console.error('❌ File upload error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};

exports.handleLinkUpload = async (req, res) => {
  const client = new MongoClient(config.mongodb.uri);
  try {
    const userId = req.user?.userId;
    const { url } = req.body;
    const filename = url.split('/').pop() || 'remote.pdf';

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Invalid URL' });

    const fileId = uuidv4();
    const currentDate = new Date();

    await client.connect();
    const db = client.db(config.mongodb.dbName);
    const documents = db.collection('documents');

    const processResult = await pdfProcessor.processPDF(url, `${userId}:${fileId}`, fileId, filename);

    const docMeta = new Document({
      _id: fileId,
      userId: new ObjectId(userId),
      filename,
      cloudinaryUrl: url,
      fileId,
      pageCount: processResult.pageCount,
      processedAt: currentDate,
      createdAt: currentDate,
      updatedAt: currentDate,
    });

    await documents.insertOne(docMeta.toDocument());

    res.json({ success: true, fileId, fileUrl: url, pageCount: processResult.pageCount, createdAt: currentDate, processedAt: currentDate, updatedAt: currentDate });
  } catch (err) {
    console.error('❌ Link upload error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};
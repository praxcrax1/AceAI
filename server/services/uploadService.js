const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const pdfProcessor = require('./pdfProcessor');
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');
const { v2: cloudinary } = require('cloudinary');
const Document = require('../models/document');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

exports.upload = upload;

exports.handleUpload = async (req, res) => {
  const client = new MongoClient(config.mongodb.uri);
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileId = uuidv4();
    const fileBuffer = req.file.buffer;
    const fileName = `${userId}/${fileId}.pdf`;

    // Upload PDF buffer to Cloudinary
    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',       // for PDFs
            public_id: fileName,        // must include .pdf
            format: 'pdf',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(fileBuffer);
      });

    const uploadResult = await uploadToCloudinary().catch(err => {
      console.error('❌ Cloudinary upload failed:', err);
      throw new Error('Failed to upload to Cloudinary');
    });

    const fileUrl = uploadResult.secure_url;
    console.log('✅ Uploaded to Cloudinary:', fileUrl);

    // Store document metadata in MongoDB
    await client.connect();
    const db = client.db(config.mongodb.dbName);
    const documents = db.collection('documents');

    // When creating docMeta, use the Document model:
    const docMeta = new Document({
      _id: fileId,
      userId: new ObjectId(userId),
      filename: req.file.originalname,
      cloudinaryUrl: fileUrl,
      fileId: fileId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await documents.insertOne(docMeta.toDocument());

    // Process PDF: generate embeddings and send to Pinecone
    const processResult = await pdfProcessor.processPDF(fileUrl, `${userId}:${fileId}`, fileId, req.file.originalname);

    // Update MongoDB document with Pinecone/document stats
    await documents.updateOne(
      { _id: fileId },
      { $set: {
          pageCount: processResult.pageCount,
          processedAt: new Date(),
        }
      }
    );

    res.json({ success: true, fileId, fileUrl });
  } catch (err) {
    console.error('❌ Upload handler error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};

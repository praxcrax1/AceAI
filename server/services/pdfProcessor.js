// Import Pinecone v6 correctly
const { Pinecone } = require('@pinecone-database/pinecone');
const fetch = require('node-fetch');
const { WebPDFLoader } = require('@langchain/community/document_loaders/web/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
const config = require('../config');

class PDFProcessor {
  constructor() {
    this.pineconeClient = null;
    this.pineconeIndex = null;
    
    // Make sure dotenv has been initialized
    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY environment variable is not set. Check that dotenv is initialized properly.');
    }

    console.log(process.env.GOOGLE_API_KEY ? 'GOOGLE_API_KEY is set' : 'GOOGLE_API_KEY is not set');
    
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: config.embeddings.modelName,
    });
  }

  async initPinecone() {
    if (this.pineconeClient) return;

    try {
      // Initialize Pinecone client with v6 API
      this.pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

      // Get the index (note the lowercase 'index' method)
      this.pineconeIndex = this.pineconeClient.index(process.env.PINECONE_INDEX_NAME);
      console.log('Pinecone initialized successfully');
    } catch (error) {
      console.error('Error initializing Pinecone:', error);
      throw error;
    }
  }

  /**
   * Process a PDF from a remote URL (Firebase Storage)
   * @param {string} fileUrl - The remote URL of the PDF
   * @param {string} namespace - The Pinecone namespace (userId:fileId)
   * @param {string} fileId - The document's unique ID
   * @param {string} filename - The original filename
   */
  async processPDF(fileUrl, namespace, fileId, filename) {
  try {
    await this.initPinecone();

    console.log(`Fetching PDF from: ${fileUrl}`);
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

    const loader = new WebPDFLoader(blob); // ✅ pass actual blob
    const docs = await loader.load();

    console.log(`Loaded ${docs.length} pages from PDF`);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.textSplitter.chunkSize,
      chunkOverlap: config.textSplitter.chunkOverlap,
    });

    const chunks = await textSplitter.splitDocuments(docs);
    console.log(`Split into ${chunks.length} chunks`);

    chunks.forEach((chunk) => {
      chunk.metadata.fileId = fileId;
      chunk.metadata.filename = filename;
    });

    console.log('Creating and storing embeddings in Pinecone...');
    await PineconeStore.fromDocuments(chunks, this.embeddings, {
      pineconeIndex: this.pineconeIndex,
      namespace,
    });

    console.log('✅ PDF processed and stored in Pinecone');
    return {
      success: true,
      chunksCount: chunks.length,
      pageCount: docs.length,
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}
}

module.exports = new PDFProcessor();

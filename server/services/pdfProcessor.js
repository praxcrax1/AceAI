// Import Pinecone v6 correctly
const { Pinecone } = require('@pinecone-database/pinecone');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
const fs = require('fs');
const path = require('path');
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

  async processPDF(filePath, fileId) {
    try {
      // Initialize Pinecone
      await this.initPinecone();

      // Load the PDF
      console.log(`Loading PDF from ${filePath}`);
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      console.log(`Loaded ${docs.length} pages from PDF`);

      // Split the document into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: config.textSplitter.chunkSize,
        chunkOverlap: config.textSplitter.chunkOverlap,
      });
      const chunks = await textSplitter.splitDocuments(docs);
      console.log(`Split into ${chunks.length} chunks`);

      // Add metadata to each chunk to identify which document it came from
      chunks.forEach((chunk) => {
        chunk.metadata.fileId = fileId;
        chunk.metadata.filename = path.basename(filePath);
      });

      // Create and store the embeddings
      console.log('Creating and storing embeddings in Pinecone...');
      const vectorStore = await PineconeStore.fromDocuments(
        chunks,
        this.embeddings,
        {
          pineconeIndex: this.pineconeIndex,
          namespace: fileId,
        }
      );

      console.log('PDF processed and stored in Pinecone successfully');
      return { 
        success: true, 
        chunksCount: chunks.length,
        pageCount: docs.length
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    } finally {
      // Clean up the file if necessary
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Temporary file ${filePath} deleted`);
      }
    }
  }
}

module.exports = new PDFProcessor();

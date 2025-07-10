// pdfProcessor.js
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

    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: config.embeddings.modelName,
    });
  }

  async initPinecone() {
    if (this.pineconeClient) return;

    try {
      this.pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
      this.pineconeIndex = this.pineconeClient.index(process.env.PINECONE_INDEX_NAME);
      console.log('✅ Pinecone initialized');
    } catch (error) {
      console.error('❌ Pinecone init error:', error);
      throw error;
    }
  }

  /**
   * @param {string|Buffer} source - URL string or Buffer
   * @param {string} namespace - Pinecone namespace
   * @param {string} fileId - Unique ID for document
   * @param {string} filename - Original filename
   * @param {boolean} isBuffer - Whether the input is a Buffer
   */
  async processPDF(source, namespace, fileId, filename, isBuffer = false) {
    try {
      await this.initPinecone();

      let blob;
      if (isBuffer) {
        blob = new Blob([source], { type: 'application/pdf' });
      } else {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      }

      const loader = new WebPDFLoader(blob);
      const docs = await loader.load();
      console.log(`📄 Loaded ${docs.length} pages`);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: config.textSplitter.chunkSize,
        chunkOverlap: config.textSplitter.chunkOverlap,
      });

      const chunks = await splitter.splitDocuments(docs);
      chunks.forEach((chunk) => {
        chunk.metadata.fileId = fileId;
        chunk.metadata.filename = filename;
      });

      console.log('💡 Storing embeddings in Pinecone...');
      await PineconeStore.fromDocuments(chunks, this.embeddings, {
        pineconeIndex: this.pineconeIndex,
        namespace,
      });

      console.log('✅ PDF processed and stored');
      return {
        success: true,
        chunksCount: chunks.length,
        pageCount: docs.length,
      };
    } catch (error) {
      console.error('❌ Error processing PDF:', error);
      throw error;
    }
  }
}

module.exports = new PDFProcessor();

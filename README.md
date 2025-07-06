# AceAI: PDF Chat with RAG

This is a Retrieval-Augmented Generation (RAG) application built with Node.js and LangChain.js that allows users to upload a PDF and chat with an AI that answers questions based on the document's content.

![AceAI Demo](https://via.placeholder.com/800x450.png?text=AceAI+RAG+Application)

## Features

- 📄 **PDF Upload and Processing**: Upload PDF documents via web interface or API
- 📝 **PDF Parsing & Chunking**: Process PDFs with LangChain's PDFLoader and RecursiveCharacterTextSplitter
- 🧠 **AI Embeddings**: Convert document chunks to vector embeddings using Google's Gemini
- 🔍 **Vector Storage**: Store embeddings efficiently in Pinecone for quick retrieval
- 🔎 **Semantic Search**: Retrieve the most relevant document chunks based on user queries
- 💬 **Chat Completion**: Answer user questions using Gemini LLM grounded in document content
- 🧵 **Chat Memory**: Maintain conversation context across multiple questions

## Quick Start

The easiest way to get started is to use the setup script:

```bash
# Clone the repository
git clone https://github.com/yourusername/AceAI.git
cd AceAI

# Make the setup script executable and run it
chmod +x setup.sh
./setup.sh
```

The script will:
1. Create the `.env` file if it doesn't exist
2. Create necessary directories
3. Install dependencies
4. Start the server

**Important**: Before running the application, make sure to update the `.env` file with your API keys.

## Manual Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd server
   npm install --legacy-peer-deps
   ```
3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=3000
   GOOGLE_API_KEY=your_google_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment (optional for Pinecone v6)
   PINECONE_INDEX_NAME=aceai-docs
   ```

4. Create a Pinecone index named `aceai-docs` with the dimension size of 768 (for Gemini embeddings)
   
   Note: This project uses Pinecone v6 client, which handles the environment configuration differently. The `PINECONE_ENVIRONMENT` is kept for backward compatibility and informational purposes.

5. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Requirements

- Node.js 14+ (16+ recommended)
- Google Gemini API key (for LLM and embeddings)
- Pinecone account (for vector database)
- Modern web browser

## API Endpoints

### PDF Upload
```
POST /api/upload
```
Request:
- Form data with a file field named 'pdf'

Response:
```json
{
  "success": true,
  "message": "PDF processed successfully",
  "fileId": "uuid-string",
  "filename": "original-filename.pdf",
  "chunksCount": 42
}
```

### Chat with PDF
```
POST /api/chat
```
Request:
```json
{
  "question": "What is this document about?",
  "fileId": "uuid-string",
  "sessionId": "optional-session-uuid-for-conversation-context"
}
```

Response:
```json
{
  "answer": "This document is about...",
  "sources": [
    {
      "content": "Text chunk that supports the answer",
      "metadata": {
        "fileId": "uuid-string",
        "filename": "original-filename.pdf",
        "page": 1
      }
    }
  ],
  "sessionId": "session-uuid-for-future-conversation"
}
```

## Example Usage with cURL

1. Upload a PDF:
```bash
curl -X POST -F "pdf=@/path/to/your/document.pdf" http://localhost:3000/api/upload
```

2. Chat with the uploaded PDF:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the main topic of this document?","fileId":"the-file-id-from-upload-response"}' \
  http://localhost:3000/api/chat
```

3. Follow-up question (using the sessionId from the previous response):
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"question":"Can you elaborate more on that?","fileId":"the-file-id","sessionId":"the-session-id"}' \
  http://localhost:3000/api/chat
```

## Documentation

For detailed information about the project, please see:
- [ARCHITECTURE.md](ARCHITECTURE.md): Technical architecture and implementation details
- [UI-PLAN.md](UI-PLAN.md): UI enhancement roadmap and implementation guidelines
- [DEVELOPMENT.md](DEVELOPMENT.md): Guide for developers contributing to the project

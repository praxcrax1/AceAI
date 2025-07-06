# AceAI Technical Architecture and Documentation

This document provides detailed information about the architecture, implementation details, and future plans for AceAI.

## Technical Architecture

AceAI is built using a modern JavaScript stack:

### Backend
- **Node.js & Express**: Core server framework
- **LangChain.js**: Framework for working with LLMs
- **@langchain/google-genai**: Integration with Google's Gemini models
- **@langchain/pinecone**: Integration with Pinecone vector database
- **@pinecone-database/pinecone (v6)**: Vector database client for similarity search
- **PDFLoader**: PDF parsing from LangChain community tools

### Database
- **Pinecone**: Vector database for storing and retrieving embeddings
- **File System**: Local storage for document metadata

### Frontend
- **HTML, CSS, JavaScript**: Simple web interface
- **Bootstrap 5**: UI components and styling

## System Overview

### PDF Processing Pipeline

1. **Upload**: User uploads a PDF document through the web interface
2. **Processing**:
   - PDF is saved to the server temporarily
   - PDF is parsed into text using PDFLoader
   - Text is split into chunks using RecursiveCharacterTextSplitter
   - Chunks are converted to vector embeddings using Google's text-embedding-004 model
   - Embeddings are stored in Pinecone with document metadata
   - Original PDF file is deleted after processing

### RAG Question-Answering Pipeline

1. **Query Processing**:
   - User submits a question about a document
   - The question is used to retrieve relevant chunks from Pinecone
   - LangChain's ConversationalRetrievalQAChain handles the retrieval and response generation

2. **Memory & Context**:
   - BufferMemory stores conversation history
   - Session management tracks user conversations
   - Caching improves response times for repeated queries

## Implementation Details

### Key Components

#### 1. Server Setup (`server.js` & `index.js`)
- Entry point for the application
- Environment variable validation
- Express server configuration
- Route registration
- Error handling setup
- Graceful shutdown handling

#### 2. PDF Processing Service (`pdfProcessor.js`)
- Pinecone client initialization
- PDF loading and parsing
- Text chunking
- Embedding generation
- Vector storage in Pinecone
- Error handling

#### 3. Chat Service (`chatService.js`)
- LLM initialization (Gemini)
- Embeddings initialization
- Pinecone integration
- Session memory management
- Question processing with RAG
- Source extraction for citations

#### 4. Document Management (`documentStore.js`)
- Document metadata storage
- CRUD operations for documents
- Data persistence using file system

#### 5. API Routes
- **Upload** (`upload.js`): PDF file upload and processing
- **Chat** (`chat.js`): Question-answering functionality
- **Documents** (`documents.js`): Document management operations
- **Admin** (`admin.js`): System health and metrics

#### 6. Utilities
- **Cache** (`cache.js`): In-memory caching for performance
- **Logger** (`logger.js`): Application logging
- **Error Handler** (`errorHandler.js`): Centralized error handling
- **Rate Limiter** (`rateLimiter.js`): API protection
- **Metrics** (`metrics.js`): Performance and usage tracking
- **Graceful Shutdown** (`gracefulShutdown.js`): Clean application termination

### Configuration (`config.js`)
- Application settings
- LLM parameters (model, temperature, etc.)
- Embedding configuration
- Text splitting parameters
- Vector search configuration

## Pinecone Integration

AceAI uses Pinecone v6 client which differs from previous versions:

1. **Initialization**:
   ```javascript
   // Old way (pre-v6)
   const pineconeClient = new PineconeClient();
   await pineconeClient.init({
     apiKey: process.env.PINECONE_API_KEY,
     environment: process.env.PINECONE_ENVIRONMENT,
   });
   const index = pineconeClient.Index(process.env.PINECONE_INDEX_NAME);
   
   // New way (v6)
   const pinecone = new Pinecone({
     apiKey: process.env.PINECONE_API_KEY,
   });
   const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
   ```

2. **Namespace Operations**:
   ```javascript
   // Old way
   await index._delete({
     deleteRequest: {
       namespace: id,
       deleteAll: true
     }
   });
   
   // New way
   await index.namespace(id).deleteAll();
   ```

## Document Management

AceAI provides a document management interface that allows users to:
- View all uploaded documents
- Select a document to chat with
- Delete documents when no longer needed

Document metadata is stored locally and includes:
- Document ID
- Original filename
- Title (derived from filename)
- Page count
- Chunk count
- Size
- Processing timestamps

## Future UI Enhancement Plans

Future UI improvements will focus on:

### 1. Enhanced Document Management
- Document tagging and categorization
- Advanced search and filtering
- Document preview functionality
- Metadata editing capabilities
- Bulk document operations

### 2. Improved Chat Experience
- Better visualization of sources and references
- Support for code and mathematical notation
- Chat history export
- Multiple simultaneous document contexts
- Conversation branching

### 3. Admin Dashboard
- System monitoring and usage statistics
- Rate limiting configuration
- Model and embedding parameter tuning
- Error logs and diagnostics
- Performance optimization tools

### 4. User Authentication
- User accounts and document ownership
- Sharing permissions
- Team collaboration features
- Access control and audit logs

### 5. Progressive Web App Features
- Offline functionality
- Mobile responsiveness
- Push notifications
- Installation capabilities

## API Documentation

### 1. PDF Upload
```
POST /api/upload
```
**Request:**
- Form data with a file field named 'pdf'

**Response:**
```json
{
  "success": true,
  "message": "PDF processed successfully",
  "fileId": "uuid-string",
  "filename": "original-filename.pdf",
  "chunksCount": 42,
  "processingTime": "2.3s"
}
```

### 2. Chat with PDF
```
POST /api/chat
```
**Request:**
```json
{
  "question": "What is this document about?",
  "fileId": "uuid-string",
  "sessionId": "optional-session-uuid-for-conversation-context"
}
```

**Response:**
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
  "sessionId": "session-uuid-for-future-conversation",
  "processingTime": "1.2s",
  "cached": false
}
```

### 3. List Documents
```
GET /api/documents
```

**Response:**
```json
{
  "count": 2,
  "documents": [
    {
      "id": "uuid-string",
      "filename": "document1.pdf",
      "title": "Document 1",
      "createdAt": "2025-07-06T18:30:00.000Z",
      "updatedAt": "2025-07-06T18:30:00.000Z",
      "pageCount": 15,
      "chunkCount": 42,
      "size": 1048576
    },
    {
      "id": "another-uuid-string",
      "filename": "document2.pdf",
      "title": "Document 2",
      "createdAt": "2025-07-05T10:15:00.000Z",
      "updatedAt": "2025-07-05T10:15:00.000Z",
      "pageCount": 8,
      "chunkCount": 27,
      "size": 524288
    }
  ]
}
```

### 4. Get Document
```
GET /api/documents/:id
```

**Response:**
```json
{
  "id": "uuid-string",
  "filename": "document1.pdf",
  "title": "Document 1",
  "createdAt": "2025-07-06T18:30:00.000Z",
  "updatedAt": "2025-07-06T18:30:00.000Z",
  "pageCount": 15,
  "chunkCount": 42,
  "size": 1048576,
  "filePath": "/path/to/document.pdf"
}
```

### 5. Delete Document
```
DELETE /api/documents/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Document uuid-string deleted successfully"
}
```

### 6. Update Document Metadata
```
PATCH /api/documents/:id
```

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Document description",
  "tags": ["important", "research"]
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "filename": "document1.pdf",
  "title": "Updated Title",
  "description": "Document description",
  "tags": ["important", "research"],
  "createdAt": "2025-07-06T18:30:00.000Z",
  "updatedAt": "2025-07-06T19:45:00.000Z",
  "pageCount": 15,
  "chunkCount": 42,
  "size": 1048576
}
```

### 7. System Health
```
GET /api/admin/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-06T20:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "memoryUsage": {
    "rss": 75350016,
    "heapTotal": 39251968,
    "heapUsed": 27282600,
    "external": 3174579
  },
  "cpuLoad": [0.5, 0.3, 0.2],
  "services": {
    "pinecone": "ok",
    "googleai": "ok"
  }
}
```

## Error Handling

AceAI implements a comprehensive error handling strategy:

1. **Custom AppError Class**:
   - Standard error format
   - Status code assignment
   - Additional metadata attachment

2. **Error Middleware**:
   - Centralized error processing
   - Environment-aware error responses
   - Error logging

3. **Async Error Catching**:
   - Express route wrapper for async functions
   - Promise rejection handling

4. **API Error Responses**:
   ```json
   {
     "error": "Error message",
     "statusCode": 400,
     "details": "Additional details about the error"
   }
   ```

## Security Considerations

- Rate limiting to prevent abuse
- Environment variable validation
- Safe error messages (no sensitive data)
- Input validation
- Temporary file cleanup
- CORS configuration

## Performance Optimizations

- In-memory caching for frequent operations
- Efficient chunking strategies
- Optimized vector search parameters
- Resource cleanup
- Graceful shutdown handling

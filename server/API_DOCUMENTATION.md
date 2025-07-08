# API Documentation

This document describes the available backend API endpoints for the AceAI server. The APIs allow for document upload, management, chat with documents, and admin/system operations.

---

## 1. Document Upload

### `POST /api/upload`
- **Description:** Upload a PDF document for processing.
- **Request:**
  - Content-Type: `multipart/form-data`
  - Body: `pdf` (file, required)
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `fileId` (string)
  - `filename` (string)
  - `chunksCount` (number)
  - `processingTime` (string)
- **Errors:**
  - 400: No PDF file provided
  - 500: Failed to process PDF

---

## 2. Document Management

### `GET /api/documents`
- **Description:** List all uploaded documents.
- **Response:**
  - `count` (number)
  - `documents` (array of document metadata)

### `GET /api/documents/:id`
- **Description:** Get metadata for a specific document by ID.
- **Response:**
  - Document metadata object
- **Errors:**
  - 404: Document not found

### `DELETE /api/documents/:id`
- **Description:** Delete a document by ID (removes from Pinecone, document store, and disk).
- **Response:**
  - `success` (boolean)
  - `message` (string)
- **Errors:**
  - 404: Document not found
  - 500: Failed to delete document

### `PATCH /api/documents/:id`
- **Description:** Update document metadata (title, description, tags).
- **Request:**
  - JSON body with any of: `title`, `description`, `tags`
- **Response:**
  - Updated document metadata
- **Errors:**
  - 404: Document not found

---

## 3. Chat with Document

### `POST /api/chat`
- **Description:** Ask a question about a document.
- **Request:**
  - JSON body:
    - `question` (string, required)
    - `fileId` (string, required)
    - `sessionId` (string, optional)
- **Response:**
  - `answer` (string)
  - `sources` (array)
  - `sessionId` (string)
  - `processingTime` (string)
  - `cached` (boolean)
- **Errors:**
  - 400: Missing required fields
  - 500: Failed to process question

### `DELETE /api/chat/:sessionId`
- **Description:** Clear chat history for a session.
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `clearedCacheEntries` (number, optional)
- **Errors:**
  - 400: SessionId is required
  - 500: Failed to clear chat history

---

## 4. Admin & System APIs

### `GET /api/admin/health`
- **Description:** Health check for backend and external services.
- **Response:**
  - `status` (string)
  - `timestamp` (string)
  - `uptime` (number)
  - `environment` (string)
  - `memoryUsage` (object)
  - `cpuLoad` (array)
  - `services` (object: pinecone, googleai)
  - `cache` (object)
  - `pineconeError`, `googleaiError` (string, optional)

### `GET /api/admin/system`
- **Description:** Detailed system and process info.
- **Response:**
  - `platform` (object)
  - `process` (object)
  - `cache` (object)

### `POST /api/admin/cache/clear`
- **Description:** Clear the in-memory cache.
- **Response:**
  - `status` (string)
  - `message` (string)

### `GET /api/admin/metrics`
- **Description:** Get usage metrics.
- **Query:**
  - `detailed` (boolean, optional)
- **Response:**
  - Metrics object

### `POST /api/admin/metrics/reset`
- **Description:** Reset all metrics.
- **Response:**
  - `status` (string)
  - `message` (string)

---

## Notes
- All endpoints return JSON responses.
- Error responses include an `error` field and may include a `details` field.
- Some endpoints require specific environment variables (e.g., Pinecone, Google AI keys).

---

For more details, see the code in the `server/routes/` directory.

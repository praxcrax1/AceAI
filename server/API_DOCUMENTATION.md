# AceAI API Documentation

This document describes all public API endpoints for the AceAI PDF RAG application.

---

## Authentication

### POST /api/user/register
- **Description:** Register a new user.
- **Request Body:**
  - `email` (string, required)
  - `password` (string, required)
- **Response:**
  - `token` (string) – JWT for authentication
  - `user` (object)

### POST /api/user/login
- **Description:** Log in an existing user.
- **Request Body:**
  - `email` (string, required)
  - `password` (string, required)
- **Response:**
  - `token` (string) – JWT for authentication
  - `user` (object)

---

## PDF Upload & Processing

### POST /api/upload
- **Description:** Upload a PDF for processing and embedding.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request:**
  - `multipart/form-data` with a `pdf` file field
- **Response:**
  - `success` (boolean)
  - `fileId` (string)
  - `fileUrl` (string)
  - (on error) `error` (string)

---

## Document Management

### GET /api/documents
- **Description:** List all documents for the authenticated user.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - `count` (number)
  - `documents` (array of document metadata)

### GET /api/documents/:id
- **Description:** Get metadata for a specific document by fileId.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - Document metadata object

### DELETE /api/documents/:id
- **Description:** Delete a document by fileId.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - `success` (boolean)
  - `message` (string)

### PATCH /api/documents/:id
- **Description:** Update document metadata (title, description, tags).
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  - Any of: `title`, `description`, `tags` (array)
- **Response:**
  - Updated document metadata object

---

## Chat with PDF

### POST /api/chat
- **Description:** Ask a question about a specific PDF document.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  - `question` (string, required)
  - `fileId` (string, required)
  - `sessionId` (string, optional)
- **Response:**
  - `answer` (string)
  - `sources` (array of source chunks)
  - `sessionId` (string)
  - `processingTime` (string)
  - `cached` (boolean)

---

## Admin & Health

### GET /api/admin/health
- **Description:** System health and status check.
- **Headers:**
  - `Authorization: Bearer <token>` (admin only)
- **Response:**
  - System and service status info

---

## Error Responses
- All endpoints may return `{ error: string }` on failure.
- Most endpoints require a valid JWT in the `Authorization` header.

---

## Notes
- All endpoints are prefixed with `/api/`.
- All document and chat endpoints are user-specific and require authentication.
- File uploads are limited to PDF files up to 10MB.

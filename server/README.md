# AceAI: Secure PDF Chat with RAG, Cloudinary, Pinecone, and MongoDB

AceAI is a full-stack Retrieval-Augmented Generation (RAG) application that lets users securely upload PDFs, process them for semantic search, and chat with an AI about their documents. It uses Node.js, LangChain, Pinecone, MongoDB, and Cloudinary for a robust, scalable, and user-friendly experience.

---

## Features
- **User Authentication:** Secure signup/login with JWT-based authentication.
- **Per-User Document Management:** Each user can upload, view, and delete their own PDFs.
- **Cloudinary Storage:** PDFs are uploaded and stored in Cloudinary for reliable, scalable, and public file hosting.
- **PDF Processing:** PDFs are processed using LangChain's WebPDFLoader, split into semantic chunks, and embedded for search.
- **Semantic Search with Pinecone:** Embeddings are stored in Pinecone, namespaced per user and document for privacy and efficiency.
- **Chat with Your PDFs:** Ask questions about your documents and get answers with source citations.
- **Modern Frontend:** Clean Bootstrap UI for upload, chat, document management, login, and signup.
- **Robust Error Handling:** All API endpoints and UI flows have user-friendly error messages.

---

## How It Works

### 1. User Authentication
- Users sign up or log in via the frontend.
- JWT tokens are issued and stored in localStorage; all API calls require authentication.

### 2. PDF Upload & Processing
- Users upload PDFs via the web UI.
- The backend receives the file, uploads it to Cloudinary, and stores metadata (including fileId, Cloudinary URL, and stats) in MongoDB.
- The PDF is fetched from Cloudinary, split into chunks, and embedded using LangChain and Google Generative AI.
- Embeddings are stored in Pinecone under a namespace unique to the user and document.

### 3. Document Management
- Users can view a list of their uploaded documents, including filename, page count, and chunk count.
- Documents can be deleted, which removes metadata and embeddings.

### 4. Chat with Documents
- Users select a document and ask questions via the chat UI.
- The backend retrieves relevant chunks from Pinecone, runs a retrieval-augmented generation chain, and returns an answer with sources.
- Each chat is stateless (no chat memory is stored).

---

## Tech Stack
- **Backend:** Node.js, Express, LangChain, Pinecone, MongoDB, Cloudinary
- **Frontend:** HTML, Bootstrap, Vanilla JS
- **Authentication:** JWT
- **PDF Processing:** LangChain WebPDFLoader
- **Embeddings:** Google Generative AI
- **Vector Search:** Pinecone
- **File Storage:** Cloudinary (resource_type: 'raw')

---

## API Overview
See [`server/API_DOCUMENTATION.md`](server/API_DOCUMENTATION.md) for full details.

- `POST /api/user/register` — Register a new user
- `POST /api/user/login` — Log in
- `POST /api/upload` — Upload a PDF
- `GET /api/documents` — List user documents
- `GET /api/documents/:id` — Get document metadata
- `DELETE /api/documents/:id` — Delete a document
- `PATCH /api/documents/:id` — Update document metadata
- `POST /api/chat` — Ask a question about a document

---

## Setup & Deployment
1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd AceAI
   ```
2. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in all required keys (Google, Pinecone, MongoDB, Cloudinary, JWT).
4. **Start the server:**
   ```bash
   node server.js
   ```
5. **Open the app:**
   - Visit `http://localhost:3000` in your browser.

---

## Security & Privacy
- All user data and documents are namespaced and isolated.
- JWT authentication is required for all sensitive operations.
- Uploaded PDFs are public on Cloudinary (for processing); do not upload sensitive documents unless you control access.

---

## Customization & Extensibility
- Add new document loaders or embedding models in `services/pdfProcessor.js`.
- Extend user or document models in `models/`.
- Add new endpoints or admin features in `routes/` and `services/`.

---

## Credits
- Built with [LangChain](https://js.langchain.com/), [Pinecone](https://www.pinecone.io/), [Cloudinary](https://cloudinary.com/), [MongoDB](https://www.mongodb.com/), and [Bootstrap](https://getbootstrap.com/).

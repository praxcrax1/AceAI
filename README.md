# AceAI

AceAI is an AI-powered PDF chatbot designed for students and professionals to interact with their PDF documents using natural language. Users can upload their PDFs, which are securely stored, processed, and indexed in a vector database for fast and accurate semantic search. The platform supports chat history and user management for a personalized experience.

## Features
- **AI Chat with PDFs:** Ask questions about your uploaded PDFs and get instant, context-aware answers.
- **PDF Upload:** Easily upload your PDF documents through a simple web interface.
- **Vector Database Search:** Documents are embedded and stored in a vector database for efficient semantic retrieval.
- **Chat History:** Maintain chat history for each session to enable context-aware conversations.
- **User Management:** Secure authentication and per-user document isolation.

## How It Works
1. **User Authentication:** Sign up or log in to manage your documents and chats securely.
2. **Upload PDFs:** Upload your PDF files, which are processed and stored in the backend.
3. **Semantic Search:** The system splits and embeds your documents, storing them in a vector database for fast retrieval.
4. **Chat with AI:** Ask questions about your documents. The AI retrieves relevant content and provides answers, using chat history for context.

## Tech Stack
- **Backend:** Node.js, Express, LangChain, Pinecone, MongoDB, Cloudinary
- **Frontend:** Next.js, Bootstrap, Vanilla JS
- **Authentication:** JWT
- **PDF Processing:** LangChain WebPDFLoader
- **Embeddings:** Google Generative AI
- **Vector Search:** Pinecone
- **File Storage:** Cloudinary

## Getting Started
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd AceAI
   ```
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Configure environment variables in `.env` (see `.env.example`).
4. Start the server:
   ```bash
   node server.js
   ```
5. Open the app in your browser at `http://localhost:3000`.

## License
MIT

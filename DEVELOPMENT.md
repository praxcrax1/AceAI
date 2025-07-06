# AceAI Development Guide

This guide provides instructions for developers who want to contribute to or extend the AceAI project.

## Development Setup

### Prerequisites

- Node.js 14+ (16+ recommended)
- npm 7+ or yarn 1.22+
- Google Gemini API key
- Pinecone account

### Local Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/AceAI.git
   cd AceAI
   ```

2. **Install dependencies**:
   ```bash
   cd server
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**:
   Create a `.env` file in the server directory:
   ```
   PORT=3000
   GOOGLE_API_KEY=your_google_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX_NAME=aceai-docs
   ```

4. **Create required directories**:
   ```bash
   mkdir -p uploads
   mkdir -p server/data
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

## Code Structure

### Backend Structure

```
server/
├── config.js           # Application configuration
├── index.js            # Express application setup
├── server.js           # Entry point with env validation
├── data/               # Local data storage
├── logs/               # Application logs
├── public/             # Static frontend files
├── routes/             # API route handlers
├── services/           # Business logic services
├── uploads/            # Temporary file storage
└── utils/              # Utility functions
```

### Key Files

- **server.js**: Entry point that validates environment variables
- **index.js**: Express application setup
- **config.js**: Configuration variables for the application
- **routes/*.js**: API endpoint handlers
- **services/*.js**: Business logic implementation
- **utils/*.js**: Helper utilities

## Adding New Features

### General Process

1. **Create an issue** describing the feature
2. **Design** the implementation approach
3. **Implement** the feature with appropriate tests
4. **Document** the new functionality
5. **Create a pull request** for review

### Adding a New API Endpoint

1. **Create a route file** or add to an existing one:

```javascript
// routes/newFeature.js
const express = require('express');
const router = express.Router();
const { catchAsync } = require('../utils/errorHandler');

router.get('/', catchAsync(async (req, res) => {
  // Implement endpoint logic
  res.json({ success: true, data: 'Your data here' });
}));

module.exports = router;
```

2. **Register the route** in index.js:

```javascript
const newFeatureRoutes = require('./routes/newFeature');
app.use('/api/new-feature', newFeatureRoutes);
```

3. **Create any necessary services** for business logic:

```javascript
// services/newFeatureService.js
class NewFeatureService {
  async performAction() {
    // Implementation
    return result;
  }
}

module.exports = new NewFeatureService();
```

### Adding a UI Component

1. **Create the component** in the public directory or use a frontend framework
2. **Add any necessary JavaScript** for interactivity
3. **Ensure it's responsive** and works across browsers
4. **Test thoroughly** with different data scenarios

## Working with the RAG Pipeline

### Adding Support for a New Document Format

1. **Install required loader** from LangChain community:
   ```bash
   npm install --legacy-peer-deps @langchain/community
   ```

2. **Update the pdfProcessor.js** service (or create a new one):
   ```javascript
   // Add new import
   const { NewFormatLoader } = require('@langchain/community/document_loaders/newFormat');
   
   // Add a method to process the new format
   async processNewFormat(filePath, fileId) {
     // Implementation similar to processPDF but with new loader
   }
   ```

3. **Add a new route** for the new format upload

### Modifying the Embedding Process

1. **Update the embeddings configuration** in config.js
2. **Modify the embedding initialization** in services/pdfProcessor.js

### Changing the Vector Storage

If you want to use a different vector database instead of Pinecone:

1. **Install the necessary package**:
   ```bash
   npm install @langchain/newvectordb
   ```

2. **Create a new service** or modify the existing ones to use the new vector database
3. **Update environment variables** and configuration

## Testing

### Manual Testing

1. **Test PDF upload** with various PDF files
2. **Test chat functionality** with different questions
3. **Verify document management** operations
4. **Check error handling** with invalid inputs

### Automated Testing (Future)

1. **Unit tests** for individual functions
2. **Integration tests** for API endpoints
3. **End-to-end tests** for user flows

## Deployment

### Basic Deployment

1. **Set up a server** with Node.js installed
2. **Clone the repository** to the server
3. **Install dependencies**:
   ```bash
   npm install --production
   ```
4. **Set up environment variables**
5. **Start the server**:
   ```bash
   npm start
   ```

### Using Docker

1. **Create a Dockerfile**:
   ```dockerfile
   FROM node:16
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install --production
   
   COPY . .
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Build and run the container**:
   ```bash
   docker build -t aceai .
   docker run -p 3000:3000 --env-file .env aceai
   ```

## Common Issues & Solutions

### PDF Processing Errors

**Issue**: Error processing PDF files
**Solution**: 
- Ensure the PDF is not corrupt or password protected
- Check if the file size is within limits
- Verify that necessary directories exist and are writable

### Pinecone Connection Issues

**Issue**: Cannot connect to Pinecone
**Solution**:
- Verify API key is correct
- Check that the index exists and has the right dimension size
- Ensure internet connectivity

### LLM API Errors

**Issue**: Errors with Google Gemini API
**Solution**:
- Verify API key is valid
- Check for rate limiting
- Ensure the model name is correct

## Contributing Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Follow JavaScript best practices
- Comment complex logic
- Use meaningful variable and function names

### Documentation

- Update README.md for major changes
- Document new API endpoints
- Add JSDoc comments to functions

### Pull Requests

- Reference the issue being fixed
- Include a clear description of changes
- Ensure all tests pass
- Request code review from maintainers

## Resources

- [LangChain.js Documentation](https://js.langchain.com/docs/)
- [Pinecone Documentation](https://docs.pinecone.io/docs/overview)
- [Google Gemini API Documentation](https://ai.google.dev/docs/gemini_api_overview)
- [Express.js Documentation](https://expressjs.com/)

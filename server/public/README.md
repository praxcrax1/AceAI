# AceAI Client Documentation

This folder contains a simple HTML/CSS/JavaScript interface for interacting with the AceAI RAG API.

## Features

- PDF Upload: Drag & drop or click to upload PDF files
- Chat Interface: Ask questions about the uploaded PDF
- Source Citations: View the document chunks used to answer questions
- Session Management: Maintain conversation context across questions

## Usage

1. Open the application in your browser (automatically served by the Node.js server)
2. Upload a PDF document
3. Ask questions about the content of the document
4. Follow up with additional questions, maintaining context

## Implementation Notes

The client communicates with the server through two main API endpoints:

- `POST /api/upload` - For uploading PDF files
- `POST /api/chat` - For asking questions about the uploaded documents

Session management is handled through a session ID that's returned by the server and stored in the client.

## Customization

You can customize the interface by modifying the HTML, CSS, and JavaScript in the `index.html` file. The application uses Bootstrap 5 for styling, which is loaded from a CDN.

## Browser Compatibility

The application should work in all modern browsers that support:

- Fetch API
- FormData
- ES6 features
- File API for drag & drop

## Future Improvements

Potential improvements for the client interface:

- Add support for multiple document uploads
- Implement document selection dropdown
- Add chat history persistence
- Add support for downloading chat transcripts
- Improve the document processing status feedback

# MongoDB Integration for Chat History

This document explains the MongoDB integration for chat history persistence in the AceAI RAG application.

## Overview

The AceAI application now uses MongoDB to store conversation history, replacing the previous in-memory storage. This provides several benefits:

1. **Persistence**: Chat history survives server restarts
2. **Scalability**: MongoDB can handle large volumes of chat data
3. **Performance**: Indexed queries for efficient chat history retrieval
4. **Session management**: Each user session's history is stored separately

## Configuration

### Environment Variables

Add the following to your `.env` file:

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=aceai
MONGODB_CHAT_COLLECTION=chat_memory
```

For production environments, use a proper MongoDB connection string:

```
MONGODB_URI=mongodb://username:password@hostname:port/database?options
```

### MongoDB Setup

1. Install MongoDB on your system or use a cloud service like MongoDB Atlas
2. Create a database (default name: `aceai`)
3. The application will automatically create necessary collections and indexes

## Implementation Details

The integration uses the `@langchain/mongodb` package to store LangChain chat messages in MongoDB. Key components:

1. **mongodb.js**: MongoDB connection utility with connection pooling and index management
2. **chatService.js**: Updated to use MongoDBChatMessageHistory instead of in-memory BufferMemory
3. **Graceful shutdown**: MongoDB connections are properly closed on application shutdown
4. **Important note**: When creating a MongoDBChatMessageHistory instance, you must pass the actual MongoDB collection object, not just the collection name:

```javascript
// Get MongoDB database and collection references
const db = await mongoDBClient.getDB();
const collection = db.collection(config.mongodb.chatCollection);

// Create MongoDB chat message history with collection object
const messageHistory = new MongoDBChatMessageHistory({
  collection, // Pass the actual collection object instead of the name
  sessionId: sessionId,
});
```

## Testing the Integration

Use the provided test script to validate the MongoDB integration:

```bash
node scripts/test-mongo-integration.js
```

This script:
1. Tests the MongoDB connection
2. Creates test messages in the chat collection
3. Retrieves and validates the messages
4. Cleans up test data

## Troubleshooting

### Connection Issues
- Verify MongoDB is running: `systemctl status mongodb` or `mongosh`
- Check connection string format
- Ensure network connectivity and firewall settings

### Performance Issues
- The application creates optimal indexes automatically
- For large deployments, consider MongoDB sharding
- Monitor query performance using MongoDB tools

## Data Structure

Chat messages are stored in the following format:

```json
{
  "sessionId": "unique-session-id",
  "data": [
    {
      "type": "human",
      "data": {
        "content": "User message content",
        "additional_kwargs": {}
      }
    },
    {
      "type": "ai",
      "data": {
        "content": "AI response content",
        "additional_kwargs": {}
      }
    }
  ],
  "timestamp": ISODate("2025-07-07T12:00:00.000Z")
}
```

Each document represents a complete chat history for a specific session.

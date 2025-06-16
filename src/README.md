# Refactored Node.js/Express Structure

## Overview
The chat functionality has been refactored from Next.js API routes to a clean Node.js/Express architecture with proper separation of concerns.

## Structure

```
src/
├── index.ts                 # Express server entry point
├── controllers/
│   └── chatController.ts    # Handles HTTP requests/responses
├── services/
│   ├── chatService.ts       # Main business logic orchestration
│   ├── messageStoreService.ts # Message history management
│   └── aiService.ts         # OpenAI integration
├── routes/
│   └── chatRoutes.ts        # Route definitions
├── middleware/
│   ├── errorHandler.ts      # Global error handling
│   └── requestLogger.ts     # Request/response logging
└── types/                   # TypeScript type definitions
```

## Key Components

### 1. **ChatController** (`controllers/chatController.ts`)
- Validates incoming requests
- Delegates to ChatService
- Handles HTTP responses
- Passes errors to middleware

### 2. **ChatService** (`services/chatService.ts`)
- Main orchestration logic
- Language detection
- Message processing
- Topic analysis
- Error handling

### 3. **MessageStoreService** (`services/messageStoreService.ts`)
- Manages per-character message stores
- Handles message optimization for token limits
- System message updates

### 4. **AIService** (`services/aiService.ts`)
- OpenAI integration with fallback models
- Response generation
- Token usage tracking

### 5. **Middleware**
- **errorHandler**: Centralized error handling
- **requestLogger**: Logs all requests/responses

## API Endpoint

```
POST /api/chat
```

### Request Body:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ],
  "characterId": "guruji",
  "resetChat": false
}
```

### Response:
```json
{
  "topicSegments": [
    {
      "topic": "Introduction",
      "content": "Response content..."
    }
  ],
  "fullResponse": "Full response text",
  "systemPrompt": "System prompt used",
  "character": {
    "id": "guruji",
    "name": "Character Name",
    ...
  }
}
```

## Running the Server

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Production
npm start
```

## Environment Variables

Create a `.env` file:
```
PORT=3001
NODE_ENV=development
```

## Logging

The application uses console logging with structured prefixes:
- `[ChatController]` - Controller level logs
- `[ChatService]` - Service level logs
- `[MessageStore]` - Message store operations
- `[AI]` - AI/OpenAI operations
- `[ErrorHandler]` - Error logs

## Error Handling

All errors are caught and handled by the global error middleware, providing consistent error responses.

## Dependencies

The refactored code still imports from the original locations:
- `@/lib/*` - Utility functions
- `@/data/*` - Character data
- `@ai-sdk/*` - AI SDK
- `ai` - AI utilities

These can be migrated to the `src/` structure in future iterations. 
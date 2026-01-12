# API Design Architecture

## Overview

Brainlyx AI provides a comprehensive REST API that enables programmatic access to AI chat functionality, user management, and administrative features. The API is designed with developer experience, security, and scalability in mind.

## API Design Principles

### 1. RESTful Architecture
- **Resource-Based URLs**: Intuitive, hierarchical endpoint structure
- **HTTP Methods**: Standard GET, POST, PUT, DELETE operations
- **Stateless Communication**: No server-side session state
- **Hypermedia-Driven**: Links for discoverable navigation

### 2. Developer Experience
- **Consistent Response Format**: Standardized JSON responses
- **Comprehensive Documentation**: OpenAPI/Swagger specifications
- **Versioning Strategy**: URL-based API versioning
- **Error Handling**: Clear, actionable error messages

### 3. Security First
- **Authentication Required**: JWT-based authentication for all endpoints
- **Authorization Checks**: Role-based access control
- **Input Validation**: Comprehensive request sanitization
- **Rate Limiting**: Abuse prevention and fair usage

## API Endpoints Architecture

### Authentication Endpoints (`/api/auth`)

#### POST `/api/auth/check-user`
User authentication and token generation.

**Request:**
```typescript
POST /api/auth/check-user
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```typescript
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name"
  },
  "token": "jwt-token-here"
}
```

**Error Response:**
```typescript
{
  "error": "Invalid credentials",
  "code": "AUTH_INVALID"
}
```

### Chat System Endpoints (`/api/chat`)

#### POST `/api/chat/create-session`
Create a new chat session.

**Request:**
```typescript
POST /api/chat/create-session
Authorization: Bearer <jwt-token>

{
  "title": "My Chat Session",
  "metadata": {
    "model": "auto",
    "tags": ["work", "research"]
  }
}
```

**Response:**
```typescript
{
  "success": true,
  "session": {
    "id": "session-uuid",
    "title": "My Chat Session",
    "created_at": "2024-01-01T10:00:00Z",
    "user_id": "user-uuid"
  }
}
```

#### GET `/api/chat/sessions`
List user's chat sessions with pagination.

**Request:**
```typescript
GET /api/chat/sessions?page=1&limit=20&search=work
Authorization: Bearer <jwt-token>
```

**Response:**
```typescript
{
  "success": true,
  "sessions": [
    {
      "id": "session-uuid",
      "title": "Work Discussion",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T11:30:00Z",
      "message_count": 15
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### GET `/api/chat/sessions/[id]/messages`
Retrieve messages for a specific session.

**Request:**
```typescript
GET /api/chat/sessions/uuid-123/messages?page=1&limit=50
Authorization: Bearer <jwt-token>
```

**Response:**
```typescript
{
  "success": true,
  "messages": [
    {
      "id": "message-uuid",
      "role": "user",
      "content": "Hello, how can you help me?",
      "fileUrl": null,
      "fileName": null,
      "created_at": "2024-01-01T10:00:00Z"
    },
    {
      "id": "assistant-uuid",
      "role": "assistant",
      "content": "Here is a clear overview that should help...",
      "created_at": "2024-01-01T10:00:05Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "pages": 1
  }
}
```

#### POST `/api/chat/sessions/[id]/messages`
Send a message to a chat session (streaming or non-streaming).

**Request:**
```typescript
POST /api/chat/sessions/uuid-123/messages
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "message": "Explain quantum computing",
  "selectedModel": "auto", // or "ChatGPT", "Gemini", "Claude", "Groq"
  "agent": "You are a helpful AI assistant" // optional custom instructions
}
```

**Streaming Response:**
```typescript
// Server-Sent Events format
data: {"chunk": "Quantum", "done": false}
data: {"chunk": " computing", "done": false}
data: {"chunk": " is...", "done": false}
data: {"chunk": "", "done": true}
```

**Non-Streaming Response:**
```typescript
{
  "success": true,
  "reply": "Quantum computing is a revolutionary technology...",
  "usage": {
    "tokens": 150,
    "cost": 0.002,
    "provider": "openai"
  }
}
```

#### DELETE `/api/chat/messages/[id]`
Delete a specific message from chat history.

**Request:**
```typescript
DELETE /api/chat/messages/message-uuid
Authorization: Bearer <jwt-token>
```

**Response:**
```typescript
{
  "success": true,
  "message": "Message deleted successfully",
  "messageId": "message-uuid"
}
```

### File Management Endpoints (`/api/chat`)

#### POST `/api/chat/upload-file`
Upload and process files for AI analysis.

**Request:**
```typescript
POST /api/chat/upload-file
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

// Form data with 'file' field
```

**Response:**
```typescript
{
  "success": true,
  "file": {
    "url": "https://supabase-url/signed-url",
    "filename": "document.pdf",
    "fileType": "application/pdf",
    "fileSize": 2048576
  }
}
```

### Settings Endpoints (`/api/settings`)

#### GET `/api/settings/api-keys/status`
Check the validation status of user's API keys.

**Request:**
```typescript
GET /api/settings/api-keys/status
Authorization: Bearer <jwt-token>
```

**Response:**
```typescript
{
  "success": true,
  "keys": {
    "openai": {
      "present": true,
      "valid": true,
      "last_tested": "2024-01-01T10:00:00Z"
    },
    "gemini": {
      "present": true,
      "valid": false,
      "error": "Invalid API key"
    },
    "claude": {
      "present": false,
      "valid": false
    },
    "groq": {
      "present": true,
      "valid": true
    }
  }
}
```

### Admin Endpoints (`/api/admin`) - Admin Only

#### GET `/api/admin/users`
List all users with pagination and filtering.

**Request:**
```typescript
GET /api/admin/users?page=1&limit=50&search=user@example.com
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```typescript
{
  "success": true,
  "users": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "full_name": "User Name",
      "created_at": "2024-01-01T10:00:00Z",
      "last_active": "2024-01-01T15:30:00Z",
      "api_keys_count": 3,
      "sessions_count": 15
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
```

#### POST `/api/admin/block-user`
Block or unblock a user account.

**Request:**
```typescript
POST /api/admin/block-user
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "blocked": true,
  "reason": "Violation of terms of service"
}
```

**Response:**
```typescript
{
  "success": true,
  "message": "User blocked successfully",
  "userId": "user-uuid"
}
```

### Diagnostic Endpoints (`/api/chat/api`)

#### GET `/api/chat/api/diagnostic`
Run comprehensive system diagnostics.

**Request:**
```typescript
GET /api/chat/api/diagnostic
Authorization: Bearer <jwt-token>
```

**Response:**
```typescript
{
  "success": true,
  "diagnostics": {
    "database": {
      "status": "healthy",
      "response_time": 45,
      "connections": 5
    },
    "ai_providers": {
      "openai": {
        "status": "healthy",
        "response_time": 1200,
        "quota_remaining": 9500
      },
      "gemini": {
        "status": "healthy",
        "response_time": 800
      }
    },
    "system": {
      "memory_usage": 65,
      "cpu_usage": 30,
      "uptime": 86400
    }
  }
}
```

## API Response Standards

### Success Response Format
```typescript
interface ApiSuccessResponse<T = any> {
  success: true;
  [key: string]: T; // Additional response data
}
```

### Error Response Format
```typescript
interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  retry_after?: number; // For rate limiting
}
```

### Common HTTP Status Codes
- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Authentication and Authorization

### JWT Token Structure
```typescript
interface JwtPayload {
  user_id: string;
  email: string;
  role: 'user' | 'admin';
  exp: number;
  iat: number;
}
```

### Request Authentication
```typescript
// All protected endpoints require Authorization header
Authorization: Bearer <jwt-token>

// Admin endpoints require role: 'admin' in JWT payload
```

### Rate Limiting
```typescript
// Response headers for rate limit information
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200
Retry-After: 60  // When limit exceeded
```

## Streaming API Design

### Server-Sent Events (SSE)
```javascript
// Client-side implementation
const eventSource = new EventSource('/api/chat/sessions/uuid/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.done) {
    eventSource.close();
  } else {
    // Append chunk to UI
    appendToChat(data.chunk);
  }
};
```

### Streaming Response Format
```typescript
interface StreamingChunk {
  chunk: string;    // Text content chunk
  done: boolean;    // Whether this is the final chunk
  usage?: {        // Included in final chunk
    tokens: number;
    cost: number;
    provider: string;
  };
}
```

## API Versioning Strategy

### URL-Based Versioning
```
/api/v1/chat/sessions
/api/v1/auth/check-user
```

### Backward Compatibility
- New fields added as optional
- Deprecation warnings in response headers
- Graceful handling of unknown parameters
- Version-specific documentation

## Error Handling Patterns

### Validation Errors
```typescript
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "message": ["Message cannot be empty"],
    "selectedModel": ["Invalid model selection"]
  }
}
```

### Provider Errors
```typescript
{
  "success": false,
  "error": "AI service temporarily unavailable",
  "code": "PROVIDER_ERROR",
  "details": {
    "provider": "openai",
    "retry_after": 30
  }
}
```

### Rate Limiting
```typescript
{
  "success": false,
  "error": "Rate limit exceeded. Please wait before sending another message.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

## API Documentation

### OpenAPI Specification
```yaml
openapi: 3.0.3
info:
  title: Brainlyx AI API
  version: 1.0.0
  description: Multi-model AI platform API

servers:
  - url: https://api.brainlyx.ai
    description: Production server

security:
  - bearerAuth: []

paths:
  # API endpoints defined here...
```

### Interactive Documentation
- **Swagger UI**: Available at `/api/docs`
- **Redoc**: Alternative documentation viewer
- **Postman Collection**: Downloadable API testing collection

## SDKs and Client Libraries

### JavaScript/TypeScript SDK
```typescript
import { BrainlyxClient } from '@brainlyx/sdk';

const client = new BrainlyxClient({
  apiKey: 'your-jwt-token'
});

// Send a message
const response = await client.chat.sendMessage({
  sessionId: 'session-uuid',
  message: 'Hello!',
  model: 'auto'
});
```

### Python SDK
```python
from brainlyx import BrainlyxClient

client = BrainlyxClient(api_key='your-jwt-token')

# Send a message
response = client.chat.send_message(
    session_id='session-uuid',
    message='Hello!',
    model='auto'
)
```

## API Monitoring and Analytics

### Usage Tracking
- Request count and response times
- Token usage by provider
- Error rates and patterns
- Geographic usage distribution

### Performance Metrics
- API response latency percentiles
- Throughput and concurrency
- Resource utilization
- Cache hit rates

### Business Intelligence
- User engagement metrics
- Feature usage patterns
- Revenue tracking (if applicable)
- Growth and retention analytics

This API design provides a robust, scalable, and developer-friendly interface to Brainlyx AI's multi-model capabilities while maintaining security and performance standards.
# Data Flow Architecture

## Overview

This document describes the data flow patterns within the Brainlyx AI platform, detailing how information moves between components, external services, and storage systems.

## Primary Data Flows

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Frontend (Next.js)
    participant A as Auth API (/api/auth)
    participant S as Supabase Auth
    participant DB as Database

    U->>F: Login Request
    F->>A: POST /auth/check-user
    A->>S: Verify Credentials
    S->>DB: User Lookup
    DB-->>S: User Data
    S-->>A: JWT Token
    A-->>F: Auth Response
    F-->>U: Dashboard Access
```

**Data Elements:**
- User credentials (email/password)
- JWT tokens with user claims
- User profile information
- Session metadata

### 2. Chat Message Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Chat API
    participant R as AI Router
    participant P as AI Provider
    participant DB as Database

    U->>F: Send Message
    F->>C: POST /chat/sessions/[id]/messages
    C->>DB: Validate Session
    DB-->>C: Session OK
    C->>DB: Store User Message
    C->>R: Route to AI Provider
    R->>P: AI Request with Styling
    P-->>R: AI Response
    R-->>C: Processed Response
    C->>DB: Store AI Response
    C-->>F: Streaming Response
    F-->>U: Display Message
```

**Data Elements:**
- Message content and metadata
- Chat session identifiers
- AI provider responses
- Streaming data chunks
- Conversation history

### 3. AI Provider Selection Flow

```mermaid
flowchart TD
    A[User Message] --> B{Model Selected?}
    B -->|Yes| C[Validate API Key]
    B -->|No| D[Auto-Select Provider]

    C --> E{Key Valid?}
    E -->|Yes| F[Route to Provider]
    E -->|No| G[Error: Invalid Key]

    D --> H[Check Available Keys]
    H --> I{Keys Available?}
    I -->|Yes| J[Priority Selection]
    I -->|No| K[Error: No Keys]

    J --> L[Groq → OpenAI → Gemini → Claude]
    L --> M{Provider Available?}
    M -->|Yes| F
    M -->|No| N[Try Next Provider]
    N --> O{More Providers?}
    O -->|Yes| N
    O -->|No| P[Error: All Failed]
```

**Data Elements:**
- API key validation results
- Provider availability status
- Selection criteria (performance, cost, capabilities)
- Fallback attempt logs

## File Processing Flow

### Document Upload and Analysis

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase Storage
    participant A as Analysis API
    participant R as AI Router
    participant P as AI Provider
    participant DB as Database

    U->>F: Upload File
    F->>S: Store File
    S-->>F: Signed URL
    F->>A: Analyze Request
    A->>S: Download File
    S-->>A: File Content
    A->>R: Analysis Request
    R->>P: Process with AI
    P-->>R: Analysis Results
    R-->>A: Formatted Response
    A->>DB: Store Results
    A-->>F: Analysis Complete
    F-->>U: Display Results
```

**Data Elements:**
- File metadata (name, type, size)
- Signed URLs for secure access
- Binary file content
- Analysis results and insights
- Processing status updates

## Database Data Flow Patterns

### Core Entity Relationships

```mermaid
erDiagram
    user_profiles ||--o{ user_api_keys : owns
    user_profiles ||--o{ chat_sessions : creates
    chat_sessions ||--o{ chat_history : contains
    chat_sessions ||--o{ api_logs : generates
    user_profiles ||--o{ admin_users : "may be"
    admin_users ||--o{ api_logs : monitors

    user_profiles {
        uuid id PK
        string email
        string full_name
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }

    user_api_keys {
        uuid id PK
        uuid user_id FK
        string provider
        string encrypted_key
        boolean is_valid
        timestamp created_at
    }

    chat_sessions {
        uuid id PK
        uuid user_id FK
        string title
        jsonb metadata
        timestamp created_at
    }

    chat_history {
        uuid id PK
        uuid session_id FK
        uuid user_id FK
        string role
        text content
        jsonb metadata
        timestamp created_at
    }

    api_logs {
        uuid id PK
        uuid user_id FK
        string provider
        string endpoint
        integer tokens_used
        decimal cost
        timestamp created_at
    }

    admin_users {
        uuid id PK
        uuid user_id FK
        string role
        jsonb permissions
        timestamp created_at
    }
```

### Data Access Patterns

#### Read-Heavy Patterns
- **Chat History Retrieval**: Session-based message queries with pagination
- **User Profile Loading**: Authenticated user data for dashboard
- **API Key Validation**: Provider-specific key checks
- **Analytics Queries**: Usage statistics and performance metrics

#### Write Patterns
- **Message Storage**: High-frequency chat message inserts
- **Session Creation**: New conversation initialization
- **Audit Logging**: Security event and usage tracking
- **User Registration**: Profile and preference setup

#### Real-time Patterns
- **Live Chat Updates**: WebSocket-based message streaming
- **Status Monitoring**: User online/offline indicators
- **Admin Notifications**: System alerts and user activity

## External API Integration Flows

### AI Provider Communication

```mermaid
graph TD
    A[Brainlyx AI Router] --> B{Provider Type}
    B -->|OpenAI| C[OpenAI API]
    B -->|Google| D[Gemini API]
    B -->|Anthropic| E[Claude API]
    B -->|Groq| F[Groq API]

    C --> G[Request Formatting]
    D --> G
    E --> G
    F --> G

    G --> H[System Prompt Injection]
    H --> I[Brainlyx Styling]
    I --> J[Response Processing]
    J --> K[Error Handling]
    K --> L[Streaming/Non-Streaming]
    L --> M[Result Formatting]
    M --> N[Back to Router]
```

**Communication Protocols:**
- **RESTful APIs**: Standard HTTP/HTTPS with JSON payloads
- **Streaming Support**: Server-Sent Events for real-time responses
- **Error Handling**: Provider-specific error code mapping
- **Rate Limiting**: Request throttling and retry logic

### Supabase Integration

```mermaid
graph LR
    A[Application Layer] --> B[Supabase Client]
    B --> C{Operation Type}

    C -->|Auth| D[Supabase Auth]
    C -->|Database| E[Supabase PostgreSQL]
    C -->|Storage| F[Supabase Storage]
    C -->|Real-time| G[Supabase Realtime]

    D --> H[JWT Token Management]
    E --> I[SQL Query Execution]
    F --> J[File Upload/Download]
    G --> K[WebSocket Connections]

    H --> L[Session State]
    I --> M[Data Persistence]
    J --> N[File Access]
    K --> O[Live Updates]
```

## Security Data Flow

### Authentication Data Protection

```mermaid
flowchart TD
    A[User Login] --> B[Password Hashing]
    B --> C[JWT Generation]
    C --> D[Secure Cookie Storage]
    D --> E[Request Authorization]
    E --> F{Valid Token?}
    F -->|Yes| G[Access Granted]
    F -->|No| H[Access Denied]

    I[API Key Storage] --> J[AES Encryption]
    J --> K[Database Storage]
    K --> L[Key Retrieval]
    L --> M[Decryption]
    M --> N[Provider Authentication]
```

### Audit and Compliance

```mermaid
flowchart TD
    A[User Action] --> B[Event Capture]
    B --> C[Context Gathering]
    C --> D[Log Structuring]
    D --> E[Database Storage]
    E --> F[Real-time Monitoring]
    F --> G{Anomaly Detected?}
    G -->|Yes| H[Alert Generation]
    G -->|No| I[Normal Processing]

    J[Security Events] --> K[Compliance Reporting]
    K --> L[Audit Trail]
    L --> M[Regulatory Compliance]
```

## Performance Data Flow

### Caching Strategy

```mermaid
graph TD
    A[Incoming Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached Response]
    B -->|No| D[Process Request]
    D --> E[Database Query]
    E --> F[External API Call]
    F --> G[Response Generation]
    G --> H[Cache Storage]
    H --> I[Return Response]
```

### Monitoring Data Collection

```mermaid
flowchart TD
    A[Application Events] --> B[Metrics Collection]
    B --> C{Event Type}
    C -->|Performance| D[Response Time Tracking]
    C -->|Errors| E[Error Rate Monitoring]
    C -->|Usage| F[API Call Counting]
    C -->|Security| G[Threat Detection]

    D --> H[Time Series Database]
    E --> H
    F --> H
    G --> H

    H --> I[Dashboard Visualization]
    I --> J[Alert Generation]
    J --> K[Automated Response]
```

## Error Handling and Recovery

### Error Propagation Flow

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type}
    B -->|Network| C[Retry Logic]
    B -->|Rate Limit| D[Queue Request]
    B -->|Auth| E[Re-authenticate]
    B -->|Provider| F[Provider Fallback]

    C --> G{Success?}
    D --> G
    E --> G
    F --> G

    G -->|Yes| H[Continue Processing]
    G -->|No| I[User Notification]
    I --> J[Error Logging]
    J --> K[Admin Alert]
```

### Data Consistency Patterns

- **Transactional Boundaries**: Database operations within atomic transactions
- **Eventual Consistency**: Real-time updates with conflict resolution
- **Idempotent Operations**: Safe request retries without side effects
- **Graceful Degradation**: System continues operating with reduced functionality
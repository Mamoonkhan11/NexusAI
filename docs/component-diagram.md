# Component Diagram

## High-Level Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Brainlyx AI Platform                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │   Frontend      │    │   Backend API   │    │   Database      │     │
│  │   Layer         │    │   Layer         │    │   Layer         │     │
│  │                 │    │                 │    │                 │     │
│  │ • Next.js App   │    │ • API Routes    │    │ • Supabase      │     │
│  │ • React Comp.   │    │ • Auth Middleware│    │ • PostgreSQL    │     │
│  │ • UI Components │    │ • Streaming      │    │ • Real-time     │     │
│  │ • State Mgmt    │    │ • Error Handling │    │ • File Storage  │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │   AI Layer      │    │   Auth Layer    │    │   Admin Layer    │     │
│  │                 │    │                 │    │                 │     │
│  │ • AI Router     │    │ • Supabase Auth │    │ • User Mgmt     │     │
│  │ • Provider      │    │ • JWT Tokens    │    │ • Analytics      │     │
│  │ • Response Style│    │ • Role-based    │    │ • Monitoring     │     │
│  │ • Streaming     │    │ • Security      │    │ • Audit Logs     │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Component Relationships

### Frontend Components

```
Frontend Layer
├── Pages (Next.js App Router)
│   ├── Dashboard
│   │   ├── Chat Interface
│   │   │   ├── Chat Client Component
│   │   │   ├── Message Input
│   │   │   ├── Model Selector
│   │   │   ├── File Upload
│   │   │   └── Streaming Display
│   │   ├── API Keys Management
│   │   │   ├── Key Input Form
│   │   │   ├── Key Validation
│   │   │   └── Key Testing
│   │   └── Settings
│   │       ├── User Profile
│   │       └── Preferences
│   ├── Authentication
│   │   ├── Login Form
│   │   ├── Signup Form
│   │   ├── Password Reset
│   │   └── Admin Login
│   └── Admin Dashboard
│       ├── User Management
│       ├── Analytics Dashboard
│       └── System Settings
├── Shared Components
│   ├── UI Components (ShadCN)
│   ├── Layout Components
│   ├── Form Components
│   └── Feedback Components
└── Utilities
    ├── API Clients
    ├── State Management
    ├── Error Handling
    └── Type Definitions
```

### Backend API Components

```
Backend Layer
├── API Routes (/api)
│   ├── Authentication
│   │   ├── /auth/check-user
│   │   └── /auth/[...supabase]
│   ├── Chat System
│   │   ├── /chat/create-session
│   │   ├── /chat/sessions/[id]/messages
│   │   ├── /chat/messages/[id]
│   │   ├── /chat/update-message
│   │   └── /chat/sessions/[id]/delete
│   ├── File Management
│   │   └── /chat/upload-file
│   ├── Admin API
│   │   ├── /admin/users
│   │   ├── /admin/block-user
│   │   └── /admin/check-role
│   ├── Settings
│   │   └── /settings/api-keys/status
│   ├── Diagnostics
│   │   └── /chat/api/diagnostic
│   └── Test Keys
│       └── /test-keys
├── Middleware
│   ├── Authentication Middleware
│   ├── Rate Limiting
│   ├── CORS Configuration
│   └── Error Handling
└── Utilities
    ├── Database Clients
    ├── AI Provider Clients
    ├── Validation Functions
    └── Helper Functions
```

### AI Integration Layer

```
AI Layer
├── AI Router (lib/ai/router.ts)
│   ├── Provider Selection Logic
│   ├── Load Balancing
│   ├── Fallback Mechanisms
│   ├── Error Handling
│   └── Response Processing
├── System Prompt System (lib/ai/systemPrompt.ts)
│   ├── Brainlyx Response Style
│   ├── Custom Instructions Integration
│   ├── Response Validation
│   └── Prompt Generation
├── AI Provider Clients
│   ├── OpenAI Client (lib/ai/openaiClient.ts)
│   │   ├── GPT-4 Integration
│   │   ├── Streaming Support
│   │   ├── Error Handling
│   │   └── Rate Limiting
│   ├── Google Gemini Client (lib/ai/geminiClient.ts)
│   │   ├── Gemini Pro Integration
│   │   ├── Multimodal Support
│   │   └── API Key Management
│   ├── Anthropic Claude Client (lib/ai/claudeClient.ts)
│   │   ├── Claude 3 Integration
│   │   ├── Safety Features
│   │   └── Long Context Support
│   └── Groq Client (lib/ai/groqClient.ts)
│       ├── Llama 2 Integration
│       ├── Ultra-fast Inference
│       └── Optimized Performance
├── Model Selector (lib/ai/modelSelector.ts)
│   ├── Auto-selection Logic
│   ├── User Preference Handling
│   ├── Provider Availability Checks
│   └── Performance Optimization
└── Test Utilities (lib/ai/testKeys.ts)
    ├── API Key Validation
    ├── Provider Connectivity Tests
    └── Diagnostic Functions
```

### Database Layer

```
Database Layer (Supabase)
├── Core Tables
│   ├── user_profiles
│   │   ├── User information and preferences
│   │   ├── Profile settings and metadata
│   │   └── Usage statistics
│   ├── user_api_keys
│   │   ├── Encrypted API key storage
│   │   ├── Provider-specific keys
│   │   └── Key validation status
│   ├── chat_sessions
│   │   ├── Session metadata
│   │   ├── User association
│   │   └── Session configuration
│   ├── chat_history
│   │   ├── Message storage
│   │   ├── Role-based messages (user/assistant)
│   │   └── File attachments
│   ├── api_logs
│   │   ├── Usage tracking
│   │   ├── Provider statistics
│   │   └── Performance metrics
│   └── admin_users
│       ├── Administrative user roles
│       ├── Permission management
│       └── Audit logging
├── Real-time Subscriptions
│   ├── Live chat updates
│   ├── User status monitoring
│   └── System notifications
├── Storage Buckets
│   ├── chat-files
│   │   ├── User uploaded files
│   │   ├── Temporary signed URLs
│   │   └── File type validation
│   └── user-avatars (future)
└── Edge Functions (future)
    ├── Custom business logic
    ├── Advanced analytics
    └── Automated workflows
```

### Authentication & Security

```
Security Layer
├── Supabase Auth
│   ├── User Registration/Login
│   ├── Password Reset
│   ├── Email Verification
│   ├── JWT Token Management
│   └── Session Handling
├── Authorization
│   ├── Role-based Access Control
│   ├── Route Protection
│   ├── API Key Validation
│   └── Permission Checking
├── Encryption
│   ├── API Key Encryption
│   ├── Data at Rest Protection
│   ├── Secure Communication
│   └── Key Management
├── Rate Limiting
│   ├── Request Throttling
│   ├── Abuse Prevention
│   ├── Fair Usage Policies
│   └── Dynamic Limits
└── Audit & Monitoring
    ├── Security Event Logging
    ├── Access Pattern Analysis
    ├── Threat Detection
    └── Compliance Reporting
```

## Component Interaction Flow

### User Chat Flow

```
User Browser → Next.js Page → Chat Client Component
    ↓
API Route (/chat/sessions/[id]/messages) → Authentication Middleware
    ↓
Supabase Auth Check → Database Query (session validation)
    ↓
Message Storage → AI Router Selection
    ↓
Provider Selection → API Key Retrieval
    ↓
AI Provider Call → Response Processing
    ↓
Brainlyx Styling → Streaming Response
    ↓
Database Storage → Real-time Updates
    ↓
User Browser (display response)
```

### File Upload Flow

```
User Browser → File Upload Component → Supabase Storage
    ↓
Signed URL Generation → File Validation
    ↓
AI Analysis Request → Provider Selection
    ↓
File Processing → Response Formatting
    ↓
Result Storage → User Notification
```

### Admin Management Flow

```
Admin Browser → Admin Dashboard → API Routes
    ↓
Role Validation → Database Queries
    ↓
User Management → Analytics Processing
    ↓
Audit Logging → Real-time Updates
```

## Dependencies and Coupling

### Tight Coupling (High Cohesion)
- AI Router ↔ Provider Clients (protocol standardization)
- System Prompt ↔ AI Router (response consistency)
- Database ↔ API Routes (data access patterns)
- Auth ↔ All Components (security boundary)

### Loose Coupling (Interface-based)
- Frontend ↔ Backend (REST API contracts)
- AI Providers ↔ Platform (standardized interfaces)
- Admin Functions ↔ Core Features (permission boundaries)
- Storage ↔ Processing (URL-based access)

## Component Resilience

### Failure Boundaries
- AI Provider failures → Fallback to alternative providers
- Database unavailability → Graceful degradation
- Authentication failures → Clear error messages
- File upload failures → Fallback to text-only mode

### Circuit Breakers
- Rate limit exceeded → Queue requests
- Service timeouts → Fail fast with retry options
- API key invalid → Clear user guidance
- Network issues → Offline mode capabilities

### Monitoring Points
- Component health checks
- Performance metrics collection
- Error rate monitoring
- Resource usage tracking

# NexusAI

<p align="center">
  <img src="./demo.png" alt="NexusAI - Bridging AI Obstacles with Vionys" width="100%" />
  <br>
  <em>Powered by Vionys</em>
</p>

---

## 🚀 Check the Software

Experience NexusAI live: **[nexusai.com](https://nexus-ai-nx.vercel.app/)**

Try the intelligent AI assistant powered by Vionys - bridging obstacles in AI technology.

## About NexusAI

**NexusAI** is a revolutionary AI platform by **Vionys** that bridges obstacles in AI technology, making advanced artificial intelligence accessible, secure, and seamlessly integrated into your workflow.

**Vionys** aims to bridge over obstacles in AI technology by providing:
- **Unified Access** to multiple AI models through a single interface
- **Privacy-First Architecture** that puts you in control of your data
- **Seamless Integration** that eliminates technical barriers
- **Enterprise-Grade Security** with end-to-end encryption
- **Real-Time Performance** that matches the speed of modern AI demands

Experience the future of intelligent automation where complex AI interactions become simple, secure, and intuitive.

## Features

### Multi-Model AI Support
- **OpenAI GPT-4** - Industry-leading conversational AI
- **Google Gemini** - Multimodal AI with advanced reasoning
- **Anthropic Claude** - Safe and helpful AI assistant
- **Groq** - Ultra-fast inference with LPU technology
- **Dynamic model switching** - Choose the best AI for your task

### Privacy-First Architecture
- **Bring Your Own Keys (BYOK)** - Complete control over your API keys
- **Zero data retention** - Your conversations stay private
- **Encrypted communication** - Secure end-to-end connections
- **Self-hosted option** - Run entirely on your infrastructure

### Modern User Interface
- **Responsive design** - Works perfectly on all devices
- **Dark theme optimized** - Easy on the eyes for extended use
- **Intuitive chat interface** - Seamless conversation flow
- **Real-time responses** - Instant AI feedback
- **Session management** - Organized conversation history

### Admin Dashboard
- **User management** - Comprehensive admin controls
- **Usage analytics** - Track API consumption and costs
- **System monitoring** - Performance metrics and logs
- **User activity tracking** - Monitor platform engagement
- **Admin role management** - Granular permission controls

### Performance & Reliability
- **Real-time processing** - Instant AI responses
- **Optimized API routing** - Smart load balancing
- **Error handling** - Graceful failure recovery
- **Caching system** - Improved response times
- **Rate limiting** - Prevent API abuse

## Demo

<p align="center">
  <img src="./demo2.png" alt="NexusAI Demo" width="80%" />
</p>

Experience NexusAI in action:
- **Interactive chat** with multiple AI models
- **Seamless model switching** during conversations
- **Real-time streaming responses**
- **Advanced settings** and customization options

## Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for database and authentication)
- API keys for your preferred AI providers

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mamoonkhan11/NexusAI.git
   cd NexusAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # This will create a .env.local file with all required variables
   npm run setup-env
   ```

   Then edit `.env.local` with your actual credentials:

   ```env
   # Required: Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Optional: AI API Keys (for full functionality)
   OPENAI_API_KEY=sk-your-openai-api-key
   GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
   GROQ_API_KEY=gsk_your-groq-api-key
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run setup
   ```

5. **Create Admin User**
   ```bash
   # For development (creates default admin)
   npm run create-default-admin

   # Or grant admin to existing user
   npm run create-admin your-email@example.com
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Admin login: [http://localhost:3000/admin-login](http://localhost:3000/admin-login)

## Usage

### For Regular Users

1. **Sign Up/Login** - Create your account or sign in
2. **Configure API Keys** - Add your AI provider API keys in settings
3. **Start Chatting** - Select your preferred AI model and begin conversation
4. **Switch Models** - Change AI models mid-conversation for different tasks

### For Administrators

1. **Access Admin Dashboard** - Use admin login credentials
2. **User Management** - View and manage user accounts
3. **Monitor Usage** - Track API consumption and system performance
4. **System Configuration** - Adjust platform settings and limits

## API Support

NexusAI supports the following AI providers:

| Provider | Models | Key Features |
|----------|--------|--------------|
| **OpenAI** | GPT-4, GPT-3.5 | Conversational AI, Code Generation |
| **Google** | Gemini Pro, Gemini Ultra | Multimodal, Advanced Reasoning |
| **Anthropic** | Claude 3, Claude 2 | Safe AI, Long Context |
| **Groq** | Mixtral, Llama 2 | Ultra-fast Inference |

### API Key Configuration

Configure your API keys in the dashboard settings:
- **OpenAI**: Get from [platform.openai.com](https://platform.openai.com)
- **Google**: Get from [makersuite.google.com](https://makersuite.google.com)
- **Anthropic**: Get from [console.anthropic.com](https://console.anthropic.com)
- **Groq**: Get from [console.groq.com](https://console.groq.com)

## Project Structure

```
nexusai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   ├── dashboard/                # User dashboard
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # ShadCN UI components
│   ├── admin-login-form.tsx      # Admin authentication
│   ├── chat-input.tsx            # Chat interface
│   └── feedback-form.tsx         # User feedback
├── lib/                          # Utility libraries
│   ├── ai/                       # AI model integrations
│   │   ├── openaiClient.ts       # OpenAI integration
│   │   ├── geminiClient.ts       # Google Gemini
│   │   ├── claudeClient.ts       # Anthropic Claude
│   │   └── groqClient.ts         # Groq integration
│   ├── supabase/                 # Database utilities
│   └── utils.ts                  # Helper functions
├── scripts/                      # Setup and utility scripts
│   ├── create-admin.js           # Admin user creation
│   ├── setup-admin.js            # Admin setup checker
│   └── setup-database.js         # Database initialization
├── supabase/                     # Database migrations
│   └── migrations/               # SQL migration files
└── public/                       # Static assets
```

## Available Scripts

```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run setup           # Initialize database
npm run setup-env       # Create .env.local template
npm run setup-admin     # Check admin configuration
npm run create-admin    # Grant admin privileges to user
npm run test-admin-login # Test admin authentication
npm run lint            # Run ESLint
```

## Security & Privacy

- **Zero Data Retention**: Conversations are not stored on our servers
- **API Key Encryption**: Your keys are encrypted and never logged
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Audit Logging**: Admin monitoring of system activities

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Vionys** - Bridging obstacles in AI technology
- **Supabase** - Backend infrastructure and authentication
- **Vercel** - Deployment and hosting platform
- **OpenAI, Google, Anthropic, Groq** - AI model providers
- **Next.js & React** - Modern web framework
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Accessible component library

---

<p align="center">
  <strong>Made with ❤️ by Vionys - Bridging obstacles in AI technology</strong>
</p>


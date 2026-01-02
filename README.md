# NexusAI

```{=html}
<p align="center">
```
`<img src="./demo.png" alt="NexusAI - Bridging AI Obstacles with Vionys" width="100%" />`{=html}
`<br>`{=html} `<em>`{=html}Powered by Vionys`</em>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## About NexusAI

**NexusAI** is a revolutionary AI platform by **Vionys** that bridges
obstacles in AI technology, making advanced artificial intelligence
accessible, secure, and seamlessly integrated into your workflow.

**Vionys** aims to bridge over obstacles in AI technology by
providing: - **Unified Access** to multiple AI models through a single
interface - **Privacy-First Architecture** that puts you in control of
your data - **Seamless Integration** that eliminates technical
barriers - **Enterprise-Grade Security** with end-to-end encryption -
**Real-Time Performance** that matches the speed of modern AI demands

Experience the future of intelligent automation where complex AI
interactions become simple, secure, and intuitive.

## Features

### Multi-Model AI Support

-   **OpenAI GPT-4** - Industry-leading conversational AI
-   **Google Gemini** - Multimodal AI with advanced reasoning
-   **Anthropic Claude** - Safe and helpful AI assistant
-   **Groq** - Ultra-fast inference with LPU technology
-   **Dynamic model switching** - Choose the best AI for your task

### Privacy-First Architecture

-   **Bring Your Own Keys (BYOK)** - Complete control over your API keys
-   **Zero data retention** - Your conversations stay private
-   **Encrypted communication** - Secure end-to-end connections
-   **Self-hosted option** - Run entirely on your infrastructure

### Modern User Interface

-   **Responsive design** - Works perfectly on all devices
-   **Dark theme optimized** - Easy on the eyes for extended use
-   **Intuitive chat interface** - Seamless conversation flow
-   **Real-time responses** - Instant AI feedback
-   **Session management** - Organized conversation history

### Admin Dashboard

-   **User management** - Comprehensive admin controls
-   **Usage analytics** - Track API consumption and costs
-   **System monitoring** - Performance metrics and logs
-   **User activity tracking** - Monitor platform engagement
-   **Admin role management** - Granular permission controls

### Performance & Reliability

-   **Real-time processing** - Instant AI responses
-   **Optimized API routing** - Smart load balancing
-   **Error handling** - Graceful failure recovery
-   **Caching system** - Improved response times
-   **Rate limiting** - Prevent API abuse

## Demo

```{=html}
<p align="center">
```
`<img src="./demo2.png" alt="NexusAI Demo" width="80%" />`{=html}
```{=html}
</p>
```
Experience NexusAI in action: - **Interactive chat** with multiple AI
models - **Seamless model switching** during conversations - **Real-time
streaming responses** - **Advanced settings** and customization options

## Installation

### Prerequisites

-   Node.js 18+ and npm
-   Supabase account (for database and authentication)
-   API keys for your preferred AI providers

### Quick Setup

1.  **Clone the repository**

    ``` bash
    git clone https://github.com/Mamoonkhan11/NexusAI.git
    cd NexusAI
    ```

2.  **Install dependencies**

    ``` bash
    npm install
    ```

3.  **Environment Configuration**

    ``` bash
    # This will create a .env.local file with all required variables
    npm run setup-env
    ```

    Then edit `.env.local` with your actual credentials:

    ``` env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

    OPENAI_API_KEY=sk-your-openai-api-key
    GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key
    ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
    GROQ_API_KEY=gsk_your-groq-api-key
    ```

4.  **Database Setup**

    ``` bash
    npm run setup
    ```

5.  **Create Admin User**

    ``` bash
    npm run create-default-admin
    npm run create-admin your-email@example.com
    ```

6.  **Start Development Server**

    ``` bash
    npm run dev
    ```

7.  **Access the Application**

    -   http://localhost:3000\
    -   Admin: http://localhost:3000/admin-login

## Usage

### Regular Users

1.  Sign Up / Login\
2.  Configure API keys\
3.  Start chatting\
4.  Switch models

### Admins

1.  Admin login\
2.  Manage users\
3.  Monitor API usage\
4.  View feedback

## API Support

  Provider    Models           Features
  ----------- ---------------- -------------------
  OpenAI      GPT-4            Conversational AI
  Google      Gemini           Multimodal
  Anthropic   Claude           Safe AI
  Groq        Mixtral, Llama   Ultra-fast

## Project Structure

(Structure content...)

## Scripts

(npm scripts...)

## Security & Privacy

(Security details...)

## Contributing

(Contributing instructions...)

## License

MIT License

**Made with ❤️ by Vionys**
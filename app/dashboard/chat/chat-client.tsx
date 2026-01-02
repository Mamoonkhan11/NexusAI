"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Bot,
  ChevronDown,
  File,
  Home,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  lastUserMessage?: string
}

interface ChatSession {
  id: string
  title: string
  timestamp: string
  created_at: string
}

interface ChatPageClientProps {
  initialMessages: Message[]
  initialSessions: ChatSession[]
  selectedSessionId: string | null
}

export function ChatPageClient({
  initialMessages,
  initialSessions,
  selectedSessionId
}: ChatPageClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(initialSessions)
  const [activeChatId, setActiveChatId] = useState<string | null>(selectedSessionId)
  const [selectedAgent, setSelectedAgent] = useState("General Assistant")
  const [selectedModel, setSelectedModel] = useState("chatgpt")

  const models = [
    { id: "chatgpt", name: "ChatGPT", icon: "🤖" },
    { id: "claude", name: "Claude", icon: "🧠" },
    { id: "gemini", name: "Gemini", icon: "💎" },
    { id: "grok", name: "Grok", icon: "🚀" },
  ]
  const [isLoading, setIsLoading] = useState(false)
  const [availableProviders, setAvailableProviders] = useState({
    groq: false,
    openai: false,
    claude: false,
    gemini: false
  })

  const bottomRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Load sessions on mount if not provided
  useEffect(() => {
    if (initialSessions.length === 0) {
      loadSessions()
    }
  }, [])

  // Load available providers on mount
  useEffect(() => {
    const loadAvailableProviders = async () => {
      try {
        const res = await fetch('/api/settings/api-keys/status', {
          cache: 'no-store'
        })
        const data = await res.json()
        if (data.success) {
          setAvailableProviders(data.keys)
        }
      } catch (error) {
        // Fallback to localStorage check
        const providers = {
          groq: !!(typeof window !== 'undefined' && localStorage.getItem('groq_key')),
          openai: !!(typeof window !== 'undefined' && localStorage.getItem('openai_key')),
          claude: !!(typeof window !== 'undefined' && localStorage.getItem('claude_key')),
          gemini: !!(typeof window !== 'undefined' && localStorage.getItem('gemini_key'))
        }
        setAvailableProviders(providers)
      }
    }
    loadAvailableProviders()
  }, [])

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    try { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) } catch {}
  }, [messages, isLoading])

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/chat/sessions?t=' + Date.now(), {
        cache: 'no-store'
      })
      const json = await res.json()
      if (json?.success && Array.isArray(json.sessions)) {
        setChatSessions(json.sessions)
      }
    } catch (err) {
      console.error('Failed to load sessions:', err)
    }
  }

  const checkApiKeyAvailability = (model: string) => {
    if (model === "Auto") return true
    const providerMap: Record<string, string> = {
      "ChatGPT": "openai",
      "Gemini": "gemini",
      "Claude": "claude",
      "Groq": "groq",
      "llama3-70b-8192": "groq",
      "mixtral-8x7b-32768": "groq",
      "gpt-4o-mini": "openai",
      "gpt-4o": "openai",
      "claude-3-haiku-20240307": "claude",
      "gemini-1.5-flash": "gemini"
    }
    const provider = providerMap[model] as keyof typeof availableProviders
    return !!(provider && availableProviders[provider])
  }

  // Session management functions
  const handleSessionSelect = async (sessionId: string) => {
    setActiveChatId(sessionId)
    setMessages([]) // Clear messages immediately

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages?t=${Date.now()}&cb=${Math.random()}`, {
        cache: 'no-store',
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      })
      const json = await res.json()
      if (json?.success && Array.isArray(json.messages)) {
        setMessages(json.messages)
      } else {
        setMessages([])
      }
    } catch (err) {
      console.error('Failed to load session messages:', err)
      setMessages([])
    }
  }

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chat/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "" }),
      })
      const json = await res.json()
      if (json?.success && json?.session) {
        const newSession = json.session
        setActiveChatId(newSession.id)
        setMessages([])
        setChatSessions((prev) => [newSession, ...prev])

        // Update URL without full page reload
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.searchParams.set('session', newSession.id)
          window.history.replaceState({}, '', url.toString())
        }
      } else {
        toast.error("Failed to create new chat")
      }
    } catch (err) {
      console.error("Failed to create new chat:", err)
      toast.error("Failed to create new chat")
    }
  }

  const handleSessionDelete = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/delete`, {
        method: "DELETE",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      })
      const json = await res.json()

      if (json?.success) {
        // Remove from local state immediately
        setChatSessions((prev) => prev.filter((s) => s.id !== sessionId))

        // If this was the active session, clear it
        if (activeChatId === sessionId) {
          setActiveChatId(null)
          setMessages([])
        }

        toast.success("Chat session deleted permanently")
      } else {
        toast.error("Failed to delete session")
      }
    } catch (err) {
      console.error("Failed to delete session:", err)
      toast.error("Failed to delete session")
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        // Remove message from local state to prevent reappearance
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
        toast.success("Message deleted")
      } else {
        toast.error("Failed to delete message")
      }
    } catch (err) {
      console.error("Failed to delete message:", err)
      toast.error("Failed to delete message")
    }
  }

  const handleSendMessage = async (formData: FormData) => {
    const message = formData.get("message") as string

    // Ensure we have an active session
    let currentSessionId = activeChatId
    if (!currentSessionId) {
      await handleNewChat()
      currentSessionId = activeChatId
      if (!currentSessionId) return // Failed to create session
    }

    if (!message.trim()) {
      toast.error("Empty message", { description: "Please enter a message." })
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message
    }

    // Clear input immediately and set loading
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(`/api/chat/sessions/${currentSessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          selectedModel,
          agent: selectedAgent
        })
      })

      if (response.ok) {
        const result = await response.json()

        if (result.error) {
          // Handle specific error types
          if (result.error.includes("does not have credits") ||
              result.error.includes("insufficient")) {
            toast.error("Insufficient Credits", {
              description: "This API key does not have credits. Please upgrade billing or try a different provider."
            })
          } else if (result.error.includes("Invalid API key")) {
            toast.error("Invalid API Key", {
              description: "Please check your API keys in settings."
            })
          } else {
            toast.error("Chat Error", { description: result.error })
          }
          // Remove the user message on error
          setMessages((prev) => prev.slice(0, -1))
          setInput(message) // Restore input on error
        } else if (result.success && result.messages) {
          // Update messages with the server response
          setMessages(result.messages)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error("Request Failed", {
          description: errorData.error || "An error occurred while sending your message."
        })
        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1))
        setInput(message) // Restore input on error
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast.error("Network Error", {
        description: "Failed to send message. Please check your connection and try again."
      })
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1))
      setInput(message) // Restore input on error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className="w-64 border-r border-white/20 backdrop-blur-xl bg-slate-900/60 flex flex-col h-full">
          {/* Model Selection at Top Left */}
          <div className="p-3 border-b border-white/20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-white/90 hover:text-white hover:bg-white/15 border border-white/20 backdrop-blur-md justify-start"
                >
                  <span className="text-lg">{models.find(m => m.id === selectedModel)?.icon}</span>
                  <span className="font-medium">{models.find(m => m.id === selectedModel)?.name}</span>
                  <ChevronDown className="size-4 text-white/60 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 bg-slate-900/95 backdrop-blur-xl border-white/20 text-white"
              >
                {models.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className="cursor-pointer hover:bg-white/15 focus:bg-white/15 focus:text-white"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-lg">{model.icon}</span>
                      <span>{model.name}</span>
                      {selectedModel === model.id && <span className="ml-auto text-cyan-400">✓</span>}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="p-3 border-b border-white/20 flex items-center justify-between">
            <h2 className="text-white/90 font-semibold">Chat Sessions</h2>
            <Button
              size="icon"
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/20"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="p-3 border-b border-white/20">
            <Button
              onClick={handleNewChat}
              className="w-full justify-start gap-2 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <MessageSquare className="size-4" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {chatSessions.map((session) => (
                <div key={session.id} className="relative group">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 text-left text-white/80 hover:text-white hover:bg-white/15 pr-8",
                      activeChatId === session.id && "bg-white/15 text-white border border-cyan-400/40 shadow-lg",
                    )}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <MessageSquare className="size-4 text-cyan-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {session.title}
                      </div>
                      <div className="text-xs text-white/60 truncate">
                        {session.timestamp}
                      </div>
                    </div>
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Delete this chat session and all its messages permanently?")) {
                        handleSessionDelete(session.id)
                      }
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}

              {chatSessions.length === 0 && (
                <div className="text-center text-white/60 py-8">
                  <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat sessions yet</p>
                  <p className="text-xs">Start a new conversation</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Home Button */}
          <div className="p-3 border-t border-white/20">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-white/80 hover:text-white hover:bg-white/15"
              onClick={() => (window.location.href = "/dashboard")}
            >
              <Home className="size-5 text-cyan-400" />
              Home
            </Button>
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-2 border-b border-white/20 backdrop-blur-xl bg-slate-900/60 flex items-center justify-between">
          {!isSidebarOpen && (
            <Button
              size="icon"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MessageSquare className="size-5" />
            </Button>
          )}

          <div className={cn("flex-1", !isSidebarOpen && "ml-2")}>
            {/* Empty space since model selection moved to sidebar */}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn(
                "group flex gap-3 p-4 rounded-lg backdrop-blur-md animate-fade-in",
                message.role === "user"
                  ? "bg-cyan-500/10 border border-cyan-400/20 ml-auto max-w-[80%]"
                  : "bg-slate-800/50 border border-white/10 max-w-[80%]"
              )}>
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  message.role === "user"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-white/10 text-white/80"
                )}>
                  {message.role === "user" ? (
                    <User className="size-4" />
                  ) : (
                    <Bot className="size-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-white/60">
                      {message.role === "user" ? "You" : "Assistant"}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-opacity h-6 w-6"
                      onClick={() => {
                        if (confirm("Delete this message permanently?")) {
                          handleDeleteMessage(message.id)
                        }
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                  <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                  {message.fileUrl && (
                    <div className="mt-2 p-2 bg-slate-700/50 rounded border border-slate-600/50">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <File className="size-4" />
                        <span>{message.fileName}</span>
                        <span className="text-xs text-white/60">({message.fileType})</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* AI Thinking Indicator */}
            {isLoading && (
              <div className="group flex gap-3 p-4 rounded-lg backdrop-blur-md bg-slate-800/50 border border-white/10 max-w-[80%] animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white/80">
                  <Bot className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/60 mb-1">
                    Assistant
                  </div>
                  <div className="text-white/90 flex items-center gap-1">
                    <span>Thinking</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-white/20 backdrop-blur-xl bg-slate-900/60">
          <form ref={formRef} onSubmit={(e) => {
            e.preventDefault()
            if (input.trim() && !isLoading) {
              handleSendMessage(new FormData(formRef.current!))
            }
          }} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Textarea
                  name="message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[60px] resize-none bg-slate-800/50 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400/50 pr-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (input.trim() && !isLoading) {
                        handleSendMessage(new FormData(formRef.current!))
                      }
                    }
                  }}
                />
                {input && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 text-white/60 hover:text-white"
                    onClick={() => setInput("")}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
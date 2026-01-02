"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { Send, Plus, MessageSquare, Sparkles, User, X, Home, ChevronDown, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

type ChatSession = {
  id: string
  title: string
  timestamp: string
}

type UserKeys = {
  openai: boolean
  claude: boolean
  gemini: boolean
  groq: boolean
}

type ModelOption = {
  name: string
  provider: string
  model: string
  enabled: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState("GPT-4")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [userKeys, setUserKeys] = useState<UserKeys>({ openai: false, claude: false, gemini: false, groq: false })
  const [models, setModels] = useState<ModelOption[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load API keys and initialize models
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const response = await fetch('/api/settings/api-keys/status', {
          cache: 'no-store'
        })
        const data = await response.json()
        if (data.success) {
          setUserKeys(data.keys)
        }
      } catch (error) {
        console.error('Failed to load API keys:', error)
      }
    }
    loadApiKeys()
  }, [])

  // Initialize models based on API keys
  useEffect(() => {
    const modelOptions: ModelOption[] = [
      { name: "Auto", provider: "auto", model: "auto", enabled: true },
      { name: "Groq", provider: "groq", model: "llama3-8b-8192", enabled: userKeys.groq },
      { name: "ChatGPT", provider: "openai", model: "gpt-4", enabled: userKeys.openai },
      { name: "Claude", provider: "claude", model: "claude-3-haiku-20240307", enabled: userKeys.claude },
      { name: "Gemini", provider: "gemini", model: "gemini-1.5-flash", enabled: userKeys.gemini },
    ]
    setModels(modelOptions)

    // If current selected model is disabled (and not Auto), select the first enabled one
    const currentModel = modelOptions.find(m => m.name === selectedAgent)
    if (selectedAgent !== "Auto" && (!currentModel?.enabled)) {
      const firstEnabled = modelOptions.find(m => m.enabled && m.name !== "Auto")
      if (firstEnabled) {
        setSelectedAgent(firstEnabled.name)
      } else {
        // If no specific models are enabled, select Auto
        setSelectedAgent("Auto")
      }
    }
  }, [userKeys])

  // Load chat sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch('/api/chat/sessions', {
          cache: 'no-store'
        })
        const data = await response.json()
        if (data.success) {
          setChatSessions(data.sessions)

          // Check URL for session parameter
          const urlParams = new URLSearchParams(window.location.search)
          const sessionParam = urlParams.get('session')

          if (sessionParam && data.sessions.find((s: any) => s.id === sessionParam)) {
            setActiveChatId(sessionParam)
            // Load messages for the session
            const msgResponse = await fetch(`/api/chat/sessions/${sessionParam}/messages`, {
              cache: 'no-store'
            })
            const msgData = await msgResponse.json()
            if (msgData.success) {
              setMessages(msgData.messages)
            }
          } else if (data.sessions.length > 0 && !activeChatId) {
            // Always load the most recent session (first in the list since ordered by created_at DESC)
            const mostRecentSession = data.sessions[0]
            setActiveChatId(mostRecentSession.id)
            // Load messages for the most recent session
            const msgResponse = await fetch(`/api/chat/sessions/${mostRecentSession.id}/messages`, {
              cache: 'no-store'
            })
            const msgData = await msgResponse.json()
            if (msgData.success) {
              setMessages(msgData.messages)
            }
            // Update URL to reflect the loaded session
            window.history.replaceState({}, '', `/dashboard/chat?session=${mostRecentSession.id}`)
          }
        }
      } catch (error) {
        console.error('Failed to load sessions:', error)
      }
    }
    loadSessions()
  }, [])

  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Also scroll to bottom on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || !activeChatId) return

    const selectedModel = models.find(m => m.name === selectedAgent)
    if (!selectedModel?.enabled) {
      alert("Please select an enabled model or add the required API key.")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch(`/api/chat/sessions/${activeChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          selectedModel: selectedAgent,
          agent: selectedModel.provider,
        }),
      })

      const data = await response.json()

      if (data.success && data.messages) {
        setMessages(data.messages)
      } else {
        // Check for specific error types and show appropriate toasts
        const errorMessage = data.error || 'Failed to get AI response'
        console.log('Error message from backend:', errorMessage)

        // Comprehensive insufficient credits detection
        const lowerError = errorMessage.toLowerCase()
        const isInsufficientCredits = lowerError.includes('insufficient') ||
            lowerError.includes('credit balance is too low') ||
            lowerError.includes('does not have credits') ||
            lowerError.includes('billing') ||
            lowerError.includes('upgrade or purchase credits') ||
            lowerError.includes('no active billing') ||
            lowerError.includes('anthropic api') ||
            lowerError.includes('claude') ||
            (lowerError.includes('credit') &&
             (lowerError.includes('balance') ||
              lowerError.includes('quota') ||
              lowerError.includes('low') ||
              lowerError.includes('too low')))

        console.log('Is insufficient credits error?', isInsufficientCredits, 'Error:', errorMessage)

        if (isInsufficientCredits) {
          // If already in Auto mode and still getting insufficient credits, show error
          if (selectedAgent === "Auto") {
            toast.error("All Providers Insufficient", {
              description: "All available AI providers have insufficient credits. Please add credits to your API keys.",
              action: {
                label: "Go to Settings",
                onClick: () => window.location.href = "/dashboard/api-keys"
              }
            })
            setIsTyping(false)
            return
          }

          // Switch to Auto mode and retry
          toast.error("Insufficient Credits", {
            description: `The ${selectedAgent} model doesn't have enough credits. Switching to Auto mode to try other providers.`,
            duration: 5000,
          })

          // Switch to Auto mode for automatic provider selection and retry
          setSelectedAgent("Auto")

          // Retry the request with Auto mode
          console.log("Retrying with Auto mode due to insufficient credits")
          try {
            const retryResponse = await fetch(`/api/chat/sessions/${activeChatId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: input,
                selectedModel: "Auto", // Use Auto mode for retry
                agent: "auto"
              }),
            })

            const retryData = await retryResponse.json()

            if (retryData.success && retryData.messages) {
              setMessages(retryData.messages)
              return // Success, don't show error
            } else {
              // Retry also failed, show final error
              throw new Error(retryData.error || 'Failed to get AI response with Auto mode')
            }
          } catch (retryError) {
            console.error('Retry with Auto mode also failed:', retryError)
            // Show final error after retry failed
            toast.error("All Providers Failed", {
              description: "Both the selected model and automatic fallback failed. Please check your API keys.",
              action: {
                label: "Go to Settings",
                onClick: () => window.location.href = "/dashboard/api-keys"
              }
            })
          }

          setIsTyping(false)
          return
        } else {
          toast.error("Chat Error", {
            description: errorMessage
          })
          // For other errors, still throw to show in chat
          throw new Error(errorMessage)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }


  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Delete this chat session and all its messages permanently? This action cannot be undone.")) return

    // Store the session ID to prevent reappearance
    const deletedId = sessionId

    try {
      // Immediately remove from UI state
      setChatSessions(prev => prev.filter(s => s.id !== deletedId))

      // If this was the active session, clear it and navigate away
      if (activeChatId === deletedId) {
        setActiveChatId(null)
        setMessages([])
        // Clear URL parameter
        window.history.replaceState({}, '', '/dashboard/chat')
      }

      const response = await fetch(`/api/chat/sessions/${deletedId}/delete`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete session')
      }

      // Don't reload sessions - trust the deletion was successful
      // The session should be permanently removed from the database

    } catch (error) {
      console.error('Failed to delete session:', error)

      // On error, show an alert but don't restore the session in UI
      // The session might still be deleted server-side
      alert('Failed to delete session. Please refresh the page to see current state.')

      // Optionally reload sessions to check current state
      const sessionsResponse = await fetch('/api/chat/sessions?t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      const sessionsData = await sessionsResponse.json()
      if (sessionsData.success) {
        setChatSessions(sessionsData.sessions)
      }
    }
  }

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chat/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: "" }),
      })

      const data = await response.json()
      if (data.success && data.session) {
        // Update URL with new session ID
        window.history.replaceState({}, '', `/dashboard/chat?session=${data.session.id}`)

        // Update state
        setActiveChatId(data.session.id)
        setMessages([])
        setInput("")

        // Reload sessions to include the new one
        const sessionsResponse = await fetch('/api/chat/sessions', {
          cache: 'no-store'
        })
        const sessionsData = await sessionsResponse.json()
        if (sessionsData.success) {
          setChatSessions(sessionsData.sessions)
        }
      }
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const handleSessionClick = async (sessionId: string) => {
    setActiveChatId(sessionId)

    // Update URL
    window.history.replaceState({}, '', `/dashboard/chat?session=${sessionId}`)

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        cache: 'no-store'
      })
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  return (
    <div className="flex h-screen gap-0 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Left Sidebar - Chat History */}
      {isSidebarOpen && (
        <aside className="w-64 border-r border-white/20 backdrop-blur-xl bg-slate-900/60 flex flex-col">
          <div className="p-3 border-b border-white/20 flex items-center justify-between">
            <Button
              className="flex-1 justify-start gap-2 bg-gradient-to-r from-cyan-600/40 to-blue-600/40 hover:from-cyan-600/60 hover:to-blue-600/60 border border-cyan-400/40 text-white font-medium shadow-lg"
              onClick={handleNewChat}
            >
              <Plus className="size-4" />
              New Chat
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="ml-2 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>


          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {chatSessions.map((session) => (
                <div key={session.id} className="relative group">
                  <button
                    onClick={() => handleSessionClick(session.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg transition-all",
                      "hover:bg-white/15 text-white/80 hover:text-white",
                      activeChatId === session.id && "bg-white/15 text-white border border-cyan-400/40 shadow-lg",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="size-4 mt-0.5 shrink-0 text-cyan-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-white/60 mt-0.5">{session.timestamp}</p>
                      </div>
                    </div>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSession(session.id)
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-opacity"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-white/20">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-white/80 hover:text-white hover:bg-white/15"
              onClick={() => (window.location.href = "/dashboard")}
            >
              <Home className="size-5 text-cyan-400" />
              <span>Home</span>
            </Button>
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-2 border-b border-white/20 backdrop-blur-xl bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 text-white/90 hover:text-white hover:bg-white/15 border border-white/20 backdrop-blur-md"
                >
                  <Sparkles className="size-4 text-cyan-400" />
                  <span className="font-medium">{selectedAgent}</span>
                  <ChevronDown className="size-4 text-white/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 bg-slate-900/95 backdrop-blur-xl border-white/20 text-white"
              >
                {models.map((model) => (
                  <DropdownMenuItem
                    key={model.name}
                    onClick={() => model.enabled && setSelectedAgent(model.name)}
                    className={cn(
                      "cursor-pointer hover:bg-white/15 focus:bg-white/15 focus:text-white",
                      !model.enabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Sparkles className="size-4 text-cyan-400" />
                      <span>{model.name}</span>
                      {selectedAgent === model.name && <span className="ml-auto text-cyan-400">✓</span>}
                      {!model.enabled && <span className="ml-auto text-xs text-red-400">No key</span>}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="size-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-md border-2 border-cyan-400/50 flex items-center justify-center shadow-xl">
                      <Sparkles className="size-12 text-cyan-300" />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-4xl font-bold text-white">NexusAI</h1>
                      <p className="text-lg text-cyan-300 font-medium">Intelligent Assistant</p>
                    </div>
                  </div>
                  <div className="space-y-3 max-w-lg">
                    <h3 className="text-xl font-semibold text-white">Start a conversation</h3>
                    <p className="text-white/70 text-base leading-relaxed">
                      Ask me anything! I can help with coding, brainstorming, writing, research, or just chat about any topic.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <span className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30">
                        💬 Chat
                      </span>
                      <span className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30">
                        💻 Code
                      </span>
                      <span className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30">
                        📝 Writing
                      </span>
                      <span className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30">
                        🔍 Research
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-4">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 items-start animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
                        message.role === "user" && "justify-end"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="size-9 shrink-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-md border-2 border-cyan-400/50 shadow-lg">
                          <AvatarFallback className="bg-transparent text-cyan-300">
                            <Sparkles className="size-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "rounded-2xl px-5 py-3.5 max-w-[75%] backdrop-blur-xl shadow-xl",
                          message.role === "user"
                            ? "bg-gradient-to-br from-cyan-600/50 to-blue-600/50 border border-cyan-400/50 text-white"
                            : "bg-slate-800/80 border border-white/30 text-white",
                        )}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="size-9 shrink-0 bg-slate-700/60 backdrop-blur-md border border-white/30 shadow-lg">
                          <AvatarFallback className="bg-transparent text-white">
                            <User className="size-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 items-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <Avatar className="size-9 shrink-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-md border-2 border-cyan-400/50 shadow-lg">
                        <AvatarFallback className="bg-transparent text-cyan-300">
                          <Sparkles className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl px-5 py-4 backdrop-blur-xl bg-slate-800/80 border border-white/30 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <span className="size-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="size-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="size-2.5 rounded-full bg-cyan-400 animate-bounce" />
                          </div>
                          <span className="text-sm text-cyan-300 font-medium">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/20 backdrop-blur-xl bg-slate-900/70 p-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 rounded-2xl backdrop-blur-xl bg-slate-800/60 border border-white/30 p-2 focus-within:border-cyan-400/60 transition-all shadow-xl">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 min-h-[48px] max-h-32 resize-none border-0 bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-3"
                disabled={isTyping}
              />

              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="shrink-0 size-11 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-0 disabled:opacity-50 transition-all hover:scale-105 shadow-lg"
              >
                {isTyping ? <Spinner className="size-5" /> : <Send className="size-5" />}
              </Button>
            </div>

            <p className="text-xs text-white/50 mt-2 text-center">Press Enter to send, Shift + Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  )
}
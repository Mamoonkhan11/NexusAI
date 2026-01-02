"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatSession {
  id: string
  title: string
  timestamp: string
  created_at: string
}

interface ChatSidebarProps {
  chatSessions: ChatSession[]
  activeChatId: string | null
  onSessionSelect: (sessionId: string) => void
  onNewChat: () => void
  onSessionDelete: (sessionId: string) => void
  isOpen: boolean
}

export function ChatSidebar({
  chatSessions,
  activeChatId,
  onSessionSelect,
  onNewChat,
  onSessionDelete,
  isOpen
}: ChatSidebarProps) {
  if (!isOpen) return null

  return (
    <aside className="w-64 border-r border-white/20 backdrop-blur-xl bg-slate-900/60 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/20 flex items-center justify-between">
        <h2 className="text-white/90 font-semibold">Chat Sessions</h2>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b border-white/20">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Plus className="size-4" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
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
                onClick={() => onSessionSelect(session.id)}
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

              {/* Delete Button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm("Delete this chat session and all its messages permanently?")) {
                    onSessionDelete(session.id)
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
    </aside>
  )
}

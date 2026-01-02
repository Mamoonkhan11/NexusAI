"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, X } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (formData: FormData) => Promise<void>
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading || disabled) return

    const formData = new FormData()
    formData.append("message", input)

    try {
      await onSendMessage(formData)
      setInput("") // Clear input after successful send
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Failed to send message:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="p-4 border-t border-white/20 backdrop-blur-xl bg-slate-900/60">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              name="message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[60px] resize-none bg-slate-800/50 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400/50 pr-10"
              onKeyDown={handleKeyDown}
              disabled={isLoading || disabled}
            />
            {input && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 text-white/60 hover:text-white"
                onClick={() => setInput("")}
                disabled={isLoading || disabled}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 disabled:opacity-50"
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
  )
}

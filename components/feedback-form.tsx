"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, Send, User, Mail } from "lucide-react"
import { toast } from "sonner"
import { useTransition } from "react"

export default function FeedbackForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fullName.trim(),
            email: email.trim(),
            message: message.trim()
          }),
        })

        if (response.ok) {
          toast.success("Thank you for your feedback!")
          setFullName("")
          setEmail("")
          setMessage("")
        } else {
          toast.error("Failed to submit feedback. Please try again.")
        }
      } catch (error) {
        toast.error("Failed to submit feedback. Please try again.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full-name" className="text-slate-200 font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name
          </Label>
          <Input
            id="full-name"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400 rounded-lg"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200 font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400 rounded-lg"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback-message" className="text-slate-200 font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Your Message
        </Label>
        <Textarea
          id="feedback-message"
          placeholder="Tell us what you think about NexusAI..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400 rounded-lg min-h-[100px] resize-none"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={isPending || !fullName.trim() || !email.trim() || !message.trim()}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-colors shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          "Sending..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Feedback
          </>
        )}
      </Button>
    </form>
  )
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendMessage } from "@/app/dashboard/chat/actions"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sessionId = id
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("chat_history")
      .select("id, role, content, created_at")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Failed to fetch session messages:", error)
      return NextResponse.json({ error: "Failed to load messages" }, { status: 500 })
    }

    // Parse file content from JSON if present
    const messages = (data || []).map((row: any) => {
      let content = row.content
      let fileUrl: string | undefined = undefined
      let fileName: string | undefined = undefined
      let fileType: string | undefined = undefined

      try {
        const parsed = JSON.parse(row.content)
        if (Array.isArray(parsed)) {
          // Find file part if present
          const filePart = parsed.find((p: any) => p.type === "file")
          const textPart = parsed.find((p: any) => p.type === "text")
          if (filePart) {
            fileUrl = filePart.url
            fileName = filePart.filename
            fileType = filePart.fileType
          }
          if (textPart) content = textPart.text
        }
      } catch {
        // content is plain string
      }

      return {
        id: row.id,
        role: row.role,
        content,
        fileUrl,
        fileName,
        fileType,
        created_at: row.created_at
      }
    })

    return NextResponse.json({ success: true, messages })
  } catch (err) {
    console.error("Session messages error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sessionId = id
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const { message, selectedModel, agent } = await request.json()

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
    }

    // Save user message to chat_history
    const { error: insertError } = await supabase
      .from("chat_history")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role: "user",
        content: message
      })

    if (insertError) {
      console.error("Failed to save user message:", insertError)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    // Get all messages for this session to send to AI
    const { data: existingMessages, error: messagesError } = await supabase
      .from("chat_history")
      .select("role, content")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("Failed to fetch messages for AI:", messagesError)
      return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
    }

    // Call AI service
    const formData = new FormData()
    formData.append("message", message)
    formData.append("history", JSON.stringify(existingMessages || []))
    formData.append("selectedModel", selectedModel || "Auto")
    formData.append("systemMessage", agent || "You are a versatile AI assistant capable of helping with various tasks.")

    const aiResponse = await sendMessage(formData)

    if (aiResponse.error) {
      // Remove the user message we just added since AI failed
      await supabase
        .from("chat_history")
        .delete()
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .eq("role", "user")
        .eq("content", message)
        .order("created_at", { ascending: false })
        .limit(1)

      return NextResponse.json({ error: aiResponse.error }, { status: 400 })
    }

    // Save AI response to chat_history
    const { error: aiInsertError } = await supabase
      .from("chat_history")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role: "assistant",
        content: aiResponse.reply
      })

    if (aiInsertError) {
      console.error("Failed to save AI response:", aiInsertError)
      // Don't return error here as the AI call succeeded, just log it
    }

    // Fetch updated messages
    const { data: updatedMessages, error: updatedError } = await supabase
      .from("chat_history")
      .select("id, role, content, created_at")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (updatedError) {
      console.error("Failed to fetch updated messages:", updatedError)
      return NextResponse.json({ error: "Failed to refresh messages" }, { status: 500 })
    }

    // Parse messages for response
    const messages = (updatedMessages || []).map((row: any) => {
      let content = row.content
      let fileUrl: string | undefined = undefined
      let fileName: string | undefined = undefined
      let fileType: string | undefined = undefined

      try {
        const parsed = JSON.parse(row.content)
        if (Array.isArray(parsed)) {
          const filePart = parsed.find((p: any) => p.type === "file")
          const textPart = parsed.find((p: any) => p.type === "text")
          if (filePart) {
            fileUrl = filePart.url
            fileName = filePart.filename
            fileType = filePart.fileType
          }
          if (textPart) content = textPart.text
        }
      } catch {
        // content is plain string
      }

      return {
        id: row.id,
        role: row.role,
        content,
        fileUrl,
        fileName,
        fileType,
        created_at: row.created_at
      }
    })

    return NextResponse.json({ success: true, messages })
  } catch (err) {
    console.error("Send message error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


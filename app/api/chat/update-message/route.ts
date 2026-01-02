import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, content, sessionId } = body
    
    if (!id || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Invalid payload: id and content (non-empty string) are required" }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    // Check if ID is a UUID format (database ID) or timestamp (temporary client ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    let existingMessage: any = null
    let fetchError: any = null

    // First, try to find by UUID if it's a valid UUID
    if (isUUID) {
      const query = supabase
        .from("chat_history")
        .select("id, user_id, role, content, session_id")
        .eq("id", id)
        .eq("user_id", user.id)
      
      // If sessionId is provided, also filter by session for better accuracy
      if (sessionId) {
        query.eq("session_id", sessionId)
      }
      
      const { data, error } = await query.single()
      
      existingMessage = data
      fetchError = error
    }

    // If not found by UUID or ID is not a UUID (temporary client ID), 
    // try to find by session_id and most recent user message
    if (!existingMessage) {
      if (sessionId) {
        // Find the most recent user message in this session
        const { data: messages, error: searchError } = await supabase
          .from("chat_history")
          .select("id, user_id, role, content, session_id, created_at")
          .eq("user_id", user.id)
          .eq("session_id", sessionId)
          .eq("role", "user")
          .order("created_at", { ascending: false })
          .limit(1)
        
        if (!searchError && messages && messages.length > 0) {
          existingMessage = messages[0]
          console.log("Found message by session_id and most recent user message")
        } else {
          fetchError = searchError
        }
      } else {
        // Fallback: find most recent user message (less reliable)
        const { data: messages, error: searchError } = await supabase
          .from("chat_history")
          .select("id, user_id, role, content, session_id, created_at")
          .eq("user_id", user.id)
          .eq("role", "user")
          .order("created_at", { ascending: false })
          .limit(1)
        
        if (!searchError && messages && messages.length > 0) {
          existingMessage = messages[0]
          console.log("Found message by most recent user message (fallback)")
        } else {
          fetchError = searchError || new Error("Message not found")
        }
      }
    }

    if (fetchError || !existingMessage) {
      console.error("Message not found or access denied:", fetchError)
      console.error("Searched ID:", id, "Is UUID:", isUUID, "SessionId:", sessionId)
      console.error("Fetch error details:", fetchError)
      
      // Provide more helpful error message
      let errorMessage = "Message not found or access denied"
      if (fetchError?.code === 'PGRST116') {
        errorMessage = "Message not found in database. It may have been deleted or the ID is incorrect."
      } else if (fetchError?.message) {
        errorMessage = `Database error: ${fetchError.message}`
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: fetchError?.message || "Could not locate message to update. Please try refreshing the page.",
        debug: {
          searchedId: id,
          isUUID: isUUID,
          sessionId: sessionId,
          errorCode: fetchError?.code
        }
      }, { status: 404 })
    }

    // Only allow updating user messages (not assistant messages)
    if (existingMessage.role !== "user") {
      return NextResponse.json({ error: "Only user messages can be updated" }, { status: 403 })
    }

    // Use the actual database ID from the found message (not the client-provided ID which might be a timestamp)
    const messageDbId = existingMessage.id

    // Update the message using the database ID
    const { data, error } = await supabase
      .from("chat_history")
      .update({ content: content.trim() })
      .eq("id", messageDbId)
      .eq("user_id", user.id)
      .select()

    if (error) {
      console.error("Failed to update chat message:", error)
      return NextResponse.json({ 
        error: "Failed to update message", 
        details: error.message 
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Message was not updated" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (err) {
    console.error("Update message error:", err)
    return NextResponse.json({ 
      error: "Server error", 
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 })
  }
}



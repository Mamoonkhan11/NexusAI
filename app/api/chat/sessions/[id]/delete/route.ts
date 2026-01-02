import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sessionId = id
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    // Ensure session belongs to user
    const { data: session, error: fetchErr } = await supabase
      .from("chat_sessions")
      .select("id, user_id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (fetchErr || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log(`Deleting session ${sessionId} and all associated chat_history records for user ${user.id}`)

    // Step 1: Delete all chat_history records for this session
    // This ensures deletion even if cascade isn't configured
    const { data: deletedHistory, error: historyError } = await supabase
      .from("chat_history")
      .delete()
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .select()

    if (historyError) {
      console.error("Failed to delete chat_history:", historyError)
      return NextResponse.json({ 
        error: "Failed to delete chat history", 
        details: historyError.message 
      }, { status: 500 })
    }

    const deletedHistoryCount = deletedHistory?.length || 0
    console.log(`Deleted ${deletedHistoryCount} chat_history records for session ${sessionId}`)

    // Step 2: Delete the session itself from chat_sessions
    // First check if session still exists
    const { data: checkSession, error: checkError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      console.error("Failed to check session existence:", checkError)
      return NextResponse.json({
        error: "Failed to check session",
        details: checkError.message
      }, { status: 500 })
    }

    let sessionDeleted = false
    if (checkSession) {
      // Session still exists, try to delete it
      const { error: sessionError } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", user.id)

      if (sessionError) {
        console.error("Failed to delete chat_sessions:", sessionError)
        return NextResponse.json({
          error: "Failed to delete session",
          details: sessionError.message
        }, { status: 500 })
      }
      sessionDeleted = true
    } else {
      // Session already deleted or doesn't exist
      console.log(`Session ${sessionId} was already deleted or not found`)
      sessionDeleted = true // Consider this successful
    }

    console.log(`Successfully processed deletion for session ${sessionId} (history deleted: ${deletedHistoryCount}, session deleted: ${sessionDeleted})`)

    // Verify chat_history deletion
    const { data: remainingHistory, error: verifyError } = await supabase
      .from("chat_history")
      .select("id")
      .eq("session_id", sessionId)
      .limit(1)

    if (verifyError) {
      console.warn("Could not verify chat_history deletion:", verifyError)
    } else if (remainingHistory && remainingHistory.length > 0) {
      console.error(`Warning: ${remainingHistory.length} chat_history records still exist for session ${sessionId}`)
      // Try to delete again
      await supabase
        .from("chat_history")
        .delete()
        .eq("session_id", sessionId)
    }

    return NextResponse.json({
      success: true,
      message: "Session and all messages deleted permanently",
      deletedHistoryCount: deletedHistoryCount,
      deletedSession: sessionDeleted
    })
  } catch (err) {
    console.error("Delete session error:", err)
    return NextResponse.json({ 
      error: "Server error", 
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 })
  }
}



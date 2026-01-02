import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const messageId = id

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    // Verify message belongs to user and get session info
    const { data: message, error: fetchError } = await supabase
      .from("chat_history")
      .select("id, session_id, role")
      .eq("id", messageId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Delete the message
    const { error: deleteError } = await supabase
      .from("chat_history")
      .delete()
      .eq("id", messageId)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Failed to delete message:", deleteError)
      return NextResponse.json({
        error: "Failed to delete message",
        details: deleteError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
      messageId: messageId
    })
  } catch (err) {
    console.error("Delete message error:", err)
    return NextResponse.json({
      error: "Server error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 })
  }
}

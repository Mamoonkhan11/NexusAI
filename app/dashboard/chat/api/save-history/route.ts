import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { saveChatHistory } from "../../actions"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages data" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await saveChatHistory(user.id, messages)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving chat history:", error)
    return NextResponse.json({ error: "Failed to save chat history" }, { status: 500 })
  }
}

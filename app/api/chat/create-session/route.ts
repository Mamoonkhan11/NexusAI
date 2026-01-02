import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    const { title } = await request.json().catch(() => ({ title: "" }))

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id, title: title || "New Chat" })
      .select()

    if (error) {
      console.error("Failed to create chat session:", error)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: data?.[0] })
  } catch (err) {
    console.error("Create session error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}



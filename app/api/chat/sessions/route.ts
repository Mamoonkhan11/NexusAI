import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch sessions:", error)
      return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 })
    }

    // Build sessions list; do not perform server-side locale formatting for timestamps.
    // Return raw `created_at` so the client can format it in the user's local timezone.
    const sessions = await Promise.all(
      (data || []).map(async (session: any) => {
        let title = session.title || "New Chat"

        // If title is empty, get first user message as title
        if (!session.title || session.title.trim() === "") {
          const { data: firstMessage } = await supabase
            .from("chat_history")
            .select("content")
            .eq("session_id", session.id)
            .eq("role", "user")
            .order("created_at", { ascending: true })
            .limit(1)
            .single()

          if (firstMessage) {
            try {
              const parsed = JSON.parse(firstMessage.content)
              if (Array.isArray(parsed)) {
                const textPart = parsed.find((p: any) => p.type === "text")
                if (textPart?.text) {
                  title = textPart.text.slice(0, 50)
                }
              } else {
                title = firstMessage.content.slice(0, 50)
              }
            } catch {
              title = firstMessage.content.slice(0, 50)
            }
          }
        }

        return {
          id: session.id,
          title,
          // Provide raw ISO timestamp; the client will format this for the user's timezone.
          created_at: session.created_at
        }
      })
    )

    const response = NextResponse.json({
      success: true,
      sessions,
      timestamp: new Date().toISOString(),
      cache_bust: Date.now()
    })

    // Prevent caching - multiple headers for maximum compatibility
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")
    response.headers.set("CDN-Cache-Control", "no-store")
    response.headers.set("Vercel-CDN-Cache-Control", "no-store")

    return response
  } catch (err) {
    console.error("Sessions error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}



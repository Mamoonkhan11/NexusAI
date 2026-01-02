import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Parse the request body
    const body = await request.json()
    const { name, email, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid field types" },
        { status: 400 }
      )
    }

    if (name.trim().length === 0 || email.trim().length === 0 || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Fields cannot be empty" },
        { status: 400 }
      )
    }

    // Basic email validation
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Insert feedback into the database
    const { error } = await supabase
      .from("user_feedback")
      .insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      })

    if (error) {
      console.error("Error inserting feedback:", error)
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

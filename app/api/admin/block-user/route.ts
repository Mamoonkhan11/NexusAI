import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // First authenticate the user making the request
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (user.user_metadata?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { user_id, block } = body

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    try {
      const adminSupabase = await createAdminClient()

      const { error } = await adminSupabase.auth.admin.updateUserById(user_id, {
        user_metadata: {
          blocked: block
        }
      })

      if (error) {
        console.error("Error updating user:", error)
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    } catch (supabaseError) {
      console.error("Supabase configuration error:", supabaseError)

      // Check if it's a configuration error
      if (supabaseError instanceof Error && supabaseError.message.includes("credentials not configured")) {
        return NextResponse.json(
          { error: "System not configured. Please contact administrator." },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Block user API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        message: "No user logged in"
      })
    }

    // Check if the requesting user has admin privileges
    if (user.user_metadata?.role !== "admin") {
      return NextResponse.json({
        authenticated: true,
        userId: user.id,
        email: user.email,
        isAdmin: false,
        message: "User does not have admin privileges"
      })
    }

    // Since we've already verified the user has admin role from their token metadata,
    // we don't need to query the admin API again. The user is authenticated and has admin privileges.
    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      email: user.email,
      userMetadata: user.user_metadata,
      userMetadataRole: user.user_metadata?.role,
      effectiveRole: user.user_metadata?.role,
      isAdmin: true,
      message: "User has admin privileges"
    })
  } catch (error) {
    console.error("Role check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

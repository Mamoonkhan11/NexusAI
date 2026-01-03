import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { testApiKeys } from "@/app/dashboard/settings/testApiKeys"

export async function POST(request: NextRequest) {
  try {
    // Verify authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const result = await testApiKeys()
    return NextResponse.json(result)
  } catch (err) {
    console.error("Error testing API keys:", err)
    return NextResponse.json(
      { openai: "error", groq: "error", gemini: "error", claude: "error" },
      { status: 500 }
    )
  }
}



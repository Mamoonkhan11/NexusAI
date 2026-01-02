import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    // Check which API keys are configured for the user
    const { data: keys, error } = await supabase
      .from("user_api_keys")
      .select("openai_key, gemini_key, claude_key, groq_key")
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Failed to fetch API keys:", error)
      return NextResponse.json({ error: "Failed to check API keys" }, { status: 500 })
    }

    // Create status object
    const keyStatus = {
      groq: !!(keys?.groq_key && keys.groq_key.trim() !== ''),
      openai: !!(keys?.openai_key && keys.openai_key.trim() !== ''),
      claude: !!(keys?.claude_key && keys.claude_key.trim() !== ''),
      gemini: !!(keys?.gemini_key && keys.gemini_key.trim() !== '')
    }

    return NextResponse.json({
      success: true,
      keys: keyStatus
    })
  } catch (err) {
    console.error("API key status error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

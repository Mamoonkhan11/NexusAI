import { NextResponse } from "next/server"
import { testApiKeys } from "@/app/dashboard/settings/testApiKeys"

export async function GET() {
  try {
    const result = await testApiKeys()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { openai: "error", groq: "error", gemini: "error", claude: "error" },
      { status: 500 }
    )
  }
}



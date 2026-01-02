"use server"

import { createClient } from "@/lib/supabase/server"
import { diagnoseApiKeys } from "../../actions"

export async function GET() {
  try {
    const result = await diagnoseApiKeys()

    return Response.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error("Diagnostic error:", error)
    return Response.json({
      success: false,
      error: error.message || "Unknown error"
    }, { status: 500 })
  }
}

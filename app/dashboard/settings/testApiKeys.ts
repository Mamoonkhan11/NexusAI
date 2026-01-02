"use server"

import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/supabase/getUser"
import { testOpenAIKey, testGroqKey, testGeminiKey, testClaudeKey } from "@/lib/ai/testKeys"

type KeyStatus = "working" | "invalid" | "error" | "missing"

export async function testApiKeys() {
  // Resolve current user
  const user = await getUser()
  if (!user) {
    return {
      openai: "missing" as KeyStatus,
      groq: "missing" as KeyStatus,
      gemini: "missing" as KeyStatus,
    }
  }

  const supabase = await createClient()

  // Fetch stored keys for the user. We never return keys to the client.
  const { data, error } = await supabase
    .from("user_api_keys")
    .select("openai_key, groq_key, gemini_key, claude_key")
    .eq("user_id", user.id)
    .single()

  // If table not found or other DB error, gracefully fallback to environment variables
  let openaiKey: string | null = null
  let groqKey: string | null = null
  let geminiKey: string | null = null
  let claudeKey: string | null = null

  if (error && error.code !== "PGRST116") {
    // On DB error, try environment variables as a fallback (do not expose them)
    openaiKey = process.env.OPENAI_API_KEY || null
    groqKey = process.env.GROQ_API_KEY || null
    geminiKey = process.env.GEMINI_API_KEY || null
    claudeKey = process.env.CLAUDE_API_KEY || null
  } else {
    openaiKey = data?.openai_key ?? null
    groqKey = data?.groq_key ?? null
    geminiKey = data?.gemini_key ?? null
    claudeKey = data?.claude_key ?? null
  }

  const resolveStatus = async (key: string | null, tester: (k: string) => Promise<KeyStatus>) => {
    if (!key || key.trim() === "") return "missing" as KeyStatus
    try {
      return await tester(key)
    } catch {
      return "error" as KeyStatus
    }
  }

  const [openai, groq, gemini, claude] = await Promise.all([
    resolveStatus(openaiKey, testOpenAIKey),
    resolveStatus(groqKey, testGroqKey),
    resolveStatus(geminiKey, testGeminiKey),
    resolveStatus(claudeKey, testClaudeKey),
  ])

  return { openai, groq, gemini, claude }
}



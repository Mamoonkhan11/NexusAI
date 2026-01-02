export async function testOpenAIKey(key: string): Promise<"working" | "invalid" | "error"> {
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })

    if (res.ok) return "working"
    return "invalid"
  } catch (err) {
    return "error"
  }
}

export async function testGroqKey(key: string): Promise<"working" | "invalid" | "error"> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })

    if (res.ok) return "working"
    return "invalid"
  } catch (err) {
    return "error"
  }
}

export async function testGeminiKey(key: string): Promise<"working" | "invalid" | "error"> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`
    const res = await fetch(url, {
      method: "GET",
    })

    if (res.ok) return "working"
    return "invalid"
  } catch (err) {
    return "error"
  }
}

export async function testClaudeKey(key: string): Promise<"working" | "invalid" | "error"> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "test" }],
      }),
    })

    if (res.ok) return "working"
    
    // Check if it's an authentication error (401/403) vs other errors
    if (res.status === 401 || res.status === 403) {
      return "invalid"
    }
    
    // For other errors, try to check if it's actually an auth issue
    try {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = (errorData.error?.message || '').toLowerCase()
      if (errorMessage.includes('authentication') || 
          errorMessage.includes('invalid api key') ||
          errorMessage.includes('invalid_api_key') ||
          errorMessage.includes('api key not found')) {
        return "invalid"
      }
    } catch {}
    
    // For other errors (like model not found, etc.), still mark as invalid for safety
    // but log the error for debugging
    console.warn("Claude API test returned non-200 status:", res.status)
    return "invalid"
  } catch (err) {
    console.error("Error testing Claude key:", err)
    return "error"
  }
}



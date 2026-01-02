"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/supabase/getUser"

export async function getExistingApiKeysMetadata() {
  try {
    const user = await getUser()
    if (!user) return null

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_api_keys")
      .select("openai_key, gemini_key, claude_key, groq_key")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") { // PGRST116 is "not found"
      console.error("Error fetching API keys:", error)
      // Fallback to environment variables for testing - check they exist and are not empty
      return {
        hasOpenAI: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ''),
        hasGemini: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
        hasClaude: !!(process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY.trim() !== ''),
        hasGroq: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== ''),
      }
    }

    // Return only metadata about which keys exist, never the actual key values
    return {
      hasOpenAI: !!data?.openai_key,
      hasGemini: !!data?.gemini_key,
      hasClaude: !!data?.claude_key,
      hasGroq: !!data?.groq_key,
    }
  } catch (supabaseError) {
    console.log("Supabase not configured, checking environment variables")
    // Fallback to environment variables for testing - check they exist and are not empty
    return {
      hasOpenAI: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ''),
      hasGemini: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
      hasClaude: !!(process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY.trim() !== ''),
      hasGroq: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== ''),
    }
  }
}

export async function verifyApiKey(provider: string, apiKey: string) {
  if (!apiKey || apiKey.trim() === "") {
    return { valid: false, error: "API key is empty" }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for verification

  try {
    switch (provider) {
      case "openai":
        // Test OpenAI key with a minimal request
        const openaiResponse = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          signal: controller.signal
        })

        console.log(`[OpenAI Key Validation] Status: ${openaiResponse.status}`);

        if (openaiResponse.ok) {
          return { valid: true }
        }
        
        // Parse error response
        let openaiErrorMessage = '';
        let openaiErrorType = '';
        try {
          const errorData = await openaiResponse.json().catch(() => ({}));
          openaiErrorMessage = errorData.error?.message || openaiResponse.statusText || '';
          openaiErrorType = errorData.error?.type || errorData.error?.code || '';
        } catch {
          openaiErrorMessage = openaiResponse.statusText || '';
        }
        
        const lowerOpenAIMessage = openaiErrorMessage.toLowerCase();
        const lowerOpenAIType = openaiErrorType.toLowerCase();
        
        // 401 → Invalid key
        if (openaiResponse.status === 401) {
          console.log(`[OpenAI Key Validation] Invalid key (401): ${openaiErrorMessage}`);
          return { valid: false, error: "Your API key format is invalid." }
        }
        
        // 403 → Could be no billing OR no model access
        if (openaiResponse.status === 403) {
          const isInsufficientCredit = 
            lowerOpenAIMessage.includes('insufficient_quota') ||
            lowerOpenAIMessage.includes('billing_not_active') ||
            lowerOpenAIMessage.includes('no active billing') ||
            lowerOpenAIType === 'insufficient_quota' ||
            lowerOpenAIType === 'billing_error';
          
          if (isInsufficientCredit) {
            console.log(`[OpenAI Key Validation] No billing/credits (403): ${openaiErrorMessage}`);
            return { valid: false, error: "Your API key has no credits or billing is disabled." }
          }
          console.log(`[OpenAI Key Validation] Access denied (403): ${openaiErrorMessage}`);
          return { valid: false, error: "Your API key has no credits or billing is disabled." }
        }
        
        // 429 → Rate limit (retryable) - key is valid
        if (openaiResponse.status === 429) {
          console.log(`[OpenAI Key Validation] Rate limit (429): ${openaiErrorMessage}`);
          return { valid: true }
        }
        
        // 400 → Wrong endpoint
        if (openaiResponse.status === 400) {
          console.log(`[OpenAI Key Validation] Bad request (400): ${openaiErrorMessage}`);
          return { valid: false, error: `Wrong endpoint: ${openaiErrorMessage || 'Bad request'}` }
        }
        
        console.log(`[OpenAI Key Validation] Other error (${openaiResponse.status}): ${openaiErrorMessage}`);
        return { valid: false, error: `API error (${openaiResponse.status}): ${openaiErrorMessage || 'Unknown error'}` }

      case "gemini":
        // Test Gemini key
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          signal: controller.signal
        })

        if (geminiResponse.ok) {
          return { valid: true }
        } else if (geminiResponse.status === 400) {
          return { valid: false, error: "Invalid API key" }
        } else {
          return { valid: false, error: `API error: ${geminiResponse.status}` }
        }

      case "claude":
        // Test Claude key
        const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307", // Safe default: cheaper model
            max_tokens: 1,
            messages: [{ role: "user", content: "test" }]
          }),
          signal: controller.signal
        })

        console.log(`[Claude Key Validation] Status: ${claudeResponse.status}`);

        if (claudeResponse.ok) {
          return { valid: true }
        }
        
        // Parse error response to get more details
        let errorMessage = '';
        let errorType = '';
        try {
          const errorData = await claudeResponse.json().catch(() => ({}));
          errorMessage = errorData.error?.message || claudeResponse.statusText || '';
          errorType = errorData.error?.type || '';
        } catch {
          errorMessage = claudeResponse.statusText || '';
        }
        
        const lowerMessage = errorMessage.toLowerCase();
        const lowerType = errorType.toLowerCase();
        
        // Check for insufficient credit/billing errors (403 could mean no billing)
        const isInsufficientCredit = 
          claudeResponse.status === 402 ||
          lowerMessage.includes('insufficient_quota') ||
          lowerMessage.includes('insufficient_funds') ||
          lowerMessage.includes('billing_not_active') ||
          lowerMessage.includes('no active billing') ||
          lowerMessage.includes('quota exceeded') ||
          (lowerMessage.includes('insufficient') && (lowerMessage.includes('quota') || lowerMessage.includes('funds') || lowerMessage.includes('credit'))) ||
          (lowerMessage.includes('billing') && (lowerMessage.includes('not active') || lowerMessage.includes('disabled'))) ||
          lowerType.includes('insufficient_quota') ||
          lowerType.includes('billing_error');
        
        // 401 → Invalid key
        if (claudeResponse.status === 401) {
          console.log(`[Claude Key Validation] Invalid key (401): ${errorMessage}`);
          return { valid: false, error: "Your API key format is invalid." }
        }
        
        // 403 → Could be no billing OR no model access OR invalid key
        if (claudeResponse.status === 403) {
          if (isInsufficientCredit) {
            console.log(`[Claude Key Validation] No billing/credits (403): ${errorMessage}`);
            return { valid: false, error: "Your API key has no credits or billing is disabled." }
          }
          if (lowerMessage.includes('model') && (lowerMessage.includes('not available') || lowerMessage.includes('not accessible'))) {
            console.log(`[Claude Key Validation] No model access (403): ${errorMessage}`);
            return { valid: false, error: "This model is not accessible with your key, choose another model." }
          }
          console.log(`[Claude Key Validation] Access denied (403): ${errorMessage}`);
          return { valid: false, error: "Your API key has no credits or billing is disabled." }
        }
        
        // Check for insufficient credit with other status codes
        if (isInsufficientCredit) {
          console.log(`[Claude Key Validation] No billing/credits: ${errorMessage}`);
          return { valid: false, error: "Your API key has no credits or billing is disabled." }
        }
        
        // Check error message content for authentication-related issues
        if (lowerMessage.includes('authentication') || 
            lowerMessage.includes('invalid api key') ||
            lowerMessage.includes('invalid_api_key') ||
            lowerMessage.includes('api key not found') ||
            lowerMessage.includes('unauthorized')) {
          console.log(`[Claude Key Validation] Invalid key: ${errorMessage}`);
          return { valid: false, error: "Your API key format is invalid." }
        }
        
        // 429 → Rate limit (retryable)
        if (claudeResponse.status === 429) {
          console.log(`[Claude Key Validation] Rate limit (429): ${errorMessage}`);
          return { valid: true } // Key is valid, just rate limited
        }
        
        // 400 → Wrong endpoint or request format (but key might be valid)
        if (claudeResponse.status === 400 && !lowerMessage.includes('invalid') && !lowerMessage.includes('authentication')) {
          console.log(`[Claude Key Validation] Bad request (400) but key might be valid: ${errorMessage}`);
          return { valid: true } // Key format might be valid, request format issue
        }
        
        // For other errors, return the error message
        console.log(`[Claude Key Validation] Other error (${claudeResponse.status}): ${errorMessage}`);
        return { valid: false, error: `API error (${claudeResponse.status}): ${errorMessage || 'Unknown error'}` }

      case "groq":
        // Test Groq key
        const groqResponse = await fetch("https://api.groq.com/openai/v1/models", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          signal: controller.signal
        })

        if (groqResponse.ok) {
          return { valid: true }
        } else if (groqResponse.status === 401) {
          return { valid: false, error: "Invalid API key" }
        } else {
          return { valid: false, error: `API error: ${groqResponse.status}` }
        }

      default:
        return { valid: false, error: "Unknown provider" }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      return { valid: false, error: "Request timed out. Please try again." }
    }
    console.error(`Error verifying ${provider} API key:`, error)
    return { valid: false, error: "Network error or invalid API key" }
  }
}

export async function saveApiKeys(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to save API keys")
  }

  // Get existing keys first to validate requirements
  const { data: existingKeys } = await supabase
    .from("user_api_keys")
    .select("openai_key, gemini_key, claude_key, groq_key")
    .eq("user_id", user.id)
    .single()

  // Extract API keys from form data
  const openai_key = formData.get("openai_key") as string
  const gemini_key = formData.get("gemini_key") as string
  const claude_key = formData.get("claude_key") as string
  const groq_key = formData.get("groq_key") as string

  // Validate required Groq key - only required if not already saved
  const hasExistingGroq = existingKeys?.groq_key
  const hasNewGroq = groq_key && groq_key.trim() !== ""

  if (!hasExistingGroq && !hasNewGroq) {
    throw new Error("Groq API key is required")
  }

  // Prepare update data - only update fields that have been changed
  const updateData: any = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }

  // OpenAI key - use new value if provided, otherwise keep existing
  if (openai_key && openai_key.trim() !== "") {
    updateData.openai_key = openai_key.trim()
  } else if (existingKeys?.openai_key) {
    updateData.openai_key = existingKeys.openai_key
  }

  // Optional keys - only update if provided and not empty
  if (gemini_key && gemini_key.trim() !== "") {
    updateData.gemini_key = gemini_key.trim()
  } else if (existingKeys?.gemini_key) {
    updateData.gemini_key = existingKeys.gemini_key
  }

  if (claude_key && claude_key.trim() !== "") {
    updateData.claude_key = claude_key.trim()
  } else if (existingKeys?.claude_key) {
    updateData.claude_key = existingKeys.claude_key
  }

  if (groq_key && groq_key.trim() !== "") {
    updateData.groq_key = groq_key.trim()
  } else if (existingKeys?.groq_key) {
    updateData.groq_key = existingKeys.groq_key
  }

  // First try to update existing record, if not found then insert
  const { data: existingRecord } = await supabase
    .from("user_api_keys")
    .select("id")
    .eq("user_id", user.id)
    .single()

  let error
  if (existingRecord) {
    // Update existing record
    const { error: updateError } = await supabase
      .from("user_api_keys")
      .update(updateData)
      .eq("user_id", user.id)
    error = updateError
  } else {
    // Insert new record
    const { error: insertError } = await supabase
      .from("user_api_keys")
      .insert(updateData)
    error = insertError
  }

  if (error) {
    console.error("Error saving API keys:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))

    // Provide more specific error messages
    if (error.message?.includes('relation "user_api_keys" does not exist')) {
      throw new Error("Database table not found. Please contact support or run database migrations.")
    } else if (error.message?.includes('permission denied')) {
      throw new Error("Permission denied. Please check your database permissions.")
    } else if (error.message?.includes('duplicate key value')) {
      throw new Error("API keys already exist. Please try updating instead.")
    } else {
      throw new Error(`Failed to save API keys: ${error.message || "Unknown error"}`)
    }
  }

  // Redirect to chat if Groq key is available (Groq is now mandatory)
  if (updateData.groq_key) {
    redirect("/dashboard/chat?success=api-keys-saved")
  } else {
    redirect("/dashboard/api-keys?success=api-keys-saved")
  }
}

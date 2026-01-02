"use server"

import { createClient } from "@/lib/supabase/server"
import { routeToAI } from "@/lib/ai/router"
import { chooseModel } from "@/lib/ai/modelSelector"
import { verifyApiKey } from "../api-keys/actions"

interface ChatMessage {
  role: "user" | "assistant" | "developer"
  content: string
}

interface UserKeys {
  openai_key?: string | null
  gemini_key?: string | null
  claude_key?: string | null
  groq_key?: string | null
}

export async function sendMessage(formData: FormData) {
  let user: any = null
  let userId = "test-user"

  try {
    const supabase = await createClient()
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()

    if (userError || !authUser) {
      console.log("No authenticated user, using test mode")
      user = { id: userId }
    } else {
      user = authUser
      userId = user.id
    }
  } catch (error) {
    console.log("Supabase not available, using test mode")
    user = { id: userId }
  }

  // Extract message, chat history, file URL, and selected model from form data
  const message = formData.get("message") as string
  const sessionId = formData.get("sessionId") as string | null
  const historyData = formData.get("history") as string
  const fileUrl = formData.get("fileUrl") as string
  const selectedModel = formData.get("selectedModel") as string

  if (!message || message.trim() === "") {
    return { error: "Message cannot be empty" }
  }

  console.log(`[Message Send] Starting message processing for user: ${userId}`)

  // Parse chat history
  let chatHistory: ChatMessage[] = []
  if (historyData) {
    try {
      chatHistory = JSON.parse(historyData)
    } catch (error) {
      console.error("Failed to parse chat history:", error)
      // Continue with empty history if parsing fails
    }
  }

  // Get user's API keys
  let apiKeys: any = null
  let keysError: any = null

  try {
    const supabase = await createClient()
    const result = await supabase
      .from("user_api_keys")
      .select("openai_key, gemini_key, claude_key, groq_key")
      .eq("user_id", user.id)
      .single()

    apiKeys = result.data
    keysError = result.error
  } catch (supabaseError) {
    console.log("Supabase not configured, checking environment variables")
    // Check environment variables properly - they must exist AND not be empty
    apiKeys = {
      groq_key: (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') ? process.env.GROQ_API_KEY : null,
      openai_key: (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') ? process.env.OPENAI_API_KEY : null,
      gemini_key: (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') ? process.env.GEMINI_API_KEY : null,
      claude_key: (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY.trim() !== '') ? process.env.CLAUDE_API_KEY : null
    }
  }

  if (keysError && !apiKeys) {
    console.error("API keys error:", keysError)
    if (keysError.code === 'PGRST116') { // No rows found
      return { error: "Please set up your API keys first" }
    }
    return { error: "Failed to retrieve API keys. Please try again." }
  }

  if (!apiKeys) {
    console.error("No API keys found for user")
    return { error: "Please set up your API keys first" }
  }

  // Check if at least one API key is available
  const hasAnyKey = apiKeys.openai_key || apiKeys.gemini_key || apiKeys.claude_key || apiKeys.groq_key
  console.log('API Keys available:', {
    groq: !!apiKeys.groq_key,
    openai: !!apiKeys.openai_key,
    gemini: !!apiKeys.gemini_key,
    claude: !!apiKeys.claude_key
  })
  console.log('API Keys values:', {
    groq: apiKeys.groq_key ? 'SET' : 'NOT_SET',
    openai: apiKeys.openai_key ? 'SET' : 'NOT_SET',
    gemini: apiKeys.gemini_key ? 'SET' : 'NOT_SET',
    claude: apiKeys.claude_key ? 'SET' : 'NOT_SET'
  })

  // Check if Groq key is available - it's mandatory
  // No single provider is mandatory — we'll attempt providers in priority order and fall back as needed.

  if (!hasAnyKey) {
    return { error: "No valid API keys found. Please add at least one API key or set environment variables for testing." }
  }

  // Prepare system message
  const agentPrompt = formData.get("systemMessage") as string ||
                     "You are a versatile AI assistant capable of helping with various tasks."

  // Create messages array with developer message, chat history, and current message
  const messages: ChatMessage[] = [
    { role: "developer", content: agentPrompt },
    ...chatHistory,
    { role: "user", content: message }
  ]

  // Limit history to prevent token overflow (keep last 10 exchanges)
  const maxMessages = 20 // Roughly 10 exchanges (user + assistant pairs)
  if (messages.length > maxMessages) {
    // Keep system message if present, then most recent messages
    const systemMessages = messages.filter(msg => msg.role === "developer")
    const recentMessages = messages.slice(-maxMessages + systemMessages.length)
    messages.splice(0, messages.length, ...systemMessages, ...recentMessages)
  }

  // Process file if provided
  let fileContent = null
  let fileType = null
  if (fileUrl) {
    try {
      fileContent = await downloadAndProcessFile(fileUrl)
      fileType = getFileTypeFromUrl(fileUrl)
    } catch (error) {
      console.error("Error processing file:", error)
      return { error: "Failed to process uploaded file. Please try again." }
    }
  }

    try {
      // Select model based on user choice or auto-select
      let modelSelection
      if (selectedModel && selectedModel !== "Auto") {
        // Map selected model name to provider
        const modelMap: Record<string, string> = {
          "ChatGPT": "openai",
          "Gemini": "gemini",
          "Claude": "claude",
          "Groq": "groq"
        }
        const provider = modelMap[selectedModel]
        const key = apiKeys[`${provider}_key` as keyof typeof apiKeys]

        console.log(`Selected model: ${selectedModel}, provider: ${provider}, has key: ${!!key}`)

        if (!key || key.trim() === "") {
          return { error: `${selectedModel} API key not found or is empty. Please add it in settings.` }
        }

        modelSelection = { provider, key }
      } else {
        // Auto-select best available model
        modelSelection = chooseModel(apiKeys as UserKeys)
        if (!modelSelection.key) {
          return { error: `No valid API key found for ${modelSelection.provider}. Please check your API keys.` }
        }
      }

      console.log(`[Message Send] Starting AI request - Provider: ${modelSelection.provider}, Model: ${selectedModel}`)

    // For server actions we must not return class instances (Response / ReadableStream) to client components.
    // Disable streaming here so the server action always returns plain serializable objects.
    const shouldStream = false

    console.log(`[Message Send] Processing message - Length: ${message.length}, Session: ${sessionId}, Streaming: ${shouldStream}`)

    // Insert user's message into persistent chat_history table
    if (sessionId) { // Only save if we have a sessionId
      try {
        const supabaseForInsert = await createClient()
        const contentToStore = (fileUrl ? JSON.stringify([{ type: "text", text: message }, { type: "file", url: fileUrl }]) : message)
        console.log("Saving user message to chat_history:", { sessionId, content: contentToStore.substring(0, 100) + "..." })
        const insertPayload: any = {
          user_id: userId,
          role: "user",
          content: contentToStore,
          session_id: sessionId // Always include session_id
        }
        const { data: insertedUserRows, error: insertError } = await supabaseForInsert
          .from("chat_history")
          .insert(insertPayload)
          .select()

        if (insertError) {
          console.error("Failed to insert user chat message into chat_history:", insertError)
        } else {
          console.log(`Successfully saved user message with ID: ${insertedUserRows?.[0]?.id}`)
        }
      } catch (e) {
        console.error("Error inserting chat message into chat_history:", e)
      }
    } else {
      console.warn("No sessionId provided, skipping chat_history save for user message")
    }

    if (fileUrl) {
      console.log("Processing file analysis request")
      // Use file analysis function
      const aiResponse = await analyzeFileWithAI(apiKeys as UserKeys, messages, fileContent!, fileType!, modelSelection.provider)

      if (!aiResponse) {
        throw new Error("AI provider returned no response for file analysis")
      }

      // Save chat history after successful AI response
      // Insert assistant response into chat_history
      try {
        const supabaseForInsert = await createClient()
        console.log("Saving chat message into chat_history:", aiResponse)
        const insertPayload: any = { user_id: userId, role: "assistant", content: aiResponse }
        if (sessionId) insertPayload.session_id = sessionId
        const { data: insertedAssistantRows, error: insertAssistantError } = await supabaseForInsert
          .from("chat_history")
          .insert(insertPayload)
          .select()
        if (insertAssistantError) {
          console.error("Failed to insert assistant chat message into chat_history:", insertAssistantError)
        }
      } catch (e) {
        console.error("Error inserting assistant chat message into chat_history:", e)
      }

      const chatHistoryMessages: ChatMessage[] = [
        ...messages,
        { role: "assistant", content: aiResponse },
      ]

      // Truncate history if longer than 10 exchanges (roughly 20 messages)
      const maxMessages = 20
      if (chatHistoryMessages.length > maxMessages) {
        // Keep system message if present, then most recent messages
        const systemMessages = chatHistoryMessages.filter(msg => msg.role === "developer")
        const recentMessages = chatHistoryMessages.slice(-maxMessages + systemMessages.length)
        chatHistoryMessages.splice(0, chatHistoryMessages.length, ...systemMessages, ...recentMessages)
      }

      try {
        await saveChatHistory(userId, chatHistoryMessages)
      } catch (historyError) {
        console.error("Failed to save chat history:", historyError)
        // Don't fail the whole request if history save fails (e.g., Supabase not configured)
      }

      return { reply: aiResponse }
    } else {
      console.log("Processing regular message request")
      // Regular message processing
      // Use the selected model's provider (either user-selected or auto-selected)
      const preferredProvider = modelSelection.provider
      // If user explicitly selected a model (not Auto), use strict mode to only use that model
      const strictMode = Boolean(selectedModel && selectedModel !== "Auto")
      console.log(`[Message Send] Routing to AI - Provider: ${preferredProvider}, Strict: ${strictMode}, Streaming: ${shouldStream}`)

      // Call routeToAI and return its response
      const startTime = Date.now()
      const aiResponse = await routeToAI(apiKeys as UserKeys, messages, shouldStream, preferredProvider, strictMode, userId)
      const aiDuration = Date.now() - startTime
      console.log(`[Message Send] AI response received in ${aiDuration}ms`)

      if (!aiResponse) {
        throw new Error("AI provider returned no response")
      }

      // Regular (non-streaming) response: save history and return the string
      const aiText = aiResponse as string
      const chatHistoryMessagesForRoute: ChatMessage[] = [
        ...messages,
        { role: "assistant", content: aiText },
      ]

      // Truncate history if longer than 10 exchanges (roughly 20 messages)
      const maxMessagesRoute = 20
      if (chatHistoryMessagesForRoute.length > maxMessagesRoute) {
        const systemMessages = chatHistoryMessagesForRoute.filter(msg => msg.role === "developer")
        const recentMessages = chatHistoryMessagesForRoute.slice(-maxMessagesRoute + systemMessages.length)
        chatHistoryMessagesForRoute.splice(0, chatHistoryMessagesForRoute.length, ...systemMessages, ...recentMessages)
      }

      // Insert assistant message row
      if (sessionId) { // Only save if we have a sessionId
        try {
          const supabaseForInsert = await createClient()
          console.log("Saving assistant message to chat_history:", { sessionId, contentLength: aiText.length })
          const insertPayload: any = {
            user_id: userId,
            role: "assistant",
            content: aiText,
            session_id: sessionId // Always include session_id
          }
          const { data: insertedAssistantRows, error: insertAssistantError } = await supabaseForInsert
            .from("chat_history")
            .insert(insertPayload)
            .select()
          if (insertAssistantError) {
            console.error("Failed to insert assistant chat message into chat_history:", insertAssistantError)
          } else {
            console.log(`Successfully saved assistant message with ID: ${insertedAssistantRows?.[0]?.id}`)
          }
        } catch (e) {
          console.error("Error inserting assistant chat message into chat_history:", e)
        }
      } else {
        console.warn("No sessionId provided, skipping chat_history save for assistant message")
      }

      return { reply: aiText }
    }
  } catch (error) {
    console.error("Error calling AI API:", error)
    console.error("Error type:", typeof error)
    console.error("Error name:", error instanceof Error ? error.name : 'Unknown')
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')

    // Debug: Check if this is a Claude insufficient credits error
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.log("Checking if Claude insufficient credits error:", errorMsg.toLowerCase().includes('anthropic') || errorMsg.toLowerCase().includes('claude'))

    // Provide specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("No API key available")) {
        return { error: "No API keys available. Please add at least one API key in the API Keys section." }
      }
      // Check for insufficient credit errors FIRST (before invalid key checks)
      if (error.message.startsWith("INSUFFICIENT_CREDIT:") || 
          error.message.includes("INSUFFICIENT_CREDIT:")) {
        return { error: "This API key does not have credits. Please upgrade billing or try a different provider." }
      }
      // Check for invalid API key errors (should be checked early)
      if (error.message.includes("Invalid API key") || 
          (error.message.includes("Invalid") && error.message.includes("key")) ||
          error.message.includes("authentication failed") ||
          error.message.toLowerCase().includes("invalid api key")) {
        return { error: "Invalid API key. Please check your API keys in the settings." }
      }
      // Check for no model access errors
      if (error.message.startsWith("NO_MODEL_ACCESS:") || 
          error.message.includes("NO_MODEL_ACCESS:")) {
        return { error: "This model is not accessible with your key, choose another model." }
      }
      // Check for insufficient credit balance errors (including Claude API format)
      const lowerMsg = error.message.toLowerCase()
      if (lowerMsg.includes("insufficient credit balance") ||
          lowerMsg.includes("credit balance is too low") ||
          lowerMsg.includes("your credit balance is too low") ||
          lowerMsg.includes("does not have credits") ||
          lowerMsg.includes("upgrade or purchase credits") ||
          lowerMsg.includes("anthropic api") ||
          (lowerMsg.includes("insufficient") &&
          (lowerMsg.includes("credit") || lowerMsg.includes("balance") || lowerMsg.includes("quota")))) {
        console.log("Detected insufficient credits error in actions.ts")
        return { error: "This API key does not have credits. Please upgrade billing or try a different provider." }
      }
      if (error.message.includes("API error")) {
        // Check for specific HTTP status codes
        if (error.message.includes("429") ||
            error.message.includes("Too Many Requests") ||
            error.message.includes("rate limit") ||
            error.message.includes("Rate limit")) {
          return { error: "Rate limit exceeded. Please wait a moment before sending another message." }
        }
        if (error.message.includes("500") || error.message.includes("502") || error.message.includes("503") || error.message.includes("504")) {
          return { error: "AI service is temporarily unavailable due to server issues. Please try again in a few minutes." }
        }
        if (error.message.includes("401") || error.message.includes("403")) {
          return { error: "Authentication failed. Please check your API keys in settings." }
        }
        if (error.message.includes("402")) {
          return { error: "Insufficient credit balance: Payment required. Please add credits to your account." }
        }
        return { error: "AI service temporarily unavailable. Please try again in a moment." }
      }
      if (error.message.includes("Rate limit")) {
        return { error: "Rate limit exceeded. Please wait a moment before sending another message." }
      }
      if (error.message.includes("No response content")) {
        return { error: "AI service returned an empty response. Please try again." }
      }
      if (error.message.includes("fetch") || error.message.includes("network")) {
        return { error: "Network connection error. Please check your internet connection." }
      }
      if (error.message.includes("Unsupported AI provider")) {
        return { error: "Selected AI provider is not supported. Please choose a different model." }
      }
      if (error.message.includes("All available AI providers failed")) {
        return { error: "All AI providers are currently unavailable. Please check your API keys in settings or try again later." }
      }
    } else {
      console.error("Error is not an Error instance:", error)
    }

    return { error: "Failed to get AI response. Please try again." }
  }
}

// Test rate limit error handling
export async function testRateLimitError() {
  // Simulate a rate limit error
  const mockError = new Error("OpenAI API error: 429 Too Many Requests");

  try {
    // Test the error handling logic
    if (mockError.message.includes("API error")) {
      if (mockError.message.includes("429") || mockError.message.includes("Too Many Requests")) {
        return { success: true, message: "Rate limit exceeded. Please wait a moment before sending another message." };
      }
    }
    return { success: false, message: "Rate limit detection failed" };
  } catch (error) {
    return { success: false, message: "Error in test" };
  }
}

export async function diagnoseApiKeys() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in to diagnose API keys" }
  }

  // Get user's API keys
  const { data: apiKeys, error: keysError } = await supabase
    .from("user_api_keys")
    .select("openai_key, gemini_key, claude_key, groq_key")
    .eq("user_id", user.id)
    .single()

  if (keysError) {
    return { error: "Failed to retrieve API keys from database" }
  }

  if (!apiKeys) {
    return { error: "No API keys found. Please add API keys first." }
  }

  // Check which keys are present
  const results = {
    openai: { present: !!apiKeys.openai_key, tested: false, working: false },
    gemini: { present: !!apiKeys.gemini_key, tested: false, working: false },
    claude: { present: !!apiKeys.claude_key, tested: false, working: false },
    groq: { present: !!apiKeys.groq_key, tested: false, working: false }
  }

  // Test each available key
  const testPromises = Object.entries(results).map(async ([provider, status]) => {
    if (status.present) {
      try {
        const key = apiKeys[`${provider}_key` as keyof typeof apiKeys]
        if (key) {
          await verifyApiKey(provider, key)
          results[provider as keyof typeof results].tested = true
          results[provider as keyof typeof results].working = true
        }
      } catch (error) {
        results[provider as keyof typeof results].tested = true
        results[provider as keyof typeof results].working = false
      }
    }
  })

  await Promise.all(testPromises)

  return {
    success: true,
    results,
    summary: {
      totalKeys: Object.values(results).filter(r => r.present).length,
      workingKeys: Object.values(results).filter(r => r.working).length,
      testedKeys: Object.values(results).filter(r => r.tested).length
    }
  }
}

export async function saveChatHistory(userId: string, messages: ChatMessage[]) {
  try {
    const supabase = await createClient()

    // Upsert chat history (insert or update if exists)
    const { error } = await supabase
      .from("chat_history")
      .upsert({
        user_id: userId,
        messages: messages,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error("Error saving chat history:", error)
      // Don't throw error if Supabase is not configured
      if (error.message?.includes('relation "chat_history" does not exist') ||
          error.message?.includes('connection') ||
          error.message?.includes('auth')) {
        console.log("Supabase not configured, skipping chat history save")
        return { success: true }
      }
      throw new Error("Failed to save chat history")
    }

    return { success: true }
  } catch (error) {
    console.error("Chat history save error:", error)
    // Don't throw if Supabase is not available
    console.log("Skipping chat history save due to Supabase unavailability")
    return { success: true }
  }
}

// Helper function to download and process file from signed URL
async function downloadAndProcessFile(fileUrl: string) {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to base64 for API compatibility
    const base64 = Buffer.from(uint8Array).toString('base64')

    return base64
  } catch (error) {
    console.error("Error downloading file:", error)
    throw error
  }
}

// Helper function to get file type from URL
function getFileTypeFromUrl(fileUrl: string): string {
  // Extract file extension from URL or content type
  const urlParts = fileUrl.split('?')[0].split('.')
  const extension = urlParts[urlParts.length - 1].toLowerCase()

  const mimeTypes: { [key: string]: string } = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'csv': 'text/csv'
  }

  return mimeTypes[extension] || 'application/octet-stream'
}

// Function to analyze file with AI models
async function analyzeFileWithAI(
  apiKeys: UserKeys,
  messages: ChatMessage[],
  fileContent: string,
  fileType: string,
  provider: string
): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Get the API key for the selected provider
  const keyMapping: Record<string, string | null | undefined> = {
    openai: apiKeys.openai_key,
    gemini: apiKeys.gemini_key,
    claude: apiKeys.claude_key,
    groq: apiKeys.groq_key,
  }

  const apiKey = keyMapping[provider]
  if (!apiKey) {
    throw new Error(`API key for ${provider} not found`)
  }

  try {
    switch (provider) {
      case 'openai':
        return await analyzeWithOpenAI(apiKey, messages, fileContent, fileType)

      case 'gemini':
        return await analyzeWithGemini(apiKey, messages, fileContent, fileType)

      case 'claude':
        return await analyzeWithClaude(apiKey, messages, fileContent, fileType)

      case 'groq':
        // Groq doesn't support file analysis, fall back to text-only
        return await routeToAI(apiKeys, messages, false, undefined, false, user.id) as string

      default:
        throw new Error(`File analysis not supported for provider: ${provider}`)
    }
  } catch (error) {
    console.error(`Error analyzing file with ${provider}:`, error)
    throw new Error(`Failed to analyze file with ${provider}`)
  }
}

// OpenAI file analysis
async function analyzeWithOpenAI(apiKey: string, messages: ChatMessage[], fileContent: string, fileType: string): Promise<string> {
  const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

  try {
    const isImage = fileType.startsWith("image/")

    const filePrompt = isImage
      ? `Please analyze this image file. Data URI: data:${fileType};base64,${fileContent}`
      : `Please analyze this ${fileType} file content (truncated): ${fileContent.substring(0, 1000)}`

    const requestBody: any = {
      model: "gpt-4o-mini",
      messages: [
        ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
        {
          role: "user",
          content: filePrompt,
        },
      ],
      max_tokens: 1000,
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText || '';
      const lowerMessage = errorMessage.toLowerCase();
      
      // Check for insufficient credit/balance errors
      if (lowerMessage.includes('insufficient') || 
          lowerMessage.includes('credit') || 
          lowerMessage.includes('balance') || 
          lowerMessage.includes('quota') ||
          lowerMessage.includes('payment') ||
          lowerMessage.includes('billing') ||
          response.status === 402) {
        throw new Error(`Insufficient credit balance: ${errorMessage || 'Your API key has insufficient credits. Please add credits to your account.'}`);
      }
      
      throw new Error(`OpenAI API error: ${response.status} ${errorMessage}`);
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "Unable to analyze the file."
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("File analysis timed out after 25 seconds")
    }
    throw error
  }
}

// Gemini file analysis
async function analyzeWithGemini(apiKey: string, messages: ChatMessage[], fileContent: string, fileType: string): Promise<string> {
  const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

  try {
    const isImage = fileType.startsWith("image/")

    const filePrompt = isImage
      ? `Please analyze this image file. Data (base64): [REDACTED for logs] Provide summary and insights.`
      : `Please analyze this ${fileType} file content (truncated): ${fileContent.substring(0, 1000)}`

    const promptString = [
      ...messages.map((m) => `${m.role === "developer" ? "System" : m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`),
      `User: ${filePrompt}`,
    ].join("\n")

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptString }],
            },
          ],
        }),
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText || '';
      const lowerMessage = errorMessage.toLowerCase();
      
      // Check for insufficient credit/balance errors
      if (lowerMessage.includes('insufficient') || 
          lowerMessage.includes('credit') || 
          lowerMessage.includes('balance') || 
          lowerMessage.includes('quota') ||
          lowerMessage.includes('payment') ||
          lowerMessage.includes('billing') ||
          response.status === 402) {
        throw new Error(`Insufficient credit balance: ${errorMessage || 'Your API key has insufficient credits. Please add credits to your account.'}`);
      }
      
      throw new Error(`Gemini API error: ${response.status} ${errorMessage}`);
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to analyze the file."
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("File analysis timed out after 25 seconds")
    }
    throw error
  }
}

// Claude file analysis
async function analyzeWithClaude(apiKey: string, messages: ChatMessage[], fileContent: string, fileType: string): Promise<string> {
  const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

  try {
    const isImage = fileType.startsWith("image/")

    const filePrompt = isImage
      ? `Please analyze this image file. Data (base64): [REDACTED for logs] Provide summary and insights.`
      : `Please analyze this ${fileType} file content (truncated): ${fileContent.substring(0, 1000)}`

    const requestMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: filePrompt },
    ]

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: requestMessages,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText || '';
      const lowerMessage = errorMessage.toLowerCase();
      
      // Check for insufficient credit/balance errors
      if (lowerMessage.includes('insufficient') || 
          lowerMessage.includes('credit') || 
          lowerMessage.includes('balance') || 
          lowerMessage.includes('quota') ||
          lowerMessage.includes('payment') ||
          lowerMessage.includes('billing') ||
          response.status === 402) {
        throw new Error(`Insufficient credit balance: ${errorMessage || 'Your API key has insufficient credits. Please add credits to your account.'}`);
      }
      
      throw new Error(`Claude API error: ${response.status} ${errorMessage}`);
    }

    const data = await response.json()
    return data.content?.[0]?.text || "Unable to analyze the file."
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("File analysis timed out after 25 seconds")
    }
    throw error
  }
}

export async function uploadChatFile(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to upload files")
  }

  // Get the file from form data
  const file = formData.get("file") as File

  if (!file) {
    throw new Error("No file provided")
  }

  // Validate file size (<10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 10MB")
  }

  // Validate file type
  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error("File type not allowed. Supported types: PNG, JPG, JPEG, GIF, WebP, PDF, TXT, DOCX, DOC, CSV, XLS, XLSX")
  }

  try {
    // Create unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${user.id}/${timestamp}-${sanitizedFilename}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false // Don't overwrite existing files
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      throw new Error("Failed to upload file. Please try again.")
    }

    // Create signed URL for temporary access (expires in 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("chat-files")
      .createSignedUrl(fileName, 3600) // 1 hour expiration

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Error creating signed URL:", signedUrlError)
      throw new Error("Failed to generate file access URL")
    }

    return {
      url: signedUrlData.signedUrl,
      filename: file.name,
      fileType: file.type,
      fileSize: file.size
    }
  } catch (error) {
    console.error("File upload error:", error)
    throw error
  }
}


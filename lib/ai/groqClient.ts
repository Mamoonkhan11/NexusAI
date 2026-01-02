interface ChatMessage {
  role: "user" | "assistant" | "developer";
  content: string;
}

interface SendToModelParams {
  key: string;
  messages: ChatMessage[];
}

export async function sendToModel({ key, messages }: SendToModelParams): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

  try {
    // Groq prefers no system messages
    const filteredMessages = messages.filter((msg) => msg.role !== "developer");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "groq/compound-mini",
        messages: filteredMessages,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    try { console.log("RAW PROVIDER RESPONSE (Groq):", data) } catch {}

    if (!response.ok) {
      const errorMessage = data?.error?.message || response.statusText || '';
      const errorType = data?.error?.type || data?.error?.code || '';
      const lowerMessage = errorMessage.toLowerCase();
      const lowerType = errorType.toLowerCase();
      
      console.log(`[Groq] Error - Status: ${response.status}, Type: ${errorType}, Message: ${errorMessage}`);
      
      // Check for insufficient credit/balance/billing errors FIRST
      const isInsufficientCredit = 
        response.status === 402 ||
        lowerMessage.includes('insufficient_quota') ||
        lowerMessage.includes('insufficient_funds') ||
        lowerMessage.includes('insufficient credits') ||
        lowerMessage.includes('insufficient credit') ||
        lowerMessage.includes('insufficient balance') ||
        lowerMessage.includes('billing_not_active') ||
        lowerMessage.includes('no active billing') ||
        lowerMessage.includes('quota exceeded') ||
        (lowerMessage.includes('insufficient') && (lowerMessage.includes('quota') || lowerMessage.includes('funds') || lowerMessage.includes('credit') || lowerMessage.includes('balance'))) ||
        (lowerMessage.includes('billing') && (lowerMessage.includes('not active') || lowerMessage.includes('disabled') || lowerMessage.includes('inactive'))) ||
        lowerType.includes('insufficient_quota') ||
        lowerType.includes('billing_error');
      
      if (isInsufficientCredit) {
        console.log(`[Groq] Insufficient credit detected - Provider: Groq, Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`INSUFFICIENT_CREDIT: Your API key has no credits or does not have access to this model.`);
      }
      
      // Check for authentication/API key errors (401)
      if (response.status === 401 || 
          lowerMessage.includes('invalid api key') ||
          lowerMessage.includes('invalid_api_key') ||
          lowerMessage.includes('api key not found') ||
          lowerMessage.includes('authentication failed') ||
          lowerType === 'invalid_api_key' ||
          lowerType === 'authentication_error') {
        console.log(`[Groq] Invalid API key - Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`Invalid API key: ${errorMessage || 'The provided Groq API key is invalid. Please check your API key in settings.'}`);
      }
      
      // Check for access errors (403)
      if (response.status === 403) {
        if (lowerMessage.includes('model') && (lowerMessage.includes('not available') || lowerMessage.includes('not accessible'))) {
          console.log(`[Groq] Model access denied - Status: ${response.status}, Message: ${errorMessage}`);
          throw new Error(`NO_MODEL_ACCESS: This model is not accessible with your key, choose another model.`);
        }
        console.log(`[Groq] Access denied (403) - Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`Access denied: ${errorMessage || 'Your API key does not have access. Please check billing or model access.'}`);
      }
      
      console.log(`[Groq] Generic error - Status: ${response.status}, Message: ${errorMessage}`);
      const msg = errorMessage || `Groq API error: ${response.status} ${response.statusText}`;
      throw new Error(msg);
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned empty content");
    }

    clearTimeout(timeoutId);
    return String(content);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err && err.name === "AbortError") {
      throw new Error("Request timed out after 25 seconds");
    }
    if (err instanceof Error) throw err;
    throw new Error("Unknown Groq API error");
  }
}

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
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  // 1. Anthropic requires system prompts in a separate top-level field
  const systemMessage = messages.find(m => m.role === "developer")?.content;
  
  // 2. Filter out the system message from the chat history
  const userMessages = messages.filter(m => m.role !== "developer");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01", // Version string remains stable in 2025
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Using Claude 3.5 Sonnet (latest high-performance model as of 2025)
        model: "claude-3-haiku-20240307", // Safe default: cheaper model 
        max_tokens: 4096,
        system: systemMessage, // Pass system prompt here
        messages: userMessages,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText || '';
      const errorType = errorData.error?.type || '';
      const lowerMessage = errorMessage.toLowerCase();
      const lowerType = errorType.toLowerCase();
      
      console.log(`[Claude] Error - Status: ${response.status}, Type: ${errorType}, Message: ${errorMessage}`);
      
      // Check for insufficient credit/balance/billing errors FIRST (before auth checks)
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
        lowerMessage.includes('payment required') ||
        (lowerMessage.includes('insufficient') && (lowerMessage.includes('quota') || lowerMessage.includes('funds') || lowerMessage.includes('credit') || lowerMessage.includes('balance'))) ||
        (lowerMessage.includes('billing') && (lowerMessage.includes('not active') || lowerMessage.includes('disabled') || lowerMessage.includes('inactive'))) ||
        lowerType.includes('insufficient_quota') ||
        lowerType.includes('billing_error');
      
      if (isInsufficientCredit) {
        console.log(`[Claude] Insufficient credit detected - Provider: Claude, Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`INSUFFICIENT_CREDIT: Your API key has no credits or does not have access to this model.`);
      }
      
      // Check for authentication/API key errors (401)
      if (response.status === 401 || 
          lowerMessage.includes('invalid api key') ||
          lowerMessage.includes('invalid_api_key') ||
          lowerMessage.includes('api key not found') ||
          lowerMessage.includes('authentication failed') ||
          lowerType.includes('authentication_error') ||
          lowerType.includes('invalid_api_key')) {
        console.log(`[Claude] Invalid API key - Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`Invalid API key: ${errorMessage || 'The provided Claude API key is invalid. Please check your API key in settings.'}`);
      }
      
      // Check for access/authorization errors (403) - could be no billing OR no model access
      if (response.status === 403) {
        if (lowerMessage.includes('model') && (lowerMessage.includes('not available') || lowerMessage.includes('not accessible'))) {
          console.log(`[Claude] Model access denied - Status: ${response.status}, Message: ${errorMessage}`);
          throw new Error(`NO_MODEL_ACCESS: This model is not accessible with your key, choose another model.`);
        }
        console.log(`[Claude] Access denied (403) - Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`Access denied: ${errorMessage || 'Your API key does not have access. Please check billing or model access.'}`);
      }
      
      // Check for invalid model name errors
      if (response.status === 400 && 
          (lowerMessage.includes('model') && lowerMessage.includes('not found')) ||
          lowerMessage.includes('invalid model') ||
          lowerMessage.includes('unknown model')) {
        console.log(`[Claude] Invalid model - Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`Invalid model name: ${errorMessage || 'The specified model is not available. Please check the model identifier.'}`);
      }
      
      console.log(`[Claude] Generic error - Status: ${response.status}, Message: ${errorMessage}`);
      throw new Error(`Claude API Error ${response.status}: ${errorMessage}`);
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;

    if (!text) throw new Error("Claude returned empty content");

    clearTimeout(timeoutId);
    return String(text);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error("Request timed out");
    throw error;
  }
}
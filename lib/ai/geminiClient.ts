interface ChatMessage {
  // Use 'model' for Gemini, or map 'assistant' to 'model' in the function
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

  // 1. Separate the system instruction from the chat history
  const systemMessage = messages.find(m => m.role === "developer");
  
  // 2. Format history: Map 'assistant' to 'model' and exclude the system message
  const contents = messages
    .filter(m => m.role !== "developer")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

  try {
    const response = await fetch(
      // Using gemini-2.5-flash for the best speed/cost balance in 2025
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: contents,
          // Dedicated system instruction field
          system_instruction: systemMessage ? {
            parts: [{ text: systemMessage.content }]
          } : undefined,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       const errorMessage = errorData.error?.message || response.statusText || '';
       const errorStatus = errorData.error?.status || '';
       const lowerMessage = errorMessage.toLowerCase();
       const lowerStatus = String(errorStatus).toLowerCase();
       
       console.log(`[Gemini] Error - Status: ${response.status}, ErrorStatus: ${errorStatus}, Message: ${errorMessage}`);
       
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
         lowerStatus.includes('quota') ||
         lowerStatus.includes('billing');
       
       if (isInsufficientCredit) {
         console.log(`[Gemini] Insufficient credit detected - Provider: Gemini, Status: ${response.status}, Message: ${errorMessage}`);
         throw new Error(`INSUFFICIENT_CREDIT: Your API key has no credits or does not have access to this model.`);
       }
       
       // Check for authentication/API key errors (400 or 401)
       if (response.status === 400 || response.status === 401 || 
           lowerMessage.includes('invalid api key') ||
           lowerMessage.includes('invalid_api_key') ||
           lowerMessage.includes('api key not found') ||
           lowerMessage.includes('authentication failed') ||
           lowerStatus === 'invalid_api_key') {
         console.log(`[Gemini] Invalid API key - Status: ${response.status}, Message: ${errorMessage}`);
         throw new Error(`Invalid API key: ${errorMessage || 'The provided Gemini API key is invalid. Please check your API key in settings.'}`);
       }
       
       // Check for access errors (403)
       if (response.status === 403) {
         if (lowerMessage.includes('model') && (lowerMessage.includes('not available') || lowerMessage.includes('not accessible'))) {
           console.log(`[Gemini] Model access denied - Status: ${response.status}, Message: ${errorMessage}`);
           throw new Error(`NO_MODEL_ACCESS: This model is not accessible with your key, choose another model.`);
         }
         console.log(`[Gemini] Access denied (403) - Status: ${response.status}, Message: ${errorMessage}`);
         throw new Error(`Access denied: ${errorMessage || 'Your API key does not have access. Please check billing or model access.'}`);
       }
       
       console.log(`[Gemini] Generic error - Status: ${response.status}, Message: ${errorMessage}`);
       throw new Error(`Gemini API Error ${response.status}: ${errorMessage}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Gemini returned empty content");

    clearTimeout(timeoutId);
    return text;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error("Request timed out");
    throw error;
  }
}
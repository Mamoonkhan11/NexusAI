interface ChatMessage {
  role: "user" | "assistant" | "developer"; // 'developer' is the 2025 role for system instructions
  content: string;
}

interface SendToModelParams {
  key: string;
  messages: ChatMessage[];
  stream?: boolean;
}

export async function sendToModel({ key, messages, stream = false }: SendToModelParams): Promise<string | ReadableStream> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Safe default: cheaper model
        messages,
        stream,
        max_completion_tokens: 4096,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText || '';
      const errorType = errorData.error?.type || errorData.error?.code || '';
      const lowerMessage = errorMessage.toLowerCase();
      const lowerType = errorType.toLowerCase();
      
      console.log(`[OpenAI] Error - Status: ${response.status}, Type: ${errorType}, Message: ${errorMessage}`);
      
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
        lowerMessage.includes('payment required') ||
        (lowerMessage.includes('insufficient') && (lowerMessage.includes('quota') || lowerMessage.includes('funds') || lowerMessage.includes('credit') || lowerMessage.includes('balance'))) ||
        (lowerMessage.includes('billing') && (lowerMessage.includes('not active') || lowerMessage.includes('disabled') || lowerMessage.includes('inactive'))) ||
        lowerType.includes('insufficient_quota') ||
        lowerType === 'insufficient_quota' ||
        lowerType === 'billing_error';
      
      if (isInsufficientCredit) {
        console.log(`[OpenAI] Insufficient credit detected - Provider: OpenAI, Status: ${response.status}, Message: ${errorMessage}`);
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
        console.log(`[OpenAI] Invalid API key - Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`Invalid API key: ${errorMessage || 'The provided OpenAI API key is invalid. Please check your API key in settings.'}`);
      }
      
      // Check for access/authorization errors (403) - could be no billing OR no model access
      if (response.status === 403) {
        if (lowerMessage.includes('model') && (lowerMessage.includes('not available') || lowerMessage.includes('not accessible'))) {
          console.log(`[OpenAI] Model access denied - Status: ${response.status}, Message: ${errorMessage}`);
          throw new Error(`NO_MODEL_ACCESS: This model is not accessible with your key, choose another model.`);
        }
        console.log(`[OpenAI] Access denied (403) - Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`Access denied: ${errorMessage || 'Your API key does not have access. Please check billing or model access.'}`);
      }
      
      // Check for rate limiting (429)
      if (response.status === 429) {
        console.log(`[OpenAI] Rate limit - Status: ${response.status}, Message: ${errorMessage}`);
        throw new Error(`Rate limit exceeded. Please wait a moment before sending another message.`);
      }
      
      console.log(`[OpenAI] Generic error - Status: ${response.status}, Message: ${errorMessage}`);
      throw new Error(`OpenAI Error: ${errorMessage}`);
    }

    if (stream) {
      clearTimeout(timeoutId);
      return createStreamingResponse(response);
    }

    const data = await response.json();
    clearTimeout(timeoutId);
    return data?.choices?.[0]?.message?.content || "";

  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error("Request timed out");
    throw error;
  }
}

/**
 * HELPER: Processes the raw OpenAI stream into a clean ReadableStream of text
 */
async function createStreamingResponse(response: Response): Promise<ReadableStream> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body available for streaming");

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep partial line in buffer

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine || cleanLine === "data: [DONE]") continue;

            if (cleanLine.startsWith("data: ")) {
              try {
                const json = JSON.parse(cleanLine.replace("data: ", ""));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    }
  });
}
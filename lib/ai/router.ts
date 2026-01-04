import { type UserKeys } from "./modelSelector";
import { sendToModel as sendToOpenAI } from "./openaiClient";
import { sendToModel as sendToGemini } from "./geminiClient";
import { sendToModel as sendToClaude } from "./claudeClient";
import { sendToModel as sendToGroq } from "./groqClient";
import { createClient } from "@/lib/supabase/server";

interface ChatMessage {
  role: "user" | "assistant" | "developer";
  content: string;
}

// Log API usage to the database
async function logApiUsage(userId: string | undefined, provider: string) {
  if (!userId) {
    console.log("Skipping API log: no user ID");
    return; // Skip logging if no user ID
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("api_logs").insert({
      user_id: userId,
      provider,
    }).select();

    if (error) {
      console.error("Failed to log API usage:", error);
    } else {
      console.log(`✅ API usage logged: provider=${provider}, user_id=${userId}`);
    }
  } catch (error) {
    console.error("Failed to log API usage:", error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

export async function routeToAI(userKeys: UserKeys, messages: ChatMessage[], stream: boolean = false, preferredProvider?: string, strictMode: boolean = false, userId?: string): Promise<string | ReadableStream> {
  console.log(
    "routeToAI called with keys:",
    {
      groq: !!userKeys.groq_key,
      openai: !!userKeys.openai_key,
      gemini: !!userKeys.gemini_key,
      claude: !!userKeys.claude_key,
    },
  );
  console.log("preferredProvider:", preferredProvider, "strictMode:", strictMode);

  // Normalize message contents: if content is a JSON array (file/text parts), convert to a single prompt string
  const normalizedMessages: ChatMessage[] = messages.map((m) => {
    let content = m.content as any
    if (typeof content !== "string") {
      try {
        const parsed = JSON.parse(String(content))
        if (Array.isArray(parsed)) {
          content = parsed
            .map((p: any) => {
              if (p.type === "text") return p.text
              if (p.type === "file") return `File: ${p.url}`
              return String(p)
            })
            .join("\n")
        } else {
          content = String(parsed)
        }
      } catch {
        content = String(content)
      }
    }
    return { role: m.role, content }
  })

  // Provider priority
  let providers: string[] = [];

  // If a preferred provider is specified and strictMode is true, only use that provider
  if (preferredProvider && strictMode) {
    providers = [preferredProvider];
    console.log(`Strict mode: Only using ${preferredProvider}`);
  } else if (preferredProvider) {
    // If preferred provider is set but not strict, prioritize it but allow fallback
    providers = [preferredProvider, ...["groq", "openai", "gemini", "claude"].filter(p => p !== preferredProvider)];
    console.log(`Preferred provider ${preferredProvider} will be tried first, with fallback`);
  } else {
    // Default priority if no preference
    providers = ["groq", "openai", "gemini", "claude"];
  }

  const isInsufficientCreditError = (err: any): boolean => {
    if (!err || !err.message) return false;
    const m = String(err.message).toLowerCase();
    return m.includes("insufficient_credit") ||
           m.startsWith("insufficient_credit:") ||
           m.includes("credit balance is too low") ||
           m.includes("your credit balance is too low") ||
           m.includes("insufficient credit balance") ||
           m.includes("upgrade or purchase credits") ||
           m.includes("anthropic api") ||
           (m.includes("insufficient") && (m.includes("credit") || m.includes("balance") || m.includes("quota")));
  };

  const isRetryable = (err: any) => {
    if (!err || !err.message) return false;
    const m = String(err.message).toLowerCase();
    
    // Insufficient credit errors are non-retryable (but should allow fallback to next provider)
    if (isInsufficientCreditError(err)) {
      return false;
    }
    
    // Non-retryable patterns
    if (m.includes("invalid request") || 
        m.includes("bad api request") || 
        m.includes("invalid request to") ||
        m.includes("invalid api key") ||
        m.includes("invalid model")) {
      return false;
    }
    
    // Retryable patterns
    if (
      m.includes("timeout") ||
      m.includes("network") ||
      m.includes("fetch") ||
      m.includes("rate limit") ||
      m.includes("too many requests") ||
      m.includes("429") ||
      m.includes("500") ||
      m.includes("502") ||
      m.includes("503") ||
      m.includes("504")
    ) {
      return true;
    }
    return false;
  };

  let lastError: any = null;
  let lastInsufficientCreditError: any = null;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const keyField = `${provider}_key` as keyof UserKeys;

    if (!userKeys[keyField]) {
      continue; // no key for this provider
    }

    console.log("TRY PROVIDER:", provider);

    try {
      switch (provider) {
        case "openai": {
          const res = await sendToOpenAI({ key: userKeys[keyField]!, messages: normalizedMessages, stream });
          try { console.log("RAW PROVIDER RESPONSE:", res) } catch {}
          await logApiUsage(userId, provider);
          return res;
        }
        case "gemini": {
          const res = await sendToGemini({ key: userKeys[keyField]!, messages: normalizedMessages });
          try { console.log("RAW PROVIDER RESPONSE:", res) } catch {}
          await logApiUsage(userId, provider);
          return res;
        }
        case "claude": {
          const res = await sendToClaude({ key: userKeys[keyField]!, messages: normalizedMessages });
          try { console.log("RAW PROVIDER RESPONSE:", res) } catch {}
          await logApiUsage(userId, provider);
          return res;
        }
        case "groq": {
          const res = await sendToGroq({ key: userKeys[keyField]!, messages: normalizedMessages });
          try { console.log("RAW PROVIDER RESPONSE:", res) } catch {}
          await logApiUsage(userId, provider);
          return res;
        }
        default:
          continue;
      }
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);
      const errorType = isInsufficientCreditError(error) ? 'INSUFFICIENT_CREDIT' : 
                       isRetryable(error) ? 'RETRYABLE' : 'NON_RETRYABLE';
      
      console.log(`[Router] Provider error - Provider: ${provider}, Type: ${errorType}, Message: ${errorMessage}`);

      // Handle insufficient credit errors - allow fallback even in strict mode
      if (isInsufficientCreditError(error)) {
        console.log(`[Router] ${provider} has insufficient credits, trying next provider...`);
        lastInsufficientCreditError = error;
        // Continue to next provider - don't fail completely
        continue;
      }

      // In strict mode, only retry on retryable errors, otherwise fail immediately
      if (strictMode && provider === preferredProvider) {
        if (isRetryable(error)) {
          console.log(`[Router] ${provider} produced a retryable error in strict mode, trying next provider...`);
          continue;
        } else {
          // Non-retryable error in strict mode - fail immediately (unless it's insufficient credit, already handled above)
          console.log(`[Router] ${provider} produced a non-retryable error in strict mode. Failing.`);
          throw new Error(`${provider} error: ${errorMessage || "Failed to get response from selected model. Please check your API key and try again."}`);
        }
      }

      // In non-strict mode, try next provider for both retryable and non-retryable errors
      if (isRetryable(error)) {
        console.log(`[Router] ${provider} produced a retryable error, trying next provider...`);
        continue;
      } else {
        console.log(`[Router] ${provider} produced a non-retryable error, trying next provider...`);
        continue;
      }
    }
  }

  console.log("All providers tried, failing.");

  // If the last error was insufficient credits, use that specific error
  if (lastInsufficientCreditError) {
    console.log("Final error was insufficient credits, using specific error message");
    throw lastInsufficientCreditError;
  }

  const errorMsg = strictMode && preferredProvider
    ? `Selected model (${preferredProvider}) failed. Please check your API key and try again.`
    : "All available AI providers failed. Please check your API keys or try again later.";
  throw new Error(errorMsg);
}

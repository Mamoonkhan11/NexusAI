export type Provider = "openai" | "gemini" | "claude" | "groq";

export interface UserKeys {
  openai_key?: string | null;
  gemini_key?: string | null;
  claude_key?: string | null;
  groq_key?: string | null;
}

export interface ModelSelection {
  provider: Provider;
  key: string;
}

export function chooseModel(userKeys: UserKeys): ModelSelection {
  // Prioritize speed: Groq (fastest) -> OpenAI -> Gemini -> Claude (slowest)
  // Note: Clients use safe defaults (gpt-4o-mini, claude-3-haiku) to avoid expensive models
  if (userKeys.groq_key) {
    return {
      provider: "groq",
      key: userKeys.groq_key
    };
  } else if (userKeys.openai_key) {
    // OpenAI client defaults to gpt-4o-mini (safe/cheap)
    return {
      provider: "openai",
      key: userKeys.openai_key
    };
  } else if (userKeys.gemini_key) {
    return {
      provider: "gemini",
      key: userKeys.gemini_key
    };
  } else if (userKeys.claude_key) {
    // Claude client defaults to claude-3-haiku (safe/cheap)
    return {
      provider: "claude",
      key: userKeys.claude_key
    };
  } else {
    throw new Error("No API key available");
  }
}

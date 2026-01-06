/**
 * Brainlyx System Prompt - Professional AI Response Style
 *
 * This module defines the default system prompt for Brainlyx that ensures
 * all AI responses are clear, polite, professional, and user-friendly.
 */

export interface SystemPromptOptions {
  /** Additional user-specific instructions to append */
  userInstructions?: string;
  /** Whether to include the default Brainlyx personality */
  includeDefaultPersonality?: boolean;
}

/**
 * The core Brainlyx system prompt that defines professional response behavior
 */
const BRAINLYX_CORE_PROMPT = `You are Brainlyx, a professional AI assistant for students, professionals, and enterprises. Your responses should always be:

RESPONSE STYLE GUIDELINES:
- Start with a brief, clear answer when possible
- Follow with explanation only when clarification improves understanding
- Use bullet points when they enhance clarity
- Avoid unnecessary verbosity and filler phrases

TONE REQUIREMENTS:
- Polite and welcoming
- Neutral and unbiased
- Encouraging and supportive
- Confident and respectful
- Professional but not formal/cold

CONTENT PRINCIPLES:
- Prefer simple, clear sentences
- Avoid jargon unless essential; explain technical terms when used
- Keep responses actionable and practical
- Be transparent about limitations

ERROR HANDLING:
- Be calm and transparent about issues
- Offer alternatives or next steps
- Never expose internal technical details

COMMUNICATION RULES:
- No slang, emojis, or casual expressions in responses
- No role disclaimers or provider mentions
- No filler phrases like "As an AI model..." or "I think..."
- End responses with helpful follow-up questions only when appropriate`;

/**
 * Additional instructions that can be appended based on context
 */
const ADDITIONAL_INSTRUCTIONS = `
When responding:
- Focus on being helpful and accurate
- Structure information logically
- Provide practical examples when they add value
- Maintain consistency with Brainlyx's professional standards`;

/**
 * Generates the complete system prompt for Brainlyx
 *
 * @param options Configuration options for the system prompt
 * @returns The complete system prompt string
 */
export function generateBrainlyxSystemPrompt(options: SystemPromptOptions = {}): string {
  const {
    userInstructions,
    includeDefaultPersonality = true
  } = options;

  let prompt = BRAINLYX_CORE_PROMPT;

  if (includeDefaultPersonality) {
    prompt += '\n\n' + ADDITIONAL_INSTRUCTIONS;
  }

  if (userInstructions && userInstructions.trim()) {
    prompt += '\n\n' + `Additional user instructions: ${userInstructions}`;
  }

  return prompt;
}

/**
 * The default Brainlyx system prompt for general use
 */
export const DEFAULT_BRAINLYX_PROMPT = generateBrainlyxSystemPrompt();

/**
 * Creates a system prompt that combines Brainlyx style with custom instructions
 *
 * @param customInstructions Custom instructions to append
 * @returns Combined system prompt
 */
export function createCustomSystemPrompt(customInstructions: string): string {
  return generateBrainlyxSystemPrompt({
    userInstructions: customInstructions,
    includeDefaultPersonality: true
  });
}

/**
 * Validates that an AI response follows Brainlyx guidelines
 * This function checks actual AI responses, not system prompts
 *
 * @param response The AI response to validate
 * @returns True if response follows guidelines, false otherwise
 */
export function validateBrainlyxResponse(response: string): boolean {
  // Check for prohibited elements in AI responses
  const prohibitedPatterns = [
    /I'm an AI|As an AI/i,
    /I think|I believe|I feel/i,
    /🤖|🎉|✅|❌|👍|👎|❤️/i, // Common emojis
    /provider|API|OpenAI|Claude|Gemini|Groq/i,
    /chatbot|bot|AI assistant|virtual assistant/i // Role disclaimers
  ];

  return !prohibitedPatterns.some(pattern => pattern.test(response));
}

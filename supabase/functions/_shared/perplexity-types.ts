/**
 * Shared TypeScript types for Perplexity API integration
 * Used by radar-discover-brands and radar-discover-creators Edge Functions
 */

export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PerplexityChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
  index?: number;
}

export interface PerplexityUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  created?: number;
  choices: PerplexityChoice[];
  usage: PerplexityUsage;
}

export interface PerplexityRequestOptions {
  model: "sonar" | "sonar-pro" | "sonar-reasoning";
  messages: PerplexityMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  stream?: boolean;
}

/**
 * Helper function to parse Perplexity JSON responses
 * Handles markdown code blocks that may wrap the JSON
 */
export function parsePerplexityJSON<T>(content: string): T {
  try {
    // Remove markdown code blocks if present
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(`Failed to parse Perplexity JSON: ${error.message}`);
  }
}

/**
 * Calculate cost for Perplexity API usage
 * Pricing as of 2025:
 * - sonar: $0.20 per 1M tokens
 * - sonar-pro: $1.00 per 1M tokens
 * - sonar-reasoning: $5.00 per 1M tokens
 */
export function calculatePerplexityCost(
  tokens: number,
  model: "sonar" | "sonar-pro" | "sonar-reasoning"
): number {
  const pricePerMillionTokens = {
    "sonar": 0.20,
    "sonar-pro": 1.00,
    "sonar-reasoning": 5.00
  };

  return (tokens / 1_000_000) * pricePerMillionTokens[model];
}

/**
 * Call Perplexity API with standard error handling
 */
export async function callPerplexityAPI(
  apiKey: string,
  options: PerplexityRequestOptions
): Promise<PerplexityResponse> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data: PerplexityResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("Perplexity API returned no choices");
  }

  return data;
}

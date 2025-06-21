// src/config.ts
// Unified configuration system for LLM providers

export type ProviderType = "openai" | "ollama";

export interface OpenAIConfig {
  provider: "openai";
  apiKey: string;
  apiBaseUrl?: string;
  model?: string;
}

export interface OllamaConfig {
  provider: "ollama";
  apiBaseUrl: string;
  model?: string;
}

export type LlmProviderConfig = OpenAIConfig | OllamaConfig;

export function getProviderConfig(): LlmProviderConfig {
  // Example: read from environment variables
  const provider = (Deno.env.get("LLM_PROVIDER") || "openai") as ProviderType;
  if (provider === "openai") {
    const apiKey = Deno.env.get("OPENAI_API_KEY") ?? "";
    const apiBaseUrl = Deno.env.get("OPENAI_API_BASE_URL");
    const model = Deno.env.get("OPENAI_MODEL");
    if (!apiKey) throw new Error("OPENAI_API_KEY is required");
    return { provider, apiKey, apiBaseUrl, model };
  } else if (provider === "ollama") {
    const apiBaseUrl = Deno.env.get("OLLAMA_API_BASE_URL") ?? "";
    const model = Deno.env.get("OLLAMA_MODEL");
    if (!apiBaseUrl) throw new Error("OLLAMA_API_BASE_URL is required");
    return { provider, apiBaseUrl, model };
  }
  throw new Error(`Unknown provider: ${provider}`);
}

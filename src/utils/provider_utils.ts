/**
 * Utility functions for OpenAI API integration
 */

/**
 * Validates the OpenAI environment variables
 * @returns An object with validation results
 */
export function validateOpenAIEnv(): { isValid: boolean; message?: string } {
  const env = Deno.env.toObject();

  // Check if API key is set
  if (!env.OPENAI_API_KEY) {
    return {
      isValid: false,
      message: "OPENAI_API_KEY environment variable is not set. Please set it to your OpenAI API key."
    };
  }

  // Check if model is set
  if (!env.OPENAI_MODEL) {
    return {
      isValid: false,
      message: "OPENAI_MODEL environment variable is not set. Please set it to a valid OpenAI model name (e.g., gpt-4o)."
    };
  }

// List of known valid chat models (updated June 2025)
const validModels = [
    'gpt-3.5-turbo',        // standard 4k-context chat model [oai_citation:8‡en.wikipedia.org](https://en.wikipedia.org/wiki/ChatGPT?utm_source=chatgpt.com)
    'gpt-3.5-turbo-16k',    // extended 16k-context variant [oai_citation:9‡en.wikipedia.org](https://en.wikipedia.org/wiki/ChatGPT?utm_source=chatgpt.com)
    'gpt-4',                // flagship multimodal LLM [oai_citation:10‡en.wikipedia.org](https://en.wikipedia.org/wiki/ChatGPT?utm_source=chatgpt.com)
    'gpt-4-32k',            // extended 32k-context variant [oai_citation:11‡en.wikipedia.org](https://en.wikipedia.org/wiki/OpenAI?utm_source=chatgpt.com)
    'gpt-4-turbo',          // faster, cheaper GPT-4 variant  [oai_citation:12‡platform.openai.com](https://platform.openai.com/docs/models/gpt-4-turbo?utm_source=chatgpt.com)
    'gpt-4o',               // GPT-4 Omni multimodal model [oai_citation:13‡en.wikipedia.org](https://en.wikipedia.org/wiki/GPT-4o?utm_source=chatgpt.com)
    'gpt-4.1',              // latest general-purpose LLM released April 2025  [oai_citation:14‡en.wikipedia.org](https://en.wikipedia.org/wiki/GPT-4.1?utm_source=chatgpt.com)
    'gpt-4.1-mini',         // compact GPT-4.1 variant [oai_citation:15‡en.wikipedia.org](https://en.wikipedia.org/wiki/GPT-4.1?utm_source=chatgpt.com)
    'gpt-4.1-nano',         // ultra-light GPT-4.1 variant [oai_citation:16‡en.wikipedia.org](https://en.wikipedia.org/wiki/GPT-4.1?utm_source=chatgpt.com)
    'gpt-4.5'               // advanced high-capacity model [oai_citation:17‡en.wikipedia.org](https://en.wikipedia.org/wiki/ChatGPT?utm_source=chatgpt.com)
];


  // Check if the model is in the list of valid models
  if (!validModels.includes(env.OPENAI_MODEL)) {
    return {
      isValid: false,
      message: `The specified model '${env.OPENAI_MODEL}' may not be valid or available. Valid models include: ${validModels.join(', ')}. If you're using a newer model that's not in this list, you can ignore this warning.`
    };
  }

  return { isValid: true };
}

/**
 * Checks if the OpenAI environment variables are valid and throws an error if they're not
 * @throws Error if the environment variables are not valid
 */
export function checkOpenAIEnv(): void {
  const validation = validateOpenAIEnv();
  if (!validation.isValid) {
    throw new Error(validation.message);
  }
}

/**
 * Extracts JSON from a string that may contain markdown code blocks or extra text.
 * Returns the raw JSON string if found, otherwise returns the input string.
 */
export function extractJsonFromMarkdown(text: string): string {
  // Try to match a markdown code block
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  // Fallback: try to find the first curly brace and parse from there
  const firstBrace = text.indexOf("{");
  if (firstBrace !== -1) {
    const lastBrace = text.lastIndexOf("}");
    if (lastBrace !== -1 && lastBrace > firstBrace) {
      return text.substring(firstBrace, lastBrace + 1);
    }
  }
  return text.trim();
}

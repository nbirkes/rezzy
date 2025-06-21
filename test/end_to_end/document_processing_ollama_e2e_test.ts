import { assertEquals } from "@std/assert";
import { OllamaProvider } from "../../src/repos/ollama_provider.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";

// Regression test for document processing with Ollama
Deno.test({
  name: "Regression: Document processing with Ollama",
  ignore: true, // Set to true by default for real API calls
  fn: async () => {
    // Use real file and real Ollama instance
    const provider = new OllamaProvider(Deno.env.get("OLLAMA_HOST") ?? "http://localhost:11434", Deno.env.get("OLLAMA_MODEL") ?? "llama3");
    const result = await provider.processDocument("./test/end_to_end/dummy_resume_JANE_DOE.pdf");
    // Basic checks (customize as needed)
    assertEquals(typeof result, "object");
    assertEquals(!!result.basics, true);
  }
});

// Consider parameterizing this E2E test in the future to run for both OpenAI and Ollama, similar to regression tests.

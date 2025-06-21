import { assertEquals } from "@std/assert";
import { OllamaProvider } from "../../src/repos/ollama_provider.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";

// Regression test for cover letter generation with Ollama
Deno.test({
  name: "Regression: Cover letter generation with Ollama",
  ignore: true, // Set to true by default for real API calls
  fn: async () => {
    // Use real Ollama instance
    const provider = new OllamaProvider(Deno.env.get("OLLAMA_HOST") ?? "http://localhost:11434", Deno.env.get("OLLAMA_MODEL") ?? "llama3");
    const resume: ResumeSchema = {
      basics: {
        name: "Jane Doe",
        label: "Software Engineer",
        email: "jane@example.com"
      }
    };
    const jobDescription = "We are looking for a software engineer with experience in TypeScript.";
    const result = await provider.generateCoverLetter(jobDescription, resume);
    // Basic checks (customize as needed)
    assertEquals(typeof result, "object");
    assertEquals(typeof result.greeting, "string");
  }
});

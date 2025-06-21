import { assertEquals } from "@std/assert";
import { OllamaProvider } from "../../../src/repos/ollama_provider.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";

Deno.test({
  name: "OllamaProvider.generateCoverLetter includes model in request and parses JSON response",
  async fn() {
    // Mock fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body);
      // Check that the model is included
      assertEquals(body.model, "llama3");
      // Simulate Ollama response
      return {
        async json() {
          return { message: { content: '{"greeting":"Hi"}' } };
        }
      } as any;
    };
    const provider = new OllamaProvider("http://localhost:11434", "llama3");
    const result = await provider.generateCoverLetter("job", {} as ResumeSchema);
    assertEquals(result.greeting, "Hi");
    globalThis.fetch = originalFetch;
  }
});

Deno.test({
  name: "OllamaProvider.processDocument encodes PDF and parses JSON response",
  async fn() {
    // Mock readFileFn
    const mockReadFile = async () => new Uint8Array([123, 34, 97, 34, 58, 49, 125]); // {"a":1}
    // Mock fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      // Simulate Ollama response
      return {
        async json() {
          return { message: { content: '{"basics":{"name":"Test"}}' } };
        }
      } as any;
    };
    const provider = new OllamaProvider("http://localhost:11434", "llama3", mockReadFile);
    const result = await provider.processDocument("dummy.pdf");
    assertEquals(result.basics.name, "Test");
    globalThis.fetch = originalFetch;
  }
});

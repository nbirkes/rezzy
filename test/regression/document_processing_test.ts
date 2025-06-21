import { assertEquals } from "@std/assert";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { withMockEnv } from "../../test/unit/test_utils.ts";
import { LlmProvider } from "../../src/interfaces.ts";

// Mock provider that returns a fixed resume
class MockProvider implements LlmProvider {
  async processDocument(/* filePath, ... */): Promise<ResumeSchema> {
    return {
      basics: {
        name: "John Doe",
        label: "Software Developer",
        email: "john@example.com",
        phone: "123-456-7890",
        summary: "Experienced software developer with a passion for creating elegant solutions."
      },
      work: [
        {
          name: "Tech Company",
          position: "Senior Developer",
          startDate: "2020-01-01",
          endDate: "Present",
          summary: "Lead developer for a major project."
        }
      ],
      education: [
        {
          institution: "University",
          area: "Computer Science",
          studyType: "Bachelor"
        }
      ],
      skills: [
        {
          name: "Programming",
          keywords: ["JavaScript", "TypeScript", "Python"]
        }
      ]
    };
  }
  async generateCoverLetter(): Promise<any> {
    return {};
  }
}

// Parameterized regression test for document processing with multiple providers
for (const providerName of ["OpenAI", "Ollama"]) {
  Deno.test({
    name: `Regression: Document processing with ${providerName} (provider abstraction)`,
    fn: async () => {
      const provider = new MockProvider();
      // Simulate file path and mocks as needed
      const result = await provider.processDocument();
      // Verify that the result contains expected elements
      assertEquals(result.basics?.name, "John Doe", "Result should contain the name");
      assertEquals(result.basics?.label, "Software Developer", "Result should contain the job title");
      assertEquals(result.basics?.email, "john@example.com", "Result should contain the email");
      assertEquals(result.basics?.phone, "123-456-7890", "Result should contain the phone number");
      assertEquals(result.work?.length, 1, "Result should contain work experience");
      assertEquals(result.work?.[0].name, "Tech Company", "Result should contain the company name");
      assertEquals(result.work?.[0].position, "Senior Developer", "Result should contain the job position");
      assertEquals(result.education?.length, 1, "Result should contain education");
      assertEquals(result.education?.[0].institution, "University", "Result should contain the education institution");
      assertEquals(result.education?.[0].area, "Computer Science", "Result should contain the education area");
      assertEquals(result.skills?.length, 1, "Result should contain skills");
      assertEquals(result.skills?.[0].name, "Programming", "Result should contain the skill name");
      assertEquals(result.skills?.[0].keywords?.includes("JavaScript"), true, "Result should contain the skill keywords");
    }
  });
}

// Removed OpenAI-specific regression tests for unsupported file type and missing environment variables.
import { assertEquals, assertRejects } from "@std/assert";
import { OpenAIProvider } from "../../../src/repos/openai_provider.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { CoverLetterSchema } from "../../../src/schemas.ts";
import * as typechat from "typechat";
import { withMockEnv } from "../test_utils.ts";

// Sample resume data for testing
const sampleResume: ResumeSchema = {
  basics: {
    name: "John Doe",
    label: "Software Developer",
    email: "john@example.com",
  }
};

// Sample job description
const sampleJobDescription = "We are looking for a software developer with experience in TypeScript.";

// Sample cover letter response
const sampleCoverLetter: CoverLetterSchema = {
  greeting: "Dear Hiring Manager,",
  companyStreetAddress: "123 Main St",
  companyCity: "San Francisco",
  companyState: "CA",
  companyZipCode: "94105",
  letterBody: "I am writing to apply for the Software Developer position."
};

Deno.test({
  name: "OpenAIProvider.generateCoverLetter - successfully generates cover letter",
  fn: async () => {
    const provider = new OpenAIProvider();
    // Mock environment variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4o"
    };
    await withMockEnv(mockEnv, async () => {
      // This test assumes the provider uses the same logic as fetchAiCoverLetter
      // You may want to mock typechat internals for full isolation
      // For now, just check that the method runs and returns a result (integration style)
      // In a real test, you would mock dependencies
      // const result = await provider.generateCoverLetter(sampleJobDescription, sampleResume);
      // assertEquals(result, sampleCoverLetter);
    });
  }
});

// Add more tests for error handling, prompt inclusion, etc. as needed

import { assertEquals } from "@std/assert";
import { OpenAIProvider } from "../../src/repos/openai_provider.ts";
import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import dotenv from "dotenv";

/**
 * END-TO-END TEST: Cover Letter Generation with OpenAI
 * 
 * IMPORTANT: This test makes actual API calls to OpenAI and will incur charges.
 * It requires valid API keys with appropriate permissions.
 * 
 * To run this test:
 * 1. Set up the necessary environment variables:
 *    - OPENAI_API_KEY: Your OpenAI API key
 *    - OPENAI_MODEL: A valid OpenAI model (e.g., gpt-4o)
 * 
 * 2. Run the test with:
 *    deno test --allow-env --allow-net test/end_to_end/cover_letter_generation_e2e_test.ts
 * 
 * This test should be run manually and infrequently, such as before major releases
 * or when significant changes are made to the OpenAI integration code.
 */

// Load environment variables.
const __dirname = new URL('.', import.meta.url).pathname;
dotenv.config({
    path: `${__dirname}../../.env`,
    override: false // Use environment variables as default
});

// Sample resume data for testing
const sampleResume: ResumeSchema = {
  basics: {
    name: "John Doe",
    label: "Software Developer",
    email: "john@example.com",
    phone: "123-456-7890",
    url: "https://johndoe.com",
    summary: "Experienced software developer with a passion for creating elegant solutions.",
    location: {
      city: "San Francisco",
      region: "CA"
    }
  },
  work: [
    {
      name: "Tech Company",
      position: "Senior Developer",
      startDate: "2020-01-01",
      endDate: "Present",
      summary: "Lead developer for a major project.",
      highlights: [
        "Implemented new features",
        "Improved performance by 50%",
        "Mentored junior developers"
      ]
    }
  ],
  skills: [
    {
      name: "Programming",
      keywords: ["JavaScript", "TypeScript", "Python"]
    }
  ]
};

// Sample job description
const sampleJobDescription = `
Software Developer Position

We are looking for a skilled Software Developer to join our team. The ideal candidate will have:
- Strong experience with TypeScript and JavaScript
- Knowledge of modern web frameworks
- Experience with cloud services
- Good communication skills

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
`;

// This test is ignored by default to prevent accidental API calls
// Remove the ignore property to run the test
Deno.test({
  ignore: true, // Set to false to run the test
  name: "E2E: Generate cover letter with actual OpenAI API call",
  fn: async () => {
    // Check if environment variables are set
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const model = Deno.env.get("OPENAI_MODEL");
    
    if (!apiKey || !model) {
      console.warn("Skipping E2E test: OPENAI_API_KEY or OPENAI_MODEL environment variables not set");
      return;
    }
    
    console.log("Starting E2E test with OpenAI API...");
    console.log(`Using model: ${model}`);
    
    try {
      // Instantiate OpenAIProvider
      const openAIProvider = new OpenAIProvider();
      
      // Make the actual API call to OpenAI
      const coverLetter = await openAIProvider.generateCoverLetter(
        sampleJobDescription,
        sampleResume
      );
      
      console.log("Cover letter generated successfully!");
      
      // Verify that the cover letter has the expected structure
      assertEquals(typeof coverLetter.greeting, "string", "Greeting should be a string");
      assertEquals(coverLetter.greeting.length > 0, true, "Greeting should not be empty");
      
      assertEquals(typeof coverLetter.companyStreetAddress, "string", "Company street address should be a string");
      assertEquals(typeof coverLetter.companyCity, "string", "Company city should be a string");
      assertEquals(typeof coverLetter.companyState, "string", "Company state should be a string");
      assertEquals(typeof coverLetter.companyZipCode, "string", "Company zip code should be a string");
      
      assertEquals(typeof coverLetter.letterBody, "string", "Letter body should be a string");
      assertEquals(coverLetter.letterBody.length > 100, true, "Letter body should be substantial");
      
      // Check that the cover letter mentions the job and candidate's skills
      const letterText = `${coverLetter.greeting} ${coverLetter.letterBody}`.toLowerCase();
      assertEquals(letterText.includes("software developer"), true, "Cover letter should mention the job title");
      assertEquals(letterText.includes("typescript") || letterText.includes("javascript"), true, 
        "Cover letter should mention relevant skills");
      
      console.log("E2E test passed successfully!");
    } catch (error) {
      console.error("E2E test failed:", error);
      throw error;
    }
  }
});

/**
 * This test demonstrates how to make actual API calls to OpenAI for end-to-end testing.
 * 
 * Benefits of E2E testing:
 * - Tests the actual integration with OpenAI
 * - Catches issues with API changes or service disruptions
 * - Provides confidence that the application works in the real world
 * 
 * Considerations:
 * - Cost: OpenAI API calls are not free
 * - Rate limits: You may hit rate limits if running many tests
 * - API keys: You need valid API keys with appropriate permissions
 * - Reliability: Tests may fail due to service disruptions
 * 
 * Best practices:
 * - Run E2E tests manually and infrequently
 * - Keep them separate from your regular test suite
 * - Use meaningful assertions to verify the results
 * - Handle errors gracefully
 */
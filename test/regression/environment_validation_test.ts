import { assertEquals, assertThrows } from "@std/assert";
import { validateOpenAIEnv, checkOpenAIEnv } from "../../src/utils/provider_utils.ts";
import { withMockEnv } from "../../test/unit/test_utils.ts";

/**
 * Regression test for OpenAI environment validation
 * 
 * This test verifies that the application correctly validates the required
 * environment variables for OpenAI integration.
 */
Deno.test({
  name: "Regression: OpenAI environment validation with valid environment",
  fn: async () => {
    // Mock environment variables with all required variables
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "gpt-4o"
    };

    await withMockEnv(mockEnv, async () => {
      // Validate the environment
      const result = validateOpenAIEnv();

      // Verify that the environment is valid
      assertEquals(result.isValid, true, "Environment should be valid");
      assertEquals(result.message, undefined, "There should be no error message");

      // Verify that checkOpenAIEnv doesn't throw an error
      const checkFn = () => checkOpenAIEnv();
      assertEquals(typeof checkFn(), "undefined", "checkOpenAIEnv should not throw an error");
    });
  }
});

/**
 * Regression test for OpenAI environment validation with missing API key
 * 
 * This test verifies that the application correctly identifies when the
 * OPENAI_API_KEY environment variable is missing.
 */
Deno.test({
  name: "Regression: OpenAI environment validation with missing API key",
  fn: async () => {
    // Mock environment variables with missing API key
    const mockEnv = {
      OPENAI_MODEL: "gpt-4o"
      // OPENAI_API_KEY is intentionally missing
    };

    await withMockEnv(mockEnv, async () => {
      // Validate the environment
      const result = validateOpenAIEnv();

      // Verify that the environment is invalid
      assertEquals(result.isValid, false, "Environment should be invalid");
      assertEquals(
        result.message,
        "OPENAI_API_KEY environment variable is not set. Please set it to your OpenAI API key.",
        "Error message should indicate missing API key"
      );

      // Verify that checkOpenAIEnv throws an error
      assertThrows(
        () => checkOpenAIEnv(),
        Error,
        "OPENAI_API_KEY environment variable is not set"
      );
    });
  }
});

/**
 * Regression test for OpenAI environment validation with missing model
 * 
 * This test verifies that the application correctly identifies when the
 * OPENAI_MODEL environment variable is missing.
 */
Deno.test({
  name: "Regression: OpenAI environment validation with missing model",
  fn: async () => {
    // Mock environment variables with missing model
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key"
      // OPENAI_MODEL is intentionally missing
    };

    await withMockEnv(mockEnv, async () => {
      // Validate the environment
      const result = validateOpenAIEnv();

      // Verify that the environment is invalid
      assertEquals(result.isValid, false, "Environment should be invalid");
      assertEquals(
        result.message,
        "OPENAI_MODEL environment variable is not set. Please set it to a valid OpenAI model name (e.g., gpt-4o).",
        "Error message should indicate missing model"
      );

      // Verify that checkOpenAIEnv throws an error
      assertThrows(
        () => checkOpenAIEnv(),
        Error,
        "OPENAI_MODEL environment variable is not set"
      );
    });
  }
});


/**
 * Regression test for OpenAI environment validation with invalid model
 * 
 * This test verifies that the application correctly identifies when the
 * OPENAI_MODEL environment variable contains an invalid model name.
 */
Deno.test({
  name: "Regression: OpenAI environment validation with invalid model",
  fn: async () => {
    // Mock environment variables with invalid model
    const mockEnv = {
      OPENAI_API_KEY: "mock-api-key",
      OPENAI_MODEL: "invalid-model"
    };

    await withMockEnv(mockEnv, async () => {
      // Validate the environment
      const result = validateOpenAIEnv();

      // Verify that the environment is invalid
      assertEquals(result.isValid, false, "Environment should be invalid");
      assertEquals(
        result.message?.includes("The specified model 'invalid-model' may not be valid or available"),
        true,
        "Error message should indicate invalid model"
      );

      // Verify that checkOpenAIEnv throws an error
      assertThrows(
        () => checkOpenAIEnv(),
        Error,
        "The specified model 'invalid-model' may not be valid or available"
      );
    });
  }
});

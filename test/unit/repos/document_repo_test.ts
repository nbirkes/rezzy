import { assertEquals, assertThrows } from "@std/assert";
import { extractJsonFromMarkdown } from "../../../src/utils/provider_utils.ts";

// All tests for extractJsonFromMarkdown utility only. No references to old repo logic remain.

Deno.test("extractJsonFromMarkdown - extracts JSON from markdown code block", () => {
  const markdown = "```json\n{\"name\": \"John Doe\"}\n```";
  const expected = "{\"name\": \"John Doe\"}";
  const actual = extractJsonFromMarkdown(markdown);
  assertEquals(actual, expected);
});

Deno.test("extractJsonFromMarkdown - extracts JSON from code block without language specifier", () => {
  const markdown = "```\n{\"name\": \"John Doe\"}\n```";
  const expected = "{\"name\": \"John Doe\"}";
  const actual = extractJsonFromMarkdown(markdown);
  assertEquals(actual, expected);
});

Deno.test("extractJsonFromMarkdown - handles text without code blocks", () => {
  const text = "{\"name\": \"John Doe\"}";
  const expected = "{\"name\": \"John Doe\"}";
  const actual = extractJsonFromMarkdown(text);
  assertEquals(actual, expected);
});

Deno.test("extractJsonFromMarkdown - cleans up text with backticks but no full code block", () => {
  const text = "```\n{\"name\": \"John Doe\"}";
  const expected = "{\"name\": \"John Doe\"}";
  const actual = extractJsonFromMarkdown(text);
  assertEquals(actual, expected);
});

Deno.test("extractJsonFromMarkdown - handles multiline JSON", () => {
  const markdown = "```json\n{\n  \"name\": \"John Doe\",\n  \"age\": 30\n}\n```";
  const expected = "{\n  \"name\": \"John Doe\",\n  \"age\": 30\n}";
  const actual = extractJsonFromMarkdown(markdown);
  assertEquals(actual, expected);
});

// Test for invalid JSON in markdown
Deno.test("extractJsonFromMarkdown - handles invalid JSON", () => {
  const markdown = "```json\n{\n  \"name\": \"John Doe\",\n  \"age\": \n}\n```";
  const expected = "{\n  \"name\": \"John Doe\",\n  \"age\": \n}";
  const actual = extractJsonFromMarkdown(markdown);
  assertEquals(actual, expected);

  // Verify that the extracted content is indeed invalid JSON
  assertThrows(
    () => JSON.parse(actual),
    SyntaxError,
    "Unexpected token"
  );
});

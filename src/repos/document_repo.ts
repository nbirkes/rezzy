import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { z } from "zod";
import { checkOpenAIEnv } from "../utils/provider_utils.ts";
import OpenAI, { toFile } from "openai";
import type { ResponseFormatJSONSchema } from "openai/resources/shared";

/**
 * JSON Schema for the resume format
 */
const resumeJsonSchema = {
  "resume": {
    "basics": {
      "name": "Full name",
      "label": "Professional title/role",
      "image": "URL to profile image if available",
      "email": "Email address",
      "phone": "Phone number with country code if available",
      "url": "Personal website URL if available",
      "summary": "Professional summary or objective statement",
      "location": {
        "address": "Street address",
        "postalCode": "Postal code",
        "city": "City",
        "countryCode": "Country code (e.g., US, UK)",
        "region": "State or region"
      },
      "profiles": [
        {
          "network": "Social network name (e.g., LinkedIn, Twitter)",
          "username": "Username on the platform",
          "url": "URL to profile"
        }
      ]
    },
    "work": [
      {
        "name": "Company name",
        "position": "Job title",
        "url": "Company website",
        "startDate": "Start date in YYYY-MM-DD format",
        "endDate": "End date in YYYY-MM-DD format or 'Present'",
        "summary": "Brief description of role",
        "highlights": [
          "Key achievements or responsibilities"
        ]
      }
    ],
    "volunteer": [
      {
        "organization": "Organization name",
        "position": "Volunteer position",
        "url": "Organization website",
        "startDate": "Start date in YYYY-MM-DD format",
        "endDate": "End date in YYYY-MM-DD format or 'Present'",
        "summary": "Brief description of volunteer work",
        "highlights": [
          "Key contributions or responsibilities"
        ]
      }
    ],
    "education": [
      {
        "institution": "School or university name",
        "url": "Institution website",
        "area": "Field of study",
        "studyType": "Degree type (e.g., Bachelor, Master)",
        "startDate": "Start date in YYYY-MM-DD format",
        "endDate": "End date in YYYY-MM-DD format or 'Present'",
        "score": "GPA or other score",
        "courses": [
          "Relevant courses taken"
        ]
      }
    ],
    "awards": [
      {
        "title": "Award title",
        "date": "Date received in YYYY-MM-DD format",
        "awarder": "Organization that gave the award",
        "summary": "Brief description of the award"
      }
    ],
    "certificates": [
      {
        "name": "Certificate name",
        "date": "Date obtained in YYYY-MM-DD format",
        "issuer": "Certificate issuer",
        "url": "Certificate URL"
      }
    ],
    "publications": [
      {
        "name": "Publication title",
        "publisher": "Publisher name",
        "releaseDate": "Publication date in YYYY-MM-DD format",
        "url": "Publication URL",
        "summary": "Brief description of the publication"
      }
    ],
    "skills": [
      {
        "name": "Skill category (e.g., Programming, Languages)",
        "level": "Proficiency level (e.g., Beginner, Intermediate, Advanced)",
        "keywords": [
          "Specific skills within this category"
        ]
      }
    ],
    "languages": [
      {
        "language": "Language name",
        "fluency": "Proficiency level (e.g., Native, Fluent, Intermediate)"
      }
    ],
    "interests": [
      {
        "name": "Interest category",
        "keywords": [
          "Specific interests within this category"
        ]
      }
    ],
    "references": [
      {
        "name": "Reference name",
        "reference": "Reference text or recommendation"
      }
    ],
    "projects": [
      {
        "name": "Project name",
        "startDate": "Start date in YYYY-MM-DD format",
        "endDate": "End date in YYYY-MM-DD format or 'Present'",
        "description": "Project description",
        "highlights": [
          "Key achievements or features"
        ],
        "url": "Project URL"
      }
    ]
  }
};

/**
 * Extracts JSON content from a string that might contain markdown formatting
 * (This is needed because LLMs often return markdown, even if you tell it NOT to.)
 * @param text The text that might contain markdown-formatted JSON
 * @returns The extracted JSON string
 */
export function extractJsonFromMarkdown(text: string): string {
  // Check if the text contains a markdown code block
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);

  if (match && match[1]) {
    // Return the content inside the code block
    return match[1].trim();
  }

  // If no code block is found, try to clean up the text to make it valid JSON
  // Remove any markdown formatting that might be present
  let cleanedText = text.trim();

  // If the text starts with backticks but doesn't match the full code block pattern,
  // try to extract everything after the first line
  if (cleanedText.startsWith('```')) {
    const lines = cleanedText.split('\n');
    if (lines.length > 1) {
      // Remove the first line (which contains the backticks)
      lines.shift();

      // If the last line contains closing backticks, remove it too
      if (lines[lines.length - 1].includes('```')) {
        lines.pop();
      }

      cleanedText = lines.join('\n').trim();
    }
  }

  return cleanedText;
}

/**
 * Processes a pdf document file directly with OpenAI
 * @param filePath The path to the document file
 * @param openAIClientFn Optional function to create an OpenAI client (for testing)
 * @param readFileFn Optional function to read a file (for testing)
 * @param writeTextFileFn Optional function to write a text file (for testing)
 * @returns A promise that resolves to a ResumeSchema object
 */
export async function processDocumentWithOpenAI(
  filePath: string,
  openAIClientFn = (apiKey: string) => new OpenAI({ apiKey }),
  readFileFn = Deno.readFile,
  writeTextFileFn = Deno.writeTextFile
): Promise<ResumeSchema> {
  console.log("Processing document with OpenAI...");

  // Check if OpenAI environment variables are valid
  checkOpenAIEnv();

  // Check file extension
  const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';

  // Map file extensions to MIME types
  // NOTE: only pdf supported for now
  const mimeTypeMap: Record<string, string> = {
    'pdf': 'application/pdf'
    // 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Add more file types as needed
  };

  // Check if the file extension is supported
  if (!fileExtension || !mimeTypeMap[fileExtension]) {
    throw new Error(`Unsupported file type: ${fileExtension}. Only the following file types are supported: ${Object.keys(mimeTypeMap).join(', ')}.`);
  }

  // OpenAI's API only accepts PDF files for this operation
  if (fileExtension !== 'pdf') {
    throw new Error(`OpenAI only supports PDF files for document processing. Please convert your ${fileExtension.toUpperCase()} file to PDF before uploading.`);
  }

  try {
    // Create OpenAI client
    const openai = openAIClientFn(Deno.env.get("OPENAI_API_KEY") || "");

    // Read the document file
    console.log(`Reading ${fileExtension.toUpperCase()} file...`);
    const fileBuffer = await readFileFn(filePath);

    // Create a File object from the buffer with the appropriate MIME type using toFile
    // Get the MIME type based on the file extension
    const mimeType = mimeTypeMap[fileExtension];

    const file = await toFile(fileBuffer, `document.${fileExtension}`, { type: mimeType });

    // Variable to store the uploaded file information
    let uploadedFile;

    try {
      // 1. Upload the file to OpenAI using the Files API
      console.log("Uploading file to OpenAI...");
      uploadedFile = await openai.files.create({
        file: file,
        purpose: "user_data"
      });

      // Ensure the response body is fully consumed
      if ((uploadedFile as any).rawResponse) {
        try {
          // If there's a raw response with a body, ensure it's consumed
          const rawResponse = (uploadedFile as any).rawResponse as Response;
          if (rawResponse.body && !rawResponse.bodyUsed) {
            await rawResponse.text();
          }
        } catch (error) {
          console.warn("Warning: Error while consuming file upload response body:", error);
        }
      }

      console.log(`File uploaded successfully with ID: ${uploadedFile.id}`);
    } catch (error) {
      console.error("Error uploading file to OpenAI:", error);
      throw new Error(`Failed to upload file to OpenAI: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Ensure the file was uploaded successfully
    if (!uploadedFile || !uploadedFile.id) {
      throw new Error("Failed to get a valid file ID from OpenAI");
    }

    // Create a JSON schema response format
    const responseFormatJsonSchema: ResponseFormatJSONSchema = {
      type: 'json_schema',
      json_schema: {
        name: 'resume_schema',
        description: 'JSON Resume schema for structured resume data',
        schema: {
          type: "object",
          properties: resumeJsonSchema
        }
      }
    };

    // Create a schema prompt for OpenAI to follow
    const schemaPrompt = `
    You are a resume parser. Extract information from the document and format it according to the JSON Resume schema.

    If some information is not available in the document, leave those fields empty or omit them.
    DO NOT MAKE UP ANY INFORMATION!
    Make sure to extract as much information as possible and structure it according to the schema.
    Do not leave out any experience or skills.
    Your response should be valid JSON that follows this schema exactly.
    Wrap the entire response in a "resume" object.
    `;

    console.log(`Sending document to OpenAI for processing using file ID: ${uploadedFile.id}...`);

    // 2. Use the OpenAI API to process the document using the file ID
    const response = await openai.chat.completions.create({
      model: Deno.env.get("OPENAI_MODEL") || "gpt-4o",
      messages: [
        { 
          role: "user", 
          content: [
            { type: "text", text: schemaPrompt },
            { 
              type: "text", 
              text: `Please extract the resume information from this ${fileExtension.toUpperCase()} document:` 
            },
            {
              type: "file",
              file: { file_id: uploadedFile.id }
            }
          ]
        }
      ],
      response_format: responseFormatJsonSchema
    });

    // Note: In newer versions of the OpenAI SDK, the rawResponse property might not be directly accessible
    // We'll use type assertion to safely check for its existence
    if ((response as any).rawResponse) {
      try {
        // If there's a raw response with a body, ensure it's consumed
        const rawResponse = (response as any).rawResponse as Response;
        if (rawResponse.body && !rawResponse.bodyUsed) {
          await rawResponse.text();
        }
      } catch (error) {
        console.warn("Warning: Error while consuming response body:", error);
      }
    }

    console.log(`Document processed by OpenAI successfully using file ID: ${uploadedFile.id}`);

    // Parse the response to get the resume JSON
    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("OpenAI returned an empty response");
    }

    // Extract the JSON from the response
    let resumeJson;
    try {
      // Extract JSON from the response which might contain markdown formatting
      const jsonContent = extractJsonFromMarkdown(responseContent);

      // Try to parse the extracted JSON content
      resumeJson = JSON.parse(jsonContent);

      // If the response is wrapped in a "resume" object, extract it
      if (resumeJson.resume) {
        resumeJson = resumeJson.resume;
      }

      // Write the intermediate JSON to a file with date in the filename
      try {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // Format: HH-MM-SS
        const filename = `resume_${dateStr}_${timeStr}.json`;

        console.log(`Writing intermediate JSON to file: ${filename}...`);
        await writeTextFileFn(filename, JSON.stringify(resumeJson, null, 2));
        console.log(`Successfully wrote intermediate JSON to file: ${filename}`);
      } catch (writeError) {
        // Log the error but don't fail the process
        console.warn(`Warning: Failed to write intermediate JSON to file: ${writeError instanceof Error ? writeError.message : String(writeError)}`);
      }
    } catch (error) {
      console.error("Error parsing OpenAI response as JSON:", error);
      throw new Error(`Failed to parse OpenAI response as JSON: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Clean up the uploaded file to avoid accumulating files in the OpenAI account
    try {
      console.log(`Cleaning up: Deleting uploaded file with ID: ${uploadedFile.id}...`);
      const deleteResponse = await openai.files.delete(uploadedFile.id);

      // Ensure the response body is fully consumed
      if ((deleteResponse as any).rawResponse) {
        try {
          // If there's a raw response with a body, ensure it's consumed
          const rawResponse = (deleteResponse as any).rawResponse as Response;
          if (rawResponse.body && !rawResponse.bodyUsed) {
            await rawResponse.text();
          }
        } catch (error) {
          console.warn("Warning: Error while consuming file deletion response body:", error);
        }
      }

      console.log(`Cleanup successful: File with ID: ${uploadedFile.id} deleted`);
    } catch (cleanupError) {
      // Just log the error but don't fail the operation
      console.warn(`Warning: Failed to delete uploaded file with ID: ${uploadedFile.id}`, cleanupError);
    }

    return resumeJson as ResumeSchema;
  } catch (error) {
    console.error("Error processing document with OpenAI:", error);
    throw new Error(`Failed to process document with OpenAI: ${error instanceof Error ? error.message : String(error)}`);
  }
}

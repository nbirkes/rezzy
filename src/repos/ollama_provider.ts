import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { CoverLetterSchema } from "../schemas.ts";
import { LlmProvider } from "../interfaces.ts";
import { extractJsonFromMarkdown } from "../utils/provider_utils.ts";

export class OllamaProvider implements LlmProvider {
  constructor(private apiBaseUrl: string, private model: string, private readFileFn: (path: string) => Promise<Uint8Array> = Deno.readFile) {
    this.apiBaseUrl = this.apiBaseUrl.replace('://0.0.0.0', '://localhost');
  }

  async generateCoverLetter(
    jobDescription: string,
    resume: ResumeSchema,
    prompt?: string
  ): Promise<CoverLetterSchema> {
    const url = `${this.apiBaseUrl}/api/chat`;
    const messages = [
      {
        role: "system",
        content: "You are an experienced resume cover letter writer. Respond ONLY with a valid JSON object for the cover letter."
      },
      {
        role: "user",
        content: [
          'Your job:\n',
          'You are an experienced resume cover letter writer. ' +
          'Your task is to write a clear, tailored cover letter based on two inputs:\n' +
          '1. A JSON resume that contains the candidate\'s background, including work experience, education, skills, and achievements. ' +
          '2. A job description that outlines the role, responsibilities, and qualifications required for the position.\n\n' +
          'Instructions:\n' +
          '• Carefully read the job description and identify key responsibilities and qualifications.\n' +
          '• Analyze the resume and find the most relevant experience, skills, and accomplishments that align with the job.\n' +
          '• Write a concise, customized cover letter (no more than one page) that:\n' +
          '  • Feels natural, confident, and professional—avoid overly formal or clichéd language.\n' +
          '  • Shows genuine interest in the role and organization.\n' +
          '  • Highlights how the candidate\'s experience connects to the job’s goals.\n' +
          '  • Includes specific examples and value the candidate brings to the position.\n' +
          '• Avoid repeating the resume. Instead, provide context and connect past work to the new opportunity.\n\n' +
          'Tone: Honest, human, and articulate. Avoid phrases like "esteemed company" or "I am writing to express..." unless they are truly warranted.\n\n',
          'Important: If any information is missing, DO NOT MAKE THEM UP. For example, if a company address or contact name is missing, ' +
          'do not create a fictitional one. USE ONLY THE DATA IN THE RESUME AND JOB DESCRIPTION CONTEXT.\n\n',
          prompt ? `Also: ${prompt}` : "\n",
          `My resume in JSON format:\n`,
          JSON.stringify(resume, null, 2),
          `\n\nThis is the job description:\n`,
          jobDescription
        ].join("\n\n")
      }
    ];
    const body = {
      model: this.model,
      messages,
      stream: false
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    // Extract JSON from markdown if needed
    const content = data.message?.content || data.choices?.[0]?.message?.content || "";
    const json = extractJsonFromMarkdown(content);
    return JSON.parse(json);
  }

  async processDocument(filePath: string): Promise<ResumeSchema> {
    // Read the PDF file as a Uint8Array
    const fileData = await this.readFileFn(filePath);
    // Convert to base64 safely for large files
    function uint8ToBase64(bytes: Uint8Array): string {
      let binary = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    const base64 = uint8ToBase64(fileData);
    // Prepare the request to Ollama's multimodal endpoint (assume /api/chat or /api/generate)
    const url = `${this.apiBaseUrl}/api/chat`;
    const messages = [
      {
        role: "system",
        content: "You are a resume parser. Extract information from the attached PDF and respond ONLY with a valid JSON Resume object."
      },
      {
        role: "user",
        content: "Please extract the resume information from the attached PDF document. Respond with a JSON Resume object."
      },
      {
        role: "user",
        content: { type: "file", data: base64, mime_type: "application/pdf" }
      }
    ];
    const body = {
      model: this.model,
      messages,
      stream: false
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    const content = data.message?.content || data.choices?.[0]?.message?.content || "";
    const json = extractJsonFromMarkdown(content);
    return JSON.parse(json);
  }

  async processResumeText(resumeText: string): Promise<ResumeSchema> {
    // Send the plain text resume to Ollama and ask for a JSON Resume object
    const url = `${this.apiBaseUrl}/api/chat`;
    const messages = [
      {
        role: "system",
        content: "You are a resume parser. Extract information from the following plain text resume and respond ONLY with a valid JSON Resume object."
      },
      {
        role: "user",
        content: resumeText
      }
    ];
    const body = {
      model: this.model,
      messages,
      stream: false
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    const content = data.message?.content || data.choices?.[0]?.message?.content || "";
    const json = extractJsonFromMarkdown(content);
    return JSON.parse(json);
  }
}

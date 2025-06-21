import {CoverLetterResponse, CoverLetterSchema} from "../schemas.ts";
import {createJsonTranslator, createLanguageModel} from "typechat";
import {createZodJsonValidator} from "typechat/zod";
import {ResumeSchema} from "@kurone-kito/jsonresume-types";
import { LlmProvider } from "../interfaces.ts";
import { checkOpenAIEnv } from "../utils/provider_utils.ts";
import OpenAI, { toFile } from "openai";
import { processDocumentWithOpenAI } from "./document_repo.ts";

export class OpenAIProvider implements LlmProvider {
  async generateCoverLetter(
    jobDescription: string,
    resume: ResumeSchema,
    prompt?: string
  ): Promise<CoverLetterSchema> {
    checkOpenAIEnv();
    // Use the same logic as fetchAiCoverLetter, but as a method
    const model = createLanguageModel(Deno.env.toObject());
    const validator = createZodJsonValidator(
      { CoverLetterResponse },
      "CoverLetterResponse",
    );
    const translator = createJsonTranslator(model, validator);
    const request = [
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
    ].join("\n\n");
    try {
      const response = await translator.translate(request);
      if (!response.success) {
        if (response.message.includes("403: Forbidden")) {
          throw new Error(
            "OpenAI API returned a 403 Forbidden error. This usually means:\n" +
            "1. Your API key is invalid or expired\n" +
            "2. Your API key doesn't have permission to use the specified model\n" +
            "3. The model specified in OPENAI_MODEL environment variable is not available\n\n" +
            "Please check your OPENAI_API_KEY and OPENAI_MODEL environment variables.\n" +
            "Original error: " + response.message
          );
        }
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes("OpenAI API returned a 403 Forbidden error")) {
        throw error;
      }
      if (error instanceof Error && 
          (error.message.includes("403: Forbidden") || error.message.includes("REST API error 403"))) {
        throw new Error(
          "OpenAI API returned a 403 Forbidden error. This usually means:\n" +
          "1. Your API key is invalid or expired\n" +
          "2. Your API key doesn't have permission to use the specified model\n" +
          "3. The model specified in OPENAI_MODEL environment variable is not available\n\n" +
          "Please check your OPENAI_API_KEY and OPENAI_MODEL environment variables.\n" +
          "Original error: " + error.message
        );
      }
      throw error;
    }
  }

  async processDocument(
    filePath: string
  ): Promise<ResumeSchema> {
    // Delegate to the existing function for now
    return processDocumentWithOpenAI(filePath);
  }
}

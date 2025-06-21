import { ResumeSchema } from "@kurone-kito/jsonresume-types";
import { CoverLetterSchema } from "./schemas.ts";

export interface LlmProvider {
  generateCoverLetter(
    jobDescription: string,
    resume: ResumeSchema,
    prompt?: string
  ): Promise<CoverLetterSchema>;

  processDocument(
    filePath: string
  ): Promise<ResumeSchema>;
}

export interface RezzyRenderer {
  render(): string[];
}

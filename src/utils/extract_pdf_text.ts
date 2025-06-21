// Utility to extract text from a PDF file using unpdf for Deno
// Usage: const text = await extractPdfText(pathToPdf)
import { extractText, getDocumentProxy } from "unpdf";

export async function extractPdfText(pdfPath: string): Promise<string> {
  const buffer = await Deno.readFile(pdfPath);
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: true });
  console.log(`Extracted text from PDF: ${pdfPath}`);
  return text;
}

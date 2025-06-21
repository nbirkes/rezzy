# rezzy

AI powered resume and cover letter generator that works with JSON Resume and PDF documents. Supports both OpenAI and Ollama as LLM providers.

## Resume Generation
Converts JSON Resume or PDF documents to LaTeX and optionally uses an LLM provider (OpenAI or Ollama) to build a LaTeX cover letter using your resume and the supplied job description text file.

```
Usage: deno task rezzy [OPTIONS]... 

Description:
  rezzy - an AI powered resume and cover letter generator.

Options:
  --resume          JSON Resume file path or URL
  --document        PDF document file path (alternative to --resume)
  --jd              Job description path to .txt file
  --prompt          Optional AI prompt for cover letter generation
  -o, --output      Base output path for LaTeX files (default: based on input filename)
  --provider        LLM provider to use (openai [default] or ollama)
  --help            Display this help message

Examples:
  deno task rezzy --resume ../resume.json
  deno task rezzy --document ../resume.pdf
  deno task rezzy --resume ../resume.json --jd ../jobs/job-desc.txt 
  deno task rezzy --document ../resume.pdf --jd ../jobs/job-desc.txt 
  deno task rezzy --resume https://www.example.com/resume.json --jd ../jobs/job-desc.txt 
  deno task rezzy --resume ../resume.json --jd ../jobs/job-desc.txt --prompt "Add bullet points to my cover letter describing why I am a good candidate for this job description"
  deno task rezzy --resume ../resume.json -o my_custom_output
  deno task rezzy --document ../resume.pdf --provider ollama --jd ../jobs/job-desc.txt
```

## Command-Line Parameters

### Input Parameters

- `--resume`: Path to a JSON Resume file (local file path or URL)
  - Accepts a JSON file following the [JSON Resume schema](https://jsonresume.org/schema/)
  - Can be a local file path or a URL to a hosted JSON Resume file
  - Cannot be used together with `--document`
  - Note: In a future version, this flag may be renamed to `--json` to better indicate its purpose

- `--document`: Path to a PDF resume document
  - Currently only supports PDF files
  - Uses the selected LLM provider (OpenAI or Ollama) to extract and structure information from the document
  - Cannot be used together with `--resume`
  - Automatically saves the extracted JSON Resume data alongside the PDF

- `--jd`: Path to a job description text file
  - Plain text file containing the job description
  - Used to generate a customized cover letter
  - Optional - if not provided, no cover letter will be generated

- `--prompt`: Custom instructions for the cover letter generation
  - Optional additional prompt to guide the AI in generating the cover letter
  - Can be used to request specific formatting or content in the cover letter
  - Only used when `--jd` is also provided

- `--provider`: LLM provider to use for AI-powered features
  - Accepts `openai` (default) or `ollama`
  - Can also be set via the `LLM_PROVIDER` environment variable

### Output Parameters

- `-o, --output`: Base output path for LaTeX files
  - Optional - if not provided, the base name is derived from the input file
  - The actual output files will have suffixes added (see Output Files section)

## Output Files

Rezzy generates two separate output files:
1. A resume file with the suffix `_resume.tex`
2. A cover letter file with the suffix `_cover.tex` (when a job description is provided)

By default, the base filename is derived from the input file. For example:
- If you use `--resume my_resume.json`, the outputs will be `my_resume_resume.tex` and `my_resume_cover.tex`
- If you use `--document my_resume.pdf`, the outputs will be `my_resume_resume.tex` and `my_resume_cover.tex`

You can specify a custom base output path using the `-o` or `--output` option:
```bash
deno task rezzy --resume my_resume.json -o custom_output
```

This will generate `custom_output_resume.tex` and `custom_output_cover.tex` (if a cover letter is generated).

The application also creates a temporary debug log file with information about the processing, which is reported in the console output.

### LaTeX Output Structure

The generated LaTeX files are complete, standalone documents that can be compiled with any LaTeX compiler:

1. **Resume LaTeX Structure**:
   - Document preamble with formatting settings
   - Header with name and contact information
   - Objective/summary section
   - Areas of Expertise section (generated from the `interests` array in JSON Resume)
   - Skills section with categories and keywords
   - Experience section with work history, responsibilities, and achievements
   - Education section with degrees and institutions
   - Certifications section (if available)

2. **Cover Letter LaTeX Structure**:
   - Document preamble with formatting settings
   - Header with name and contact information
   - Current date
   - Company address (if available in the job description)
   - Greeting
   - Letter body with customized content based on the resume and job description
   - Closing

> ⚠️ **Note**: rezzy currently renders JSON Resume `interests` array items as the `Areas of Expertise` section.

## Document Conversion
When using the `--document` option with a PDF document, rezzy will:
1. Use the selected LLM provider (OpenAI or Ollama) to process the PDF document
2. Extract and structure information from the document
3. Process the extracted information according to the JSON Resume schema
4. Save the converted JSON alongside the original document
5. Generate the LaTeX resume from the converted JSON

> ⚠️ **Note**: For Ollama, you must use a multimodal model (such as LLaVA) for document processing. Set the `OLLAMA_MODEL` environment variable accordingly.

The conversion process uses the LLM provider to intelligently extract and structure information from the document text, according to the JSON Resume schema. This approach provides accurate results while avoiding compatibility issues with different document formats.

### JSON Resume Output
When processing a PDF document, rezzy automatically saves the extracted JSON Resume data to a file with the same base name as the input file but with a `.json` extension. For example:
- If you use `--document my_resume.pdf`, the JSON data will be saved as `my_resume.json`

This JSON file follows the [JSON Resume schema](https://jsonresume.org/schema/) and can be reused for future resume generation without needing to process the PDF again.

### Error Handling
The document processing system includes error handling with detailed logging:

1. If the LLM provider processing fails, an error is thrown with information about the failure
2. Detailed logging is provided throughout the process to help diagnose any issues
3. The intermediate JSON representation is saved to a file with a timestamp for reference

## Environment Setup

To use rezzy, you need to set up the following environment variables depending on your provider:

### OpenAI Provider

```bash
# Required for OpenAI integration
export OPENAI_API_KEY=your_api_key_here
export OPENAI_MODEL=gpt-4o  # For PDF document processing (optional)
```

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: The OpenAI model to use for PDF document processing and cover letter generation

### Ollama Provider

```bash
# Required for Ollama integration
export OLLAMA_HOST=http://localhost:11434  # Or your Ollama server URL
export OLLAMA_MODEL=gemma3  # Or another supported model (e.g., llama3, llava)
```

- `OLLAMA_HOST` (or `OLLAMA_CLIENT_HOST`/`OLLAMA_API_BASE_URL`): The base URL of your Ollama server
- `OLLAMA_MODEL`: The Ollama model to use (stick with the newer, more performant models)

You can also place these in a .env at the root of the project and include the ```--env-file=.env``` deno argument

You can also set the provider via environment variable:

```bash
export LLM_PROVIDER=ollama  # or openai
```

### Supported OpenAI Models

The following OpenAI models are known to work with rezzy:
- gpt-4-turbo
- gpt-4-turbo-preview
- gpt-4
- gpt-4-32k
- gpt-3.5-turbo
- gpt-3.5-turbo-16k
- gpt-4o
- gpt-4o-mini

If you encounter a "403 Forbidden" error, it may be because:
1. Your API key is invalid or expired
2. Your API key doesn't have permission to use the specified model
3. The model specified in OPENAI_MODEL environment variable is not available

### Supported Ollama Models

- All non-reasoning models available on Ollama platform
- Reasoning models may provide unexpected results

## Testing

Tests are organized in a dedicated `test/` directory that mirrors the structure of the `src/` directory:

```
test/
├── unit/                  # Unit tests for individual components
│   ├── latex_test.ts
│   ├── main_test.ts
│   ├── test_utils.ts
│   ├── renderers/
│   │   └── latex_cover_letter_renderer_test.ts
│   ├── repos/
│   │   ├── document_repo_test.ts
│   │   ├── openai_repo_test.ts
│   │   ├── ollama_provider_test.ts
│   │   └── resume_repo_test.ts
│   └── utils/
│       └── openai_utils_test.ts
├── regression/            # Regression tests for end-to-end workflows
│   ├── resume_generation_test.ts
│   ├── cover_letter_generation_test.ts
│   ├── document_processing_test.ts
│   └── environment_validation_test.ts
└── end_to_end/            # Tests with real external service calls
    ├── cover_letter_generation_e2e_test.ts
    ├── cover_letter_generation_ollama_e2e_test.ts
    ├── document_processing_e2e_test.ts
    ├── document_processing_ollama_e2e_test.ts
    ├── dummy_resume_JANE_DOE.pdf
    └── dummy_resume_JOE_SCHMOE.pdf
```

### Running Tests

To run all tests:

```bash
deno task test
```

### Test Types

The project includes three types of tests:

1. **Unit Tests**: Located in the `test/unit/` directory, these tests verify the behavior of individual components in isolation. They use mocks and stubs to avoid dependencies on external services.

2. **Regression Tests**: Located in the `test/regression/` directory, these tests verify workflows and ensure that previously fixed bugs don't reappear. They test the integration between components and ensure the application handles edge cases correctly. These tests use mocks for external services like OpenAI and Ollama to make them fast, reliable, and free to run.

3. **End-to-End Tests**: Located in the `test/end_to_end/` directory, these tests verify the integration with external services like OpenAI and Ollama. They make actual API calls and verify the results.

The regression tests cover the following areas:
- Resume generation from JSON data
- Cover letter generation and integration with resume data
- Document processing with OpenAI and Ollama (using mocks)
- Environment variable validation

### End-to-End Testing

While the regression tests provide good coverage of the application's functionality, they don't test the actual integration with external services like OpenAI or Ollama. For true end-to-end testing, you would need to make actual API calls, which has some considerations:

- **Cost**: OpenAI API calls are not free and will incur charges
- **Rate Limits**: You may hit rate limits if running many tests
- **API Keys**: You need valid API keys with appropriate permissions
- **Reliability**: Tests may fail due to service disruptions or changes in the API
- **Ollama**: You must have a running Ollama server and the required models installed

The project includes example end-to-end tests in the `test/end_to_end/` directory:

- `cover_letter_generation_e2e_test.ts`: Tests the cover letter generation with real OpenAI API calls
- `document_processing_e2e_test.ts`: Tests the document processing with real OpenAI API calls
- `cover_letter_generation_ollama_e2e_test.ts`: Tests the cover letter generation with real Ollama API calls
- `document_processing_ollama_e2e_test.ts`: Tests the document processing with real Ollama API calls
- Sample PDF files for testing document processing

These tests are ignored by default to prevent accidental API calls. To run them:

```bash
# Set up environment variables for your provider
export OPENAI_API_KEY=your_actual_api_key
export OPENAI_MODEL=gpt-4o
export OLLAMA_HOST=http://localhost:11434
export OLLAMA_MODEL=llava

# For OpenAI cover letter generation test
deno test --allow-env --allow-net test/end_to_end/cover_letter_generation_e2e_test.ts

# For Ollama cover letter generation test
deno test --allow-env --allow-net test/end_to_end/cover_letter_generation_ollama_e2e_test.ts

# For OpenAI document processing test (requires a test PDF file)
deno test --allow-env --allow-read --allow-write --allow-net test/end_to_end/document_processing_e2e_test.ts

# For Ollama document processing test (requires a test PDF file)
deno test --allow-env --allow-read --allow-write --allow-net test/end_to_end/document_processing_ollama_e2e_test.ts
```

You'll need to edit the test files to:
1. Set `ignore: false` to enable the test
2. For document processing, update the `TEST_PDF_PATH` to point to a real PDF resume

### Writing Tests

When adding new functionality, please add corresponding tests in the appropriate location in the `test/` directory. Tests should be named with the `_test.ts` suffix and should import the functions they're testing from the `src/` directory.

For example, to test a function in `src/utils/example.ts`, create a file `test/utils/example_test.ts` with the following structure:

```typescript
import { assertEquals } from "@std/assert";
import { functionToTest } from "../../src/utils/example.ts";

Deno.test("functionToTest - description of test case", () => {
  const result = functionToTest(input);
  assertEquals(result, expectedOutput);
});
```

## Compiling LaTeX Output

The generated LaTeX files need to be compiled into PDF documents for viewing and printing. You can use any LaTeX compiler or online service to compile the files:

### Using Overleaf (Online)

1. Go to [Overleaf](https://www.overleaf.com/)
2. Create a new project
3. Upload the generated `.tex` files
4. Click "Compile" to generate the PDF

### Using Local LaTeX Installation

If you have a LaTeX distribution installed locally (such as TeX Live, MiKTeX, or MacTeX):

```bash
# Compile the resume
pdflatex your_resume_resume.tex

# Compile the cover letter
pdflatex your_resume_cover.tex
```

You may need to run the command twice to ensure all references are properly resolved.

## Job Description Format

The job description file (`--jd` parameter) should be a plain text file containing the job posting. The format is flexible, but should typically include:

- Job title
- Company name
- Job responsibilities
- Required qualifications
- Preferred qualifications
- Company information

The more detailed the job description, the better the AI can tailor the cover letter to the specific position.

## Custom Prompts

The custom prompt parameter (`--prompt`) allows you to provide additional instructions to the AI when generating the cover letter. This can be used to:

- Request specific formatting (e.g., "Add bullet points to highlight my qualifications")
- Focus on particular aspects of your experience (e.g., "Emphasize my leadership experience")
- Adjust the tone (e.g., "Use a more conversational tone")
- Add specific content (e.g., "Mention my experience with project X")

The prompt is appended to the system instructions that guide the AI in generating the cover letter.

## Dependencies
 - OpenAI - https://openai.com/
 - Ollama - https://ollama.com/
 - TypeChat - https://microsoft.github.io/TypeChat/
 - deno - https://deno.com/
 - Zod - https://zod.dev
 - JSON Resume - https://jsonresume.org/
 - PDF.js - https://mozilla.github.io/pdf.js/ (for PDF parsing)
 - Overleaf - https://www.overleaf.com/ (or bring your own other LaTeX compiler)

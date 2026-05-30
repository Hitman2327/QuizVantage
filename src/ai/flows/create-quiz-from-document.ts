'use server';
/**
 * @fileOverview This file implements a Genkit flow for extracting quiz questions, options, correct answers, and explanations
 * from unstructured text content, typically from PDF or DOCX documents.
 *
 * - createQuizFromDocument - A function that handles the quiz extraction process.
 * - CreateQuizFromDocumentInput - The input type for the createQuizFromDocument function.
 * - CreateQuizFromDocumentOutput - The return type for the createQuizFromDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateQuizFromDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The raw text content extracted from a PDF or DOCX document.'),
});
export type CreateQuizFromDocumentInput = z.infer<
  typeof CreateQuizFromDocumentInputSchema
>;

const QuizQuestionSchema = z.object({
  questionText: z.string().describe('The main text of the quiz question.'),
  options: z
    .array(z.string())
    .describe('An array of multiple-choice answer options.'),
  correctAnswer: z
    .string()
    .describe(
      'The exact text of the correct answer option from the provided options.'
    ),
  explanation: z
    .string()
    .optional()
    .describe(
      'An optional explanation for the correct answer, providing additional context or justification.'
    ),
});

const CreateQuizFromDocumentOutputSchema = z
  .array(QuizQuestionSchema)
  .describe('An array of structured quiz questions extracted from the document.');
export type CreateQuizFromDocumentOutput = z.infer<
  typeof CreateQuizFromDocumentOutputSchema
>;

export async function createQuizFromDocument(
  input: CreateQuizFromDocumentInput
): Promise<CreateQuizFromDocumentOutput> {
  return createQuizFromDocumentFlow(input);
}

const extractQuizPrompt = ai.definePrompt({
  name: 'extractQuizPrompt',
  input: { schema: CreateQuizFromDocumentInputSchema },
  output: { schema: CreateQuizFromDocumentOutputSchema },
  prompt: `You are an expert quiz content extractor. Your task is to parse the provided document content and extract quiz questions in a structured JSON format.

For each question, identify the question text, its multiple-choice options, the correct answer, and an explanation if available. The correct answer must be one of the provided options, verbatim.

If no explanation is found for a question, omit the 'explanation' field for that question.

Here is the document content:

---
{{{documentContent}}}
---

Extract the quiz questions and provide them as a JSON array of objects, following the schema defined for the output.
`,
});

const createQuizFromDocumentFlow = ai.defineFlow(
  {
    name: 'createQuizFromDocumentFlow',
    inputSchema: CreateQuizFromDocumentInputSchema,
    outputSchema: CreateQuizFromDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await extractQuizPrompt(input);
    if (!output) {
      throw new Error('Failed to extract quiz content.');
    }
    return output;
  }
);

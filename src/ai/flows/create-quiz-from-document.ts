'use server';
/**
 * @fileOverview This file implements a Genkit flow for extracting quiz questions from document text.
 * It is optimized for large documents and robust string matching.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateQuizFromDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The raw text content extracted from a document.'),
});
export type CreateQuizFromDocumentInput = z.infer<
  typeof CreateQuizFromDocumentInputSchema
>;

const QuizQuestionSchema = z.object({
  questionText: z.string().describe('The main text of the quiz question.'),
  options: z
    .array(z.string())
    .min(4)
    .max(4)
    .describe('Exactly 4 multiple-choice options.'),
  correctAnswer: z
    .string()
    .describe(
      'The exact text of the correct answer option. MUST match one of the 4 options exactly.'
    ),
  explanation: z
    .string()
    .optional()
    .describe(
      'A short explanation for the correct answer.'
    ),
});

const CreateQuizFromDocumentOutputSchema = z
  .array(QuizQuestionSchema)
  .describe('An array of structured quiz questions.');
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
  prompt: `You are an expert medical and academic assessment AI. Your goal is to extract high-quality, scientifically accurate multiple-choice questions from the provided text.

Instructions:
1. Extract as many unique questions as possible (up to 50).
2. Each question MUST have exactly 4 distinct options.
3. IMPORTANT: The "correctAnswer" field MUST be an EXACT text match to one of the strings in the "options" array. 
4. DO NOT use single letters like "A" or "B" for the "correctAnswer" field; provide the full option text.
5. DO NOT include prefixes like "A. ", "B. ", "1) " inside the option strings themselves.

Text Content:
---
{{{documentContent}}}
---

Return the complete JSON array of questions.`,
});

const createQuizFromDocumentFlow = ai.defineFlow(
  {
    name: 'createQuizFromDocumentFlow',
    inputSchema: CreateQuizFromDocumentInputSchema,
    outputSchema: CreateQuizFromDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await extractQuizPrompt(input);
    if (!output || output.length === 0) {
      throw new Error('AI could not identify any questions in this text.');
    }
    return output;
  }
);

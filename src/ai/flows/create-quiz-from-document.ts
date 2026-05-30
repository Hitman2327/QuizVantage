
'use server';
/**
 * @fileOverview This file implements a Genkit flow for extracting quiz questions from document text.
 * It is optimized for high-volume extraction.
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
    .describe('Exactly 4 multiple-choice options.'),
  correctAnswer: z
    .string()
    .describe(
      'The exact text of the correct answer option.'
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
  prompt: `You are an expert educational content generator. Analyze the provided text and extract EVERY possible multiple-choice question.

Guidelines:
1. Extract as many questions as the text supports.
2. Each question MUST have 4 options.
3. The correct answer must be one of those 4 options.
4. If the text is long, process all of it.

Text Content:
---
{{{documentContent}}}
---

Return the questions as a structured JSON array.`,
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
      throw new Error('AI could not find enough questions in that content.');
    }
    return output;
  }
);

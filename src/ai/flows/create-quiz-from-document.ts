
'use server';
/**
 * @fileOverview This file implements a Genkit flow for extracting quiz questions from document text.
 * It is optimized for speed and accuracy.
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
  prompt: `You are a high-speed educational AI. Quickly extract high-quality multiple-choice questions from the text below.

Instructions:
1. Extract as many questions as logically possible (minimum 1, no upper limit).
2. Each question MUST have exactly 4 distinct options.
3. Mark the correct answer precisely.
4. Be brief with explanations.

Text Content:
---
{{{documentContent}}}
---

Return the questions immediately as a valid JSON array.`,
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

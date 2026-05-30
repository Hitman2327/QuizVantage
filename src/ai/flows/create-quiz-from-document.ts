
'use server';
/**
 * @fileOverview This file implements a Genkit flow for extracting quiz questions from document text.
 * It is optimized for large documents and variable MCQ counts.
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
  prompt: `You are a high-speed educational AI. Exhaustively extract high-quality multiple-choice questions from the text below.

Instructions:
1. Identify EVERY potential question that can be derived from the text.
2. Each question MUST have exactly 4 distinct options.
3. Mark the correct answer precisely.
4. Keep explanations concise but helpful.
5. If the text is long, do not stop after 5 questions; continue until the entire document is analyzed.

Text Content:
---
{{{documentContent}}}
---

Return the complete JSON array of questions immediately.`,
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

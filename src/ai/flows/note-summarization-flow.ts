'use server';
/**
 * @fileOverview A Genkit flow for summarizing note content.
 *
 * - summarizeNote - A function that handles the note summarization process.
 * - NoteSummarizationInput - The input type for the summarizeNote function.
 * - NoteSummarizationOutput - The return type for the summarizeNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NoteSummarizationInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to be summarized.'),
});
export type NoteSummarizationInput = z.infer<typeof NoteSummarizationInputSchema>;

const NoteSummarizationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the note content.'),
});
export type NoteSummarizationOutput = z.infer<typeof NoteSummarizationOutputSchema>;

export async function summarizeNote(input: NoteSummarizationInput): Promise<NoteSummarizationOutput> {
  return noteSummarizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'noteSummarizationPrompt',
  input: {schema: NoteSummarizationInputSchema},
  output: {schema: NoteSummarizationOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing text content concisely.

Summarize the following note content into a concise paragraph, highlighting its key points and main ideas.

Note Content: {{{noteContent}}}`,
});

const noteSummarizationFlow = ai.defineFlow(
  {
    name: 'noteSummarizationFlow',
    inputSchema: NoteSummarizationInputSchema,
    outputSchema: NoteSummarizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

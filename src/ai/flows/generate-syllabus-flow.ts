
'use server';
/**
 * @fileOverview A syllabus generation AI flow.
 *
 * - generateSyllabus - A function that handles the syllabus generation process.
 * - GenerateSyllabusInput - The input type for the generateSyllabus function.
 * - GenerateSyllabusOutput - The return type for the generateSyllabus function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateSyllabusInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course.'),
  learningObjectives: z.string().describe('A list of learning objectives, likely separated by newlines.'),
  additionalDetails: z.string().optional().describe('Any other relevant details like textbooks, course duration, or prerequisites.'),
});
export type GenerateSyllabusInput = z.infer<typeof GenerateSyllabusInputSchema>;


export const GenerateSyllabusOutputSchema = z.object({
  syllabusContent: z.string().describe('The full syllabus content in Markdown format.'),
});
export type GenerateSyllabusOutput = z.infer<typeof GenerateSyllabusOutputSchema>;

export async function generateSyllabus(input: GenerateSyllabusInput): Promise<GenerateSyllabusOutput> {
  return generateSyllabusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSyllabusPrompt',
  input: { schema: GenerateSyllabusInputSchema },
  output: { schema: GenerateSyllabusOutputSchema },
  prompt: `You are an expert academic course designer. Your task is to generate a comprehensive and well-structured course syllabus based on the provided information. The output must be in Markdown format.

Course Title: {{{courseTitle}}}

Learning Objectives:
{{{learningObjectives}}}

{{#if additionalDetails}}
Additional Details:
{{{additionalDetails}}}
{{/if}}

Please generate a complete syllabus that includes:
1.  **Course Description:** A brief, engaging summary of the course.
2.  **Learning Objectives:** The list provided.
3.  **Weekly Schedule:** A plausible week-by-week breakdown of topics. If a duration is provided in the additional details, match the schedule to that duration. Otherwise, assume a 12-week semester.
4.  **Assessment Methods:** A breakdown of how students will be graded (e.g., exams, assignments, projects). Use the assessment details if provided, otherwise create a standard assessment scheme.
5.  **Required Textbooks/Materials:** List any materials mentioned in the additional details.

The entire output should be a single Markdown string.
`,
});

const generateSyllabusFlow = ai.defineFlow(
  {
    name: 'generateSyllabusFlow',
    inputSchema: GenerateSyllabusInputSchema,
    outputSchema: GenerateSyllabusOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

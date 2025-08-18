
'use server';
/**
 * @fileOverview A lecture plan generation AI flow.
 *
 * - generateLecturePlan - A function that handles the lecture plan generation process.
 * - GenerateLecturePlanInput - The input type for the generateLecturePlan function.
 * - GenerateLecturePlanOutput - The return type for the generateLecturePlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLecturePlanInputSchema = z.object({
  topic: z.string().describe('The main topic of the lecture.'),
  objectives: z.string().describe('A list of learning objectives for the lecture, likely separated by newlines.'),
  duration: z.number().describe('The total duration of the lecture in minutes.'),
});
export type GenerateLecturePlanInput = z.infer<typeof GenerateLecturePlanInputSchema>;

const LectureSectionSchema = z.object({
    title: z.string().describe("The title of this section of the lecture (e.g., 'Introduction', 'Main Activity')."),
    duration: z.number().describe("The estimated time in minutes for this section."),
    points: z.array(z.string()).describe("A list of key talking points or activities for this section."),
});

const GenerateLecturePlanOutputSchema = z.object({
  sections: z.array(LectureSectionSchema).describe("An array of lecture sections, breaking down the entire lecture."),
});
export type GenerateLecturePlanOutput = z.infer<typeof GenerateLecturePlanOutputSchema>;

export async function generateLecturePlan(input: GenerateLecturePlanInput): Promise<GenerateLecturePlanOutput> {
  return generateLecturePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLecturePlanPrompt',
  input: { schema: GenerateLecturePlanInputSchema },
  output: { schema: GenerateLecturePlanOutputSchema },
  prompt: `You are an expert instructional designer. Your task is to create a detailed and engaging lecture plan based on the provided information. The plan should be structured into logical sections (like Introduction, Main Content, Activity, Conclusion) and the total duration of all sections must equal the specified lecture duration.

Lecture Topic: {{{topic}}}
Lecture Duration: {{{duration}}} minutes

Learning Objectives:
{{{objectives}}}

Please generate a lecture plan with at least 3 distinct sections. For each section, provide:
1.  A clear title.
2.  An estimated duration in minutes.
3.  A list of specific talking points, activities, or teaching strategies.

Ensure the sum of the durations for all sections equals the total lecture duration. The output should be a structured JSON object.
`,
});

const generateLecturePlanFlow = ai.defineFlow(
  {
    name: 'generateLecturePlanFlow',
    inputSchema: GenerateLecturePlanInputSchema,
    outputSchema: GenerateLecturePlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

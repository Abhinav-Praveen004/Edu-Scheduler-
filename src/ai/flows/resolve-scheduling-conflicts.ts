// src/ai/flows/resolve-scheduling-conflicts.ts
'use server';

/**
 * @fileOverview An AI agent for resolving scheduling conflicts in a timetable.
 *
 * - resolveSchedulingConflicts - A function that takes timetable data and conflict descriptions as input,
 *   and returns suggested resolutions to the conflicts.
 * - ResolveSchedulingConflictsInput - The input type for the resolveSchedulingConflicts function.
 * - ResolveSchedulingConflictsOutput - The return type for the resolveSchedulingConflicts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResolveSchedulingConflictsInputSchema = z.object({
  timetableData: z
    .string()
    .describe(
      'JSON string containing the timetable data, including courses, times, locations, lecturers, and student enrollments.'
    ),
  conflictDescription: z
    .string()
    .describe(
      'A detailed description of the scheduling conflicts present in the timetable.'
    ),
});

export type ResolveSchedulingConflictsInput = z.infer<
  typeof ResolveSchedulingConflictsInputSchema
>;

const ResolveSchedulingConflictsOutputSchema = z.object({
  suggestedResolutions: z
    .string()
    .describe(
      'A list of suggested resolutions to the scheduling conflicts, including specific actions to take and their potential impact.'
    ),
  preventativeMeasures: z
    .string()
    .describe(
      'Recommendations for preventative measures to avoid similar conflicts in future timetable generations.'
    ),
});

export type ResolveSchedulingConflictsOutput = z.infer<
  typeof ResolveSchedulingConflictsOutputSchema
>;

export async function resolveSchedulingConflicts(
  input: ResolveSchedulingConflictsInput
): Promise<ResolveSchedulingConflictsOutput> {
  return resolveSchedulingConflictsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resolveSchedulingConflictsPrompt',
  input: {schema: ResolveSchedulingConflictsInputSchema},
  output: {schema: ResolveSchedulingConflictsOutputSchema},
  prompt: `You are an AI assistant designed to help resolve scheduling conflicts in a university timetable.

You will receive timetable data and a description of the conflicts.
Your goal is to provide a list of suggested resolutions and preventative measures.

Timetable Data:
{{timetableData}}

Conflict Description:
{{conflictDescription}}


Suggested Resolutions:
Preventative Measures:

Consider suggesting changes such as:
* Moving courses to different times or locations.
* Adjusting lecturer schedules.
* Splitting large courses into smaller sections.
* Offering alternative courses for students with conflicts.

Focus on solutions that minimize disruption and maximize student satisfaction.


Output the suggested resolutions and preventative measures in a clear and concise manner, suitable for review by a human administrator.`,
  config: {
    model: 'gemini-1.5-flash',
  },
});

const resolveSchedulingConflictsFlow = ai.defineFlow(
  {
    name: 'resolveSchedulingConflictsFlow',
    inputSchema: ResolveSchedulingConflictsInputSchema,
    outputSchema: ResolveSchedulingConflictsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


'use server';

/**
 * @fileOverview Generates an optimal timetable based on course information and student preferences.
 *
 * - generateOptimalTimetable - A function that generates the timetable.
 * - GenerateOptimalTimetableInput - The input type for the generateOptimalTimetable function.
 * - GenerateOptimalTimetableOutput - The return type for the generateOptimalTimetable function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOptimalTimetableInputSchema = z.object({
  courseInformation: z.string().describe('Course details including name, year, branch, and duration.'),
  studentPreferences: z.string().describe('Student preferences including time slot, teaching pace, teaching style, and learning style.'),
  lecturerConstraints: z.string().describe('Any time constraints for lecturers.'),
});
export type GenerateOptimalTimetableInput = z.infer<
  typeof GenerateOptimalTimetableInputSchema
>;

const GenerateOptimalTimetableOutputSchema = z.object({
  timetable: z.string().describe('The generated timetable as a markdown table.'),
});
export type GenerateOptimalTimetableOutput = z.infer<
  typeof GenerateOptimalTimetableOutputSchema
>;

export async function generateOptimalTimetable(
  input: GenerateOptimalTimetableInput
): Promise<GenerateOptimalTimetableOutput> {
  return generateOptimalTimetableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOptimalTimetablePrompt',
  input: {schema: GenerateOptimalTimetableInputSchema},
  output: {schema: GenerateOptimalTimetableOutputSchema},
  prompt: `You are an AI timetable generator. You will receive course information and student preferences. Use this information to generate an optimized timetable that minimizes conflicts and balances workload.

Course Information: {{{courseInformation}}}
Student Preferences: {{{studentPreferences}}}

- If student preference includes 'morning', schedule classes between 9:00 and 12:00.
- If student preference includes 'afternoon', schedule classes between 13:00 and 17:00.

Generate the timetable as a markdown table. The columns must be "Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday".
Each cell for a day should contain the course name, lecturer, and location in the format: "Course Name (Lecturer, Location)".
If a slot is empty, use "-".
Spread the subjects throughout the week to ensure a balanced schedule.
Ensure the output is ONLY the markdown table and nothing else.

Example format for 'morning' preference:
| Time          | Monday                    | Tuesday                  | Wednesday                 | Thursday                  | Friday                    |
|---------------|---------------------------|--------------------------|---------------------------|---------------------------|---------------------------|
| 9:00 - 10:00  | CS101 (Dr. Smith, Hall A) | -                        | MA101 (Prof. Doe, Room 201) | -                         | CS101 (Dr. Smith, Hall A) |
| 10:00 - 11:00 | -                         | PHY101 (Dr. Jones, Lab 3)| MA101 (Prof. Doe, Room 201) | PHY101 (Dr. Jones, Lab 3) | -                         |
| 11:00 - 12:00 | MA101 (Prof. Doe, Room 201)| CS101 (Dr. Smith, Hall A)| -                         | -                         | PHY101 (Dr. Jones, Lab 3)|


Example format for 'afternoon' preference:
| Time          | Monday                    | Tuesday                  | Wednesday                 | Thursday                  | Friday                    |
|---------------|---------------------------|--------------------------|---------------------------|---------------------------|---------------------------|
| 13:00 - 14:00 | CS101 (Dr. Smith, Hall A) | -                        | MA101 (Prof. Doe, Room 201) | -                         | CS101 (Dr. Smith, Hall A) |
| 14:00 - 15:00 | -                         | PHY101 (Dr. Jones, Lab 3)| MA101 (Prof. Doe, Room 201) | PHY101 (Dr. Jones, Lab 3) | -                         |
| 15:00 - 16:00 | MA101 (Prof. Doe, Room 201)| CS101 (Dr. Smith, Hall A)| -                         | -                         | PHY101 (Dr. Jones, Lab 3)|
| 16:00 - 17:00 | PHY101 (Dr. Jones, Lab 3) | -                        | CS101 (Dr. Smith, Hall A) | MA101 (Prof. Doe, Room 201)| -                         |
`,
  config: {
    model: 'gemini-1.5-flash',
  },
});

const generateOptimalTimetableFlow = ai.defineFlow(
  {
    name: 'generateOptimalTimetableFlow',
    inputSchema: GenerateOptimalTimetableInputSchema,
    outputSchema: GenerateOptimalTimetableOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

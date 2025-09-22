'use server';

/**
 * @fileOverview Generates a water quality report based on user input and recommends suitable purifiers.
 *
 * - generateWaterQualityReport - A function that handles the generation of the water quality report.
 * - WaterQualityReportInput - The input type for the generateWaterQualityReport function.
 * - WaterQualityReportOutput - The return type for the generateWaterQualityReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WaterQualityReportInputSchema = z.object({
  location: z.string().describe('The location of the water source.'),
  sourceType: z.string().describe('The type of the water source (e.g., well, river, tap).'),
  contaminants: z
    .string()
    .optional()
    .describe('Known contaminants in the water source, if any.'),
  specificConcerns: z
    .string()
    .optional()
    .describe('Any specific concerns or requirements for water purification.'),
});
export type WaterQualityReportInput = z.infer<typeof WaterQualityReportInputSchema>;

const WaterQualityReportOutputSchema = z.object({
  report: z.string().describe('The generated water quality report.'),
  recommendedPurifiers: z
    .string()
    .describe('Recommendations for suitable water purifiers based on the report.'),
});
export type WaterQualityReportOutput = z.infer<typeof WaterQualityReportOutputSchema>;

export async function generateWaterQualityReport(
  input: WaterQualityReportInput
): Promise<WaterQualityReportOutput> {
  return generateWaterQualityReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'waterQualityReportPrompt',
  input: {schema: WaterQualityReportInputSchema},
  output: {schema: WaterQualityReportOutputSchema},
  prompt: `You are an expert in water purification.

  Based on the following information about the water source, generate a detailed water quality report and recommend suitable water purifiers from our product catalog.

  Location: {{{location}}}
  Source Type: {{{sourceType}}}
  Contaminants (if known): {{{contaminants}}}
  Specific Concerns: {{{specificConcerns}}}

  Report:
  `, // Handlebars
});

const generateWaterQualityReportFlow = ai.defineFlow(
  {
    name: 'generateWaterQualityReportFlow',
    inputSchema: WaterQualityReportInputSchema,
    outputSchema: WaterQualityReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


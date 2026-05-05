'use server';
/**
 * @fileOverview This file implements the Genkit flow for extracting eligibility criteria from a tender document.
 *
 * - tenderCriteriaExtraction - A function that orchestrates the criteria extraction process.
 * - TenderCriteriaExtractionInput - The input type for the tenderCriteriaExtraction function.
 * - TenderCriteriaExtractionOutput - The return type for the tenderCriteriaExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TenderCriteriaExtractionInputSchema = z.object({
  tenderDocumentText: z.string().describe('The unstructured text extracted from the tender document.'),
});
export type TenderCriteriaExtractionInput = z.infer<typeof TenderCriteriaExtractionInputSchema>;

const CriterionSchema = z.object({
  criterion: z.string().describe('The identified eligibility requirement.'),
  type: z.enum(['Technical', 'Financial', 'Compliance']).describe('Classification of the criterion: Technical, Financial, or Compliance.'),
  mandatory: z.boolean().describe('True if the criterion is mandatory, false if optional.'),
  required_value: z.string().describe('The exact value or specific requirement for the criterion (e.g., "₹5 crore", "3 projects", "ISO 9001").'),
  notes: z.string().describe('Any additional notes, such as required documents or time constraints relevant to this criterion.'),
});

const TenderCriteriaExtractionOutputSchema = z.object({
  criteria: z.array(CriterionSchema).describe('A list of all extracted eligibility criteria.'),
});
export type TenderCriteriaExtractionOutput = z.infer<typeof TenderCriteriaExtractionOutputSchema>;

export async function tenderCriteriaExtraction(input: TenderCriteriaExtractionInput): Promise<TenderCriteriaExtractionOutput> {
  return tenderCriteriaExtractionFlow(input);
}

const tenderCriteriaExtractionPrompt = ai.definePrompt({
  name: 'tenderCriteriaExtractionPrompt',
  input: {schema: TenderCriteriaExtractionInputSchema},
  output: {schema: TenderCriteriaExtractionOutputSchema},
  prompt: `You are an expert AI system designed for government-grade tender evaluation and audit.
Your goal is to perform a COMPLETE, ACCURATE, and EXPLAINABLE extraction of eligibility criteria.

--------------------------------------------------
STEP 1: CRITERIA EXTRACTION (TENDER UNDERSTANDING)
--------------------------------------------------
Extract ALL eligibility criteria from the provided tender document.
For each criterion, identify the requirement clearly, extract exact values, classify its type (Technical, Financial, Compliance), and determine if it's Mandatory or Optional. Mandatory should be true by default unless explicitly stated as optional.
Also, capture any required documents, certifications, or time constraints related to each criterion in the 'notes' field.

Tender Document:
{{{tenderDocumentText}}}

Output MUST be STRICT JSON only, matching the provided schema, which expects an object with a 'criteria' key containing an array of eligibility criteria.`,
});

const tenderCriteriaExtractionFlow = ai.defineFlow(
  {
    name: 'tenderCriteriaExtractionFlow',
    inputSchema: TenderCriteriaExtractionInputSchema,
    outputSchema: TenderCriteriaExtractionOutputSchema,
  },
  async (input) => {
    const {output} = await tenderCriteriaExtractionPrompt(input);
    return output!;
  }
);

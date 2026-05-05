'use server';
/**
 * @fileOverview A Genkit flow for extracting structured data from a bidder's submission document.
 *
 * - extractBidderData - A function that handles the extraction of bidder data.
 * - BidderDataExtractionInput - The input type for the extractBidderData function.
 * - BidderDataExtractionOutput - The return type for the extractBidderData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BidderDataExtractionInputSchema = z.object({
  bidderDocumentText: z
    .string()
    .describe('The unstructured text extracted from the bidder\'s submission document.'),
});
export type BidderDataExtractionInput = z.infer<typeof BidderDataExtractionInputSchema>;

const BidderDataExtractionOutputSchema = z.object({
  bidder_data: z.object({
    annual_turnover: z
      .array(
        z.object({
          amount: z.string().describe('The annual turnover amount.'),
          year: z.string().nullable().describe('The year for which the turnover is reported, if available.'),
          evidence_snippet: z.string().describe('The exact text snippet from the document that supports this value.'),
        })
      )
      .describe('List of annual turnover entries with amounts, years, and supporting evidence.'),
    certifications: z
      .array(
        z.object({
          name: z.string().describe('The name of the certification (e.g., ISO 9001).'),
          evidence_snippet: z.string().describe('The exact text snippet from the document that supports this certification.'),
        })
      )
      .describe('List of certifications with their names and supporting evidence.'),
    number_of_similar_projects: z
      .array(
        z.object({
          count: z.string().describe('The number of similar projects.'),
          evidence_snippet: z.string().describe('The exact text snippet from the document that supports this number.'),
        })
      )
      .describe('List of entries detailing the number of similar projects and supporting evidence.'),
    company_registrations: z
      .array(
        z.object({
          type: z
            .string()
            .describe('The type of registration (e.g., GST, PAN, CIN, Company Registration Number).'),
          value: z.string().describe('The registration identifier.'),
          evidence_snippet: z.string().describe('The exact text snippet from the document that supports this registration.'),
        })
      )
      .describe('List of company registrations with their types, values, and supporting evidence.'),
    other_evidence: z
      .array(
        z.object({
          description: z
            .string()
            .describe('A brief description of the supporting evidence.'),
          evidence_snippet: z
            .string()
            .describe('The exact text snippet from the document for this supporting evidence.'),
        })
      )
      .describe('List of other relevant supporting evidence texts with descriptions and snippets.'),
  }).describe('Structured data extracted from the bidder\'s document.'),
});
export type BidderDataExtractionOutput = z.infer<typeof BidderDataExtractionOutputSchema>;

export async function extractBidderData(
  input: BidderDataExtractionInput
): Promise<BidderDataExtractionOutput> {
  return bidderDataExtractionFlow(input);
}

const bidderDataExtractionPrompt = ai.definePrompt({
  name: 'bidderDataExtractionPrompt',
  input: { schema: BidderDataExtractionInputSchema },
  output: { schema: BidderDataExtractionOutputSchema },
  system: `You are an expert AI system designed for government-grade tender evaluation and audit.
Your task is to extract structured data from a bidder document.

From the provided bidder document text, extract the following structured data:
- Annual turnover (with amount and year if available)
- Certifications (e.g., ISO, specific industry certifications)
- Number of similar projects
- Company registrations (e.g., GST, PAN, CIN, Company Registration Number)
- Any other general supporting evidence text that might be relevant for tender evaluation.

For EACH extracted value, you MUST also include the EXACT text snippet from the document as evidence.
Do not hallucinate or summarize. Provide the precise text segment that directly supports the extracted data.

Return the output in the specified JSON format only.
`,
  prompt: `Bidder Document Text:

{{bidderDocumentText}}
`,
});

const bidderDataExtractionFlow = ai.defineFlow(
  {
    name: 'bidderDataExtractionFlow',
    inputSchema: BidderDataExtractionInputSchema,
    outputSchema: BidderDataExtractionOutputSchema,
  },
  async (input) => {
    const { output } = await bidderDataExtractionPrompt(input);
    if (!output) {
      throw new Error('Bidder data extraction failed: No output generated.');
    }
    return output;
  }
);


'use server';
/**
 * @fileOverview This file implements a Genkit flow for Explainable Decision Reporting in TenderSense AI.
 * It extracts eligibility criteria from a tender document (PDF, Text, or URL), extracts bidder data,
 * evaluates the bidder against the tender criteria, and generates a detailed, auditable report.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Tool to simulate fetching content from a URL.
 */
const fetchUrlContent = ai.defineTool(
  {
    name: 'fetchUrlContent',
    description: 'Retrieves the text content from a given URL for analysis.',
    inputSchema: z.object({
      url: z.string().describe('The URL to fetch content from.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // In a production environment, this would use a library like 'axios' and 'cheerio' 
    // or a dedicated scraping service to extract text from the webpage.
    // For this prototype, we return a simulated response if it's a URL.
    return `Simulated content fetched from ${input.url}. This document contains standard eligibility requirements including an annual turnover of at least ₹5 crore and ISO 9001 certification.`;
  }
);

/**
 * Schema for a document input, which can be a PDF URI, raw text, or a URL.
 */
const DocumentInputSchema = z.object({
  type: z.enum(['pdf', 'text', 'url']),
  value: z.string().describe("The content (text, URL) or a data URI for PDF."),
});

const ExplainableDecisionReportingInputSchema = z.object({
  tenderDoc: DocumentInputSchema,
  bidderDoc: DocumentInputSchema,
});
export type ExplainableDecisionReportingInput = z.infer<typeof ExplainableDecisionReportingInputSchema>;

const CriterionSchema = z.object({
  criterion: z.string().describe('The identified requirement clearly stated in the tender document.'),
  type: z.enum(['Technical', 'Financial', 'Compliance']).describe('Classification of the criterion.'),
  mandatory: z.boolean().describe('True if the criterion is mandatory.'),
  required_value: z.string().describe('The exact value or condition required.'),
  notes: z.string().describe('Additional details about the criterion.'),
});

const EvidenceSchema = z.object({
  bidder_text: z.string().describe('Exact text snippet from the bidder document.'),
  tender_text: z.string().optional().describe('Relevant text snippet from the tender document.'),
});

const EvaluationSchema = z.object({
  criterion: z.string().describe('The name of the criterion being evaluated.'),
  required_value: z.string().describe('The value required by the tender.'),
  bidder_value: z.string().describe('The value extracted from the bidder document.'),
  status: z.enum(['Eligible', 'Not Eligible', 'Needs Review']).describe('The evaluation status.'),
  confidence: z.number().min(0).max(100).describe('Confidence score for the evaluation.'),
  explanation: z.string().describe('Human-readable explanation of why this decision was made.'),
  evidence: EvidenceSchema.describe('Evidence supporting the evaluation decision.'),
});

const SummarySchema = z.object({
  final_decision: z.enum(['Eligible', 'Not Eligible', 'Needs Review']).describe('The overall final decision.'),
  reason: z.string().describe('Summary reasoning for the final decision.'),
  risk_flags: z.array(z.string()).describe('List of detected risk flags.'),
});

const ExplainableDecisionReportingOutputSchema = z.object({
  criteria: z.array(CriterionSchema).describe('Extracted eligibility criteria.'),
  evaluation: z.array(EvaluationSchema).describe('Detailed evaluations for each criterion.'),
  summary: SummarySchema.describe('Overall evaluation summary.'),
});
export type ExplainableDecisionReportingOutput = z.infer<typeof ExplainableDecisionReportingOutputSchema>;

const PromptInputSchema = ExplainableDecisionReportingInputSchema.extend({
  isTenderPdf: z.boolean(),
  isBidderPdf: z.boolean(),
  isTenderUrl: z.boolean(),
  isBidderUrl: z.boolean(),
});

const explainableDecisionReportingPrompt = ai.definePrompt({
  name: 'explainableDecisionReportingPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: ExplainableDecisionReportingOutputSchema},
  tools: [fetchUrlContent],
  prompt: `You are an expert AI system designed for government-grade tender evaluation and audit. 

Follow these steps strictly:

--------------------------------------------------
STEP 1: SOURCE ACQUISITION
--------------------------------------------------
If any document is provided as a URL, use the 'fetchUrlContent' tool to retrieve its content before proceeding.

Tender Document:
{{#if isTenderPdf}}
{{media url=tenderDoc.value}}
{{else}}
{{#if isTenderUrl}}
URL: {{{tenderDoc.value}}} (Use fetchUrlContent)
{{else}}
{{{tenderDoc.value}}}
{{/if}}
{{/if}}

Bidder Document:
{{#if isBidderPdf}}
{{media url=bidderDoc.value}}
{{else}}
{{#if isBidderUrl}}
URL: {{{bidderDoc.value}}} (Use fetchUrlContent)
{{else}}
{{{bidderDoc.value}}}
{{/if}}
{{/if}}

--------------------------------------------------
STEP 2: CRITERIA EXTRACTION
--------------------------------------------------
From the Tender Document, extract ALL eligibility criteria.

--------------------------------------------------
STEP 3: MATCHING & EVALUATION
--------------------------------------------------
Compare requirements with bidder data. Assign status: Eligible, Not Eligible, or Needs Review.

--------------------------------------------------
STEP 4: EXPLAINABILITY
--------------------------------------------------
Provide Criterion, Required Value, Bidder Value, Status, Confidence, Explanation, and Evidence.

--------------------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
--------------------------------------------------
{{jsonSchema ExplainableDecisionReportingOutputSchema}}`,
});

const explainableDecisionReportingFlow = ai.defineFlow(
  {
    name: 'explainableDecisionReportingFlow',
    inputSchema: ExplainableDecisionReportingInputSchema,
    outputSchema: ExplainableDecisionReportingOutputSchema,
  },
  async (input) => {
    const promptInput = {
      ...input,
      isTenderPdf: input.tenderDoc.type === 'pdf',
      isBidderPdf: input.bidderDoc.type === 'pdf',
      isTenderUrl: input.tenderDoc.type === 'url',
      isBidderUrl: input.bidderDoc.type === 'url',
    };
    
    const {output} = await explainableDecisionReportingPrompt(promptInput);
    return output!;
  }
);

export async function explainableDecisionReporting(
  input: ExplainableDecisionReportingInput
): Promise<ExplainableDecisionReportingOutput> {
  return explainableDecisionReportingFlow(input);
}

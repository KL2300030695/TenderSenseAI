'use server';
/**
 * @fileOverview This file implements a Genkit flow for Explainable Decision Reporting in TenderSense AI.
 * It extracts eligibility criteria from a tender document (PDF or Text), extracts bidder data,
 * evaluates the bidder against the tender criteria, and generates a detailed, auditable report.
 *
 * - explainableDecisionReporting - The main function to trigger the tender evaluation process.
 * - ExplainableDecisionReportingInput - The input type for the explainableDecisionReporting function.
 * - ExplainableDecisionReportingOutput - The return type for the explainableDecisionReporting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Schema for a document input, which can be a PDF URI or raw text.
 */
const DocumentInputSchema = z.object({
  type: z.enum(['pdf', 'text', 'url']),
  value: z.string().describe("The content (text, URL) or a data URI for PDF."),
});

/**
 * Schema for the input of the explainableDecisionReporting flow.
 */
const ExplainableDecisionReportingInputSchema = z.object({
  tenderDoc: DocumentInputSchema,
  bidderDoc: DocumentInputSchema,
});
export type ExplainableDecisionReportingInput = z.infer<typeof ExplainableDecisionReportingInputSchema>;

/**
 * Schema for a single criterion extracted from the tender document.
 */
const CriterionSchema = z.object({
  criterion: z.string().describe('The identified requirement clearly stated in the tender document.'),
  type: z.enum(['Technical', 'Financial', 'Compliance']).describe('Classification of the criterion (e.g., Technical, Financial, Compliance).'),
  mandatory: z.boolean().describe('True if the criterion is mandatory, false if optional. Default to TRUE unless explicitly optional.'),
  required_value: z.string().describe('The exact value or condition required by the tender (e.g., "₹5 crore", "ISO 9001", "last 5 years").'),
  notes: z.string().describe('Any additional notes or details about the criterion, including required documents or time constraints.'),
});

/**
 * Schema for evidence snippets from documents.
 */
const EvidenceSchema = z.object({
  bidder_text: z.string().describe('The exact text snippet from the bidder document providing evidence for the evaluation.'),
  tender_text: z.string().optional().describe('An optional relevant text snippet from the tender document providing context for the criterion.'),
});

/**
 * Schema for the evaluation of a single criterion.
 */
const EvaluationSchema = z.object({
  criterion: z.string().describe('The name of the criterion being evaluated.'),
  required_value: z.string().describe('The value or condition required by the tender for this criterion.'),
  bidder_value: z.string().describe('The value extracted from the bidder document relevant to this criterion.'),
  status: z.enum(['Eligible', 'Not Eligible', 'Needs Review']).describe('The evaluation status for this criterion.'),
  confidence: z.number().min(0).max(100).describe('A confidence score (0-100) for the evaluation of this criterion, representing the certainty of the decision.'),
  explanation: z.string().describe('A clear, human-readable explanation of why this decision was made, answering "WHY did this decision happen?".'),
  evidence: EvidenceSchema.describe('Text snippets from documents supporting the evaluation decision.'),
});

/**
 * Schema for the overall summary of the evaluation.
 */
const SummarySchema = z.object({
  final_decision: z.enum(['Eligible', 'Not Eligible', 'Needs Review']).describe('The overall final decision for the bidder.'),
  reason: z.string().describe('A 2-3 line summary reasoning for the final decision.'),
  risk_flags: z.array(z.string()).describe('A list of detected risk flags (e.g., "Missing documents", "Incomplete information", "Suspicious inconsistencies", "OCR/low-confidence extraction issues").'),
});

/**
 * Schema for the output of the explainable decision reporting flow.
 */
const ExplainableDecisionReportingOutputSchema = z.object({
  criteria: z.array(CriterionSchema).describe('A list of all extracted eligibility criteria from the tender document.'),
  evaluation: z.array(EvaluationSchema).describe('A list of detailed evaluations for each criterion against the bidder document.'),
  summary: SummarySchema.describe('A summary of the overall evaluation, including final decision, reason, and risk flags.'),
});
export type ExplainableDecisionReportingOutput = z.infer<typeof ExplainableDecisionReportingOutputSchema>;

/**
 * Schema for internal prompt input, including logic flags to avoid Handlebars complexity.
 */
const PromptInputSchema = ExplainableDecisionReportingInputSchema.extend({
  isTenderPdf: z.boolean(),
  isBidderPdf: z.boolean(),
});

/**
 * Defines the prompt for the explainable decision reporting AI.
 */
const explainableDecisionReportingPrompt = ai.definePrompt({
  name: 'explainableDecisionReportingPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: ExplainableDecisionReportingOutputSchema},
  prompt: `You are an expert AI system designed for government-grade tender evaluation and audit. Your goal is to perform a COMPLETE, ACCURATE, and EXPLAINABLE evaluation of a bidder's submission against a tender document.

Follow these steps strictly to produce your evaluation:

--------------------------------------------------
STEP 1: CRITERIA EXTRACTION (TENDER UNDERSTANDING)
--------------------------------------------------
From the Tender Document provided, extract ALL eligibility criteria.
- Identify the requirement clearly.
- Extract exact values (e.g., ₹5 crore, 3 projects, ISO 9001).
- Classify: Technical, Financial, Compliance.
- Determine if it's Mandatory (default TRUE) or Optional.

Tender Document:
{{#if isTenderPdf}}
{{media url=tenderDoc.value}}
{{else}}
{{{tenderDoc.value}}}
{{/if}}

--------------------------------------------------
STEP 2: BIDDER DATA EXTRACTION
--------------------------------------------------
From the Bidder Document provided, extract structured data relevant to the criteria identified in Step 1.

Bidder Document:
{{#if isBidderPdf}}
{{media url=bidderDoc.value}}
{{else}}
{{{bidderDoc.value}}}
{{/if}}

--------------------------------------------------
STEP 3: MATCHING & EVALUATION
--------------------------------------------------
Compare requirements with bidder data.
- "Eligible" if satisfied.
- "Not Eligible" if failed.
- "Needs Review" if ambiguous.

--------------------------------------------------
STEP 4: EXPLAINABILITY (CRITICAL)
--------------------------------------------------
For EVERY evaluation, provide:
- Criterion, Required Value, Bidder Value, Status, Confidence.
- Explanation: "WHY did this decision happen?".
- Evidence: Exact snippets from both documents.

--------------------------------------------------
STEP 5: RISK & FINAL SUMMARY
--------------------------------------------------
Flag missing documents or inconsistencies. Provide an overall final decision.

--------------------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
--------------------------------------------------
Your response MUST be a single JSON object.

{{jsonSchema ExplainableDecisionReportingOutputSchema}}`,
});

/**
 * Defines the Genkit flow for explainable decision reporting.
 */
const explainableDecisionReportingFlow = ai.defineFlow(
  {
    name: 'explainableDecisionReportingFlow',
    inputSchema: ExplainableDecisionReportingInputSchema,
    outputSchema: ExplainableDecisionReportingOutputSchema,
  },
  async (input) => {
    // Pre-calculate logic flags to keep the Handlebars template logic-less
    const promptInput = {
      ...input,
      isTenderPdf: input.tenderDoc.type === 'pdf',
      isBidderPdf: input.bidderDoc.type === 'pdf',
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
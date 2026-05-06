'use server';
/**
 * @fileOverview This file implements a Genkit flow for Explainable Decision Reporting in TenderSense AI.
 * It extracts eligibility criteria from a tender document, extracts bidder data from a bidder document,
 * evaluates the bidder against the tender criteria, and generates a detailed, auditable report
 * with explanations, confidence scores, and source document references.
 *
 * - explainableDecisionReporting - The main function to trigger the tender evaluation process.
 * - ExplainableDecisionReportingInput - The input type for the explainableDecisionReporting function.
 * - ExplainableDecisionReportingOutput - The return type for the explainableDecisionReporting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Schema for the input of the explainableDecisionReporting flow.
 * It includes the unstructured text content of the tender and bidder documents.
 */
const ExplainableDecisionReportingInputSchema = z.object({
  tenderDocumentText:
    z.string().describe('The unstructured text content extracted from the tender document.'),
  bidderDocumentText:
    z.string().describe('The unstructured text content extracted from the bidder submission document.'),
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
 * This structure provides a complete, accurate, and explainable tender evaluation.
 */
const ExplainableDecisionReportingOutputSchema = z.object({
  criteria: z.array(CriterionSchema).describe('A list of all extracted eligibility criteria from the tender document.'),
  evaluation: z.array(EvaluationSchema).describe('A list of detailed evaluations for each criterion against the bidder document.'),
  summary: SummarySchema.describe('A summary of the overall evaluation, including final decision, reason, and risk flags.'),
});
export type ExplainableDecisionReportingOutput = z.infer<typeof ExplainableDecisionReportingOutputSchema>;

/**
 * Defines the prompt for the explainable decision reporting AI.
 * This prompt guides the LLM through a multi-step process to perform a comprehensive tender evaluation.
 */
const explainableDecisionReportingPrompt = ai.definePrompt({
  name: 'explainableDecisionReportingPrompt',
  input: {schema: ExplainableDecisionReportingInputSchema},
  output: {schema: ExplainableDecisionReportingOutputSchema},
  prompt: `You are an expert AI system designed for government-grade tender evaluation and audit. Your goal is to perform a COMPLETE, ACCURATE, and EXPLAINABLE evaluation of a bidder's submission against a tender document.

You will receive the unstructured text content of both a tender document and a bidder document.

Follow these steps strictly to produce your evaluation:

--------------------------------------------------
STEP 1: CRITERIA EXTRACTION (TENDER UNDERSTANDING)
--------------------------------------------------
From the Tender Document provided below, extract ALL eligibility criteria.

For each criterion:
- Identify the requirement clearly.
- Extract exact values (e.g., ₹5 crore, 3 projects, ISO 9001).
- Classify into one of these types: Technical, Financial, Compliance.
- Determine if it's Mandatory (default TRUE unless clearly optional) or Optional (only if explicitly mentioned as optional).
- Also extract: Required documents (certificates, registrations) and Time constraints (e.g., last 5 years). Include these in the 'notes' field.

Tender Document:
{{{tenderDocumentText}}}

--------------------------------------------------
STEP 2: BIDDER DATA EXTRACTION
--------------------------------------------------
From the Bidder Document provided below, extract structured data relevant to the criteria identified in Step 1.

Extract:
- Annual turnover (with amount and year if available)
- Certifications (ISO, etc.)
- Number of similar projects
- Company registrations (GST, PAN, etc.)
- Any supporting evidence text for each criterion.

For each extracted value:
- Include the EXACT text snippet from the document as evidence in the 'bidder_text' field within the 'evidence' object. If a page reference is available in the original document, include that context; otherwise, include the most relevant sentence.

Bidder Document:
{{{bidderDocumentText}}}

--------------------------------------------------
STEP 3: MATCHING & EVALUATION
--------------------------------------------------
For EACH criterion extracted in Step 1, compare the 'required_value' (from tender) with the corresponding 'bidder_value' (extracted from bidder document in Step 2).

Assign status for each criterion:
- "Eligible" → if the bidder fully satisfies the requirement.
- "Not Eligible" → if the bidder clearly fails the requirement.
- "Needs Review" → if data is missing, unclear, or ambiguous.

STRICT RULES for evaluation:
- NEVER assume missing data.
- NEVER guess values.
- If evidence is weak or insufficient → mark "Needs Review".

--------------------------------------------------
STEP 4: EXPLAINABILITY (CRITICAL)
--------------------------------------------------
For EVERY evaluation, provide:
- Criterion name
- Required value
- Bidder value
- Status
- Confidence score (0–100) reflecting your certainty of the evaluation.
- Explanation: A clear, human-readable explanation answering "WHY did this decision happen?".
- Evidence:
  • Exact sentence or snippet from bidder document ('bidder_text').
  • (Optional) relevant sentence or snippet from tender document ('tender_text') for context.

--------------------------------------------------
STEP 5: RISK & FLAGS
--------------------------------------------------
Detect and flag:
- Missing documents
- Incomplete information
- Suspicious inconsistencies
- OCR/low-confidence extraction issues
List these as strings in the 'risk_flags' array within the summary.

--------------------------------------------------
STEP 6: FINAL SUMMARY
--------------------------------------------------
Provide:
- Overall decision: "Eligible", "Not Eligible", or "Needs Review".
- Summary reasoning: 2–3 lines explaining the overall decision.
- Risk flags: Any identified risks from Step 5.

--------------------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
--------------------------------------------------
Your entire response MUST be a single JSON object conforming exactly to this schema. DO NOT include any additional text or formatting outside of the JSON object.

\`\`\`json
{{jsonSchema ExplainableDecisionReportingOutputSchema}}
\`\`\`

--------------------------------------------------
IMPORTANT CONSTRAINTS
--------------------------------------------------
- DO NOT hallucinate missing values.
- DO NOT skip any criterion.
- ALWAYS include explanation and evidence for each evaluation.
- BE STRICT and AUDIT-READY.
- If unsure about any aspect, especially due to lack of clear evidence, mark "Needs Review".`,
});

/**
 * Defines the Genkit flow for explainable decision reporting.
 * This flow uses the defined prompt to process tender and bidder documents
 * and generate a structured evaluation report.
 */
const explainableDecisionReportingFlow = ai.defineFlow(
  {
    name: 'explainableDecisionReportingFlow',
    inputSchema: ExplainableDecisionReportingInputSchema,
    outputSchema: ExplainableDecisionReportingOutputSchema,
  },
  async (input) => {
    // Call the prompt with the input documents to get the structured evaluation output.
    const {output} = await explainableDecisionReportingPrompt(input);
    // The prompt is designed to return the exact output schema, so we can directly return it.
    return output!;
  }
);

/**
 * Wrapper function to trigger the explainable decision reporting flow.
 * @param input The tender and bidder document texts.
 * @returns A promise that resolves to the structured evaluation report.
 */
export async function explainableDecisionReporting(
  input: ExplainableDecisionReportingInput
): Promise<ExplainableDecisionReportingOutput> {
  return explainableDecisionReportingFlow(input);
}

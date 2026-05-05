'use server';
/**
 * @fileOverview This file implements the automated tender evaluation flow for TenderSense AI.
 * It compares extracted bidder data against tender criteria to provide an initial assessment.
 *
 * - automatedTenderEvaluation - A function that handles the automated tender evaluation process.
 * - AutomatedTenderEvaluationInput - The input type for the automatedTenderEvaluation function.
 * - AutomatedTenderEvaluationOutput - The return type for the automatedTenderEvaluation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schemas
const TenderCriterionSchema = z.object({
  criterion: z.string().describe("The clear requirement identified from the tender."),
  type: z.enum(['Technical', 'Financial', 'Compliance']).describe("Classification of the criterion."),
  mandatory: z.boolean().describe("Whether the criterion is mandatory (true) or optional (false)."),
  required_value: z.string().optional().describe("Exact values required (e.g., ₹5 crore, ISO 9001)."),
  notes: z.string().optional().describe("Any additional notes or constraints for the criterion."),
});

const BidderExtractedDataItemSchema = z.object({
  key: z.string().describe("Identifier for the extracted data point (e.g., 'Annual turnover 2023', 'ISO 9001 Certification')."),
  value: z.string().describe("The extracted value from the bidder document (e.g., '₹10 crore', 'Certified')."),
  evidence_text: z.string().describe("The exact text snippet from the bidder document supporting the extracted value."),
  page_reference: z.string().optional().describe("Optional page reference from the bidder document where the evidence was found."),
});

const AutomatedTenderEvaluationInputSchema = z.object({
  tenderCriteria: z.array(TenderCriterionSchema).describe("A list of eligibility criteria extracted from the tender document."),
  bidderExtractedData: z.array(BidderExtractedDataItemSchema).describe("A list of structured data points extracted from the bidder's submission."),
});
export type AutomatedTenderEvaluationInput = z.infer<typeof AutomatedTenderEvaluationInputSchema>;

// Output Schemas
const EvaluationStatusSchema = z.enum(['Eligible', 'Not Eligible', 'Needs Review']);

const EvaluationEvidenceSchema = z.object({
  bidder_text: z.string().describe("Exact sentence or snippet from the bidder document that served as evidence."),
  tender_text: z.string().optional().describe("Optional sentence or snippet from the tender document defining the criterion."),
});

const EvaluationResultSchema = z.object({
  criterion: z.string().describe("The name of the criterion being evaluated."),
  required_value: z.string().optional().describe("The value required by the tender for this criterion."),
  bidder_value: z.string().optional().describe("The value provided by the bidder for this criterion."),
  status: EvaluationStatusSchema.describe("The evaluation status for this criterion."),
  confidence: z.number().min(0).max(100).describe("Confidence score (0-100) for the evaluation decision."),
  explanation: z.string().describe("A clear, human-readable explanation for the evaluation decision."),
  evidence: EvaluationEvidenceSchema.describe("Evidence supporting the evaluation decision."),
});

const RiskFlagSchema = z.string().describe("Description of a detected risk or flag (e.g., 'Missing document', 'Incomplete information').");

const SummarySchema = z.object({
  final_decision: EvaluationStatusSchema.describe("Overall decision for the bidder (Eligible, Not Eligible, Needs Review)."),
  reason: z.string().describe("Brief reasoning (2-3 lines) for the overall decision."),
  risk_flags: z.array(RiskFlagSchema).optional().describe("List of detected risk flags."),
});

const AutomatedTenderEvaluationOutputSchema = z.object({
  criteria: z.array(TenderCriterionSchema).describe("A list of eligibility criteria from the tender document, used for evaluation."),
  evaluation: z.array(EvaluationResultSchema).describe("Detailed evaluation for each tender criterion."),
  summary: SummarySchema.describe("Overall summary and decision for the bidder."),
});
export type AutomatedTenderEvaluationOutput = z.infer<typeof AutomatedTenderEvaluationOutputSchema>;

export async function automatedTenderEvaluation(input: AutomatedTenderEvaluationInput): Promise<AutomatedTenderEvaluationOutput> {
  return automatedTenderEvaluationFlow(input);
}

const automatedTenderEvaluationPrompt = ai.definePrompt({
  name: 'automatedTenderEvaluationPrompt',
  input: {schema: AutomatedTenderEvaluationInputSchema},
  output: {schema: AutomatedTenderEvaluationOutputSchema},
  prompt: `You are an expert AI system designed for government-grade tender evaluation and audit. Your goal is to perform a COMPLETE, ACCURATE, and EXPLAINABLE evaluation of a bidder against tender criteria.\n\nHere are the tender criteria the bidder must meet:\n{{#each tenderCriteria}}\n- Criterion: {{{criterion}}}\n  Type: {{{type}}}\n  Mandatory: {{{mandatory}}}\n  Required Value: {{{required_value}}}\n  Notes: {{{notes}}}\n{{/each}}\n\nHere is the extracted data from the bidder's document:\n{{#each bidderExtractedData}}\n- Key: {{{key}}}\n  Value: {{{value}}}\n  Evidence: {{{evidence_text}}}\n  Page: {{{page_reference}}}\n{{/each}}\n\n--------------------------------------------------\nSTEP 1: MATCHING & EVALUATION\n--------------------------------------------------\nFor EACH criterion listed under 'tenderCriteria', you must:\n1.  Identify the specific requirement from the tender criterion.\n2.  Search through the 'bidderExtractedData' to find relevant information that addresses this tender criterion.\n3.  Compare the "Required value" (from tender criteria) with the "Value" (from bidder data) for each relevant data point.\n4.  Assign a 'status' for this criterion based on the comparison:\n    - "Eligible" → if the bidder fully and clearly satisfies the requirement.\n    - "Not Eligible" → if the bidder clearly fails the requirement or provides insufficient evidence for a mandatory criterion.\n    - "Needs Review" → if the relevant bidder data is missing, unclear, ambiguous, or if the evidence is weak/conflicting.\n5.  STRICT RULES for status assignment:\n    - NEVER assume missing data. If a mandatory criterion has no clear corresponding bidder data or evidence, it defaults to "Needs Review" or "Not Eligible" if clearly failed.\n    - NEVER guess values. If a value is not explicitly present or derivable from bidder data, mark "Needs Review".\n    - If evidence is weak, ambiguous, or refers to a different context → mark "Needs Review".\n\n--------------------------------------------------\nSTEP 2: EXPLAINABILITY (CRITICAL)\n--------------------------------------------------\nFor EVERY evaluation of a criterion, you MUST provide:\n- 'criterion': The exact name of the criterion being evaluated.\n- 'required_value': The value or condition required by the tender.\n- 'bidder_value': The value or information provided by the bidder that you used for comparison. If no direct value, provide a summary of the relevant bidder data or state 'N/A' if missing.\n- 'status': The determined status ("Eligible", "Not Eligible", "Needs Review").\n- 'confidence': A numerical confidence score (0-100) for your evaluation decision. Lower confidence for 'Needs Review' cases.\n- 'explanation': A clear, concise, and human-readable explanation for your evaluation decision. This explanation must directly answer: "WHY did this decision happen?".\n- 'evidence': An object containing:\n  - 'bidder_text': The exact sentence or snippet from the bidder document's 'evidence_text' that served as primary evidence for 'bidder_value'.\n  - 'tender_text': (Optional) A direct quote from the 'notes' or 'criterion' of the tender that specifically defines this requirement, if applicable and helpful for context.\n\n--------------------------------------------------\nSTEP 3: RISK & FLAGS\n--------------------------------------------------\nBased on the overall evaluation and any inconsistencies or missing data:\nDetect and flag:\n- "Missing document": If a specific required document (implied by a criterion) is clearly absent in the bidder data.\n- "Incomplete information": If a criterion is partially addressed but lacks critical details.\n- "Suspicious inconsistencies": If bidder data contradicts itself or contradicts common knowledge.\n- "OCR/low-confidence extraction issues": If the format or clarity of bidder evidence suggests potential errors in prior data extraction.\n\n--------------------------------------------------\nSTEP 4: FINAL SUMMARY\n--------------------------------------------------\nProvide:\n- 'final_decision': Overall decision for the bidder based on all evaluations. If any mandatory criterion is "Not Eligible", the final decision is "Not Eligible". If any mandatory criterion or the overall assessment is "Needs Review" and no "Not Eligible" is present, the final decision is "Needs Review". Otherwise, "Eligible".\n- 'reason': A brief, 2-3 line summary reasoning for the overall decision.\n- 'risk_flags': A list of any detected risk flags from STEP 3.\n\n--------------------------------------------------\nIMPORTANT CONSTRAINTS\n--------------------------------------------------\n- DO NOT hallucinate missing values or information.\n- DO NOT skip evaluation for any criterion present in 'tenderCriteria'.\n- ALWAYS include a comprehensive 'explanation' and 'evidence' for each individual evaluation result.\n- Your response must be STRICT, AUDIT-READY, and directly follow the specified JSON output format.\n- If you are genuinely unsure about a specific comparison or if data is ambiguous, set the status to "Needs Review" and explain why.\n\n--------------------------------------------------\nOUTPUT FORMAT (STRICT JSON ONLY)\n--------------------------------------------------\n{{jsonSchema AutomatedTenderEvaluationOutputSchema}}\n`,
});

const automatedTenderEvaluationFlow = ai.defineFlow(
  {
    name: 'automatedTenderEvaluationFlow',
    inputSchema: AutomatedTenderEvaluationInputSchema,
    outputSchema: AutomatedTenderEvaluationOutputSchema,
  },
  async (input) => {
    const {output} = await automatedTenderEvaluationPrompt(input);
    // The prompt is instructed to echo the input criteria in the output, so we can directly return the output.
    return output!;
  }
);
import { config } from 'dotenv';
config();

import '@/ai/flows/bidder-data-extraction-flow.ts';
import '@/ai/flows/tender-criteria-extraction.ts';
import '@/ai/flows/explainable-decision-reporting.ts';
import '@/ai/flows/automated-tender-evaluation-flow.ts';
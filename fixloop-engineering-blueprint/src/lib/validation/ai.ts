import { z } from "zod";

export const AiFindingSuggestionSchema = z.object({
  statement: z.string().min(1).max(500),
  kind: z.enum(["FACT_CANDIDATE", "HYPOTHESIS"]),
  sourceEvidenceIds: z.array(z.string().max(100)).max(10),
  confidenceBand: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const AiPossibleCauseSchema = z.object({
  statement: z.string().min(1).max(500),
  testToRun: z.string().min(1).max(500),
  sourceEvidenceIds: z.array(z.string().max(100)).max(10),
});

export const AiSuggestionOutputSchema = z.object({
  schemaVersion: z.literal("1.0"),
  titleSuggestion: z.string().max(120).nullable(),
  categorySuggestion: z
    .enum([
      "DIMENSIONAL",
      "SURFACE",
      "MATERIAL",
      "ASSEMBLY",
      "PROCESS",
      "DOCUMENTATION",
      "SAFETY",
      "OTHER",
    ])
    .nullable(),
  summary: z.string().max(1200),
  findings: z.array(AiFindingSuggestionSchema).max(12),
  possibleCauses: z.array(AiPossibleCauseSchema).max(8),
  missingInformation: z.array(z.string().max(300)).max(15),
  safetyNote: z.string().max(500),
});

export type AiSuggestionOutput = z.infer<typeof AiSuggestionOutputSchema>;

export const AiDecisionSchema = z.object({
  decision: z.enum(["ACCEPTED", "EDITED", "REJECTED"]),
  decisionNote: z.string().trim().max(500).optional(),
  approvedValues: z
    .object({
      acceptedTitle: z.string().trim().max(200).optional(),
      acceptedCategory: z.string().trim().max(100).optional(),
      adoptedFindings: z
        .array(
          z.object({
            statement: z.string().trim().min(5),
            kind: z.enum(["FACT", "AI_HYPOTHESIS"]),
          })
        )
        .optional(),
    })
    .optional(),
});

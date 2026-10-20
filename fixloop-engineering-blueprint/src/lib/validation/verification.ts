import { z } from "zod";

export const CreateEffectivenessCheckSchema = z.object({
  criterion: z.string().trim().min(5, "Criterion must be clearly specified (at least 5 characters)"),
  samplePlan: z.string().trim().optional(),
  sampleSize: z.number().int().nonnegative("Sample size must be non-negative"),
  outOfToleranceCount: z.number().int().nonnegative("Out-of-tolerance count must be non-negative"),
  acceptableFailures: z.number().int().nonnegative().optional(),
  measurementWindow: z.string().trim().optional(),
  outcome: z.enum(["EFFECTIVE", "NOT_EFFECTIVE", "INCONCLUSIVE"]),
  reviewerComment: z.string().trim().optional(),
  evidenceIds: z.array(z.string()).default([]),
}).refine(
  (data) => data.outOfToleranceCount <= data.sampleSize,
  {
    message: "Out of tolerance count cannot exceed the total sample size",
    path: ["outOfToleranceCount"],
  }
);

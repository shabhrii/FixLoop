import { z } from "zod";

export const CreateFindingSchema = z.object({
  kind: z.enum(["FACT", "AI_HYPOTHESIS", "TESTED"]),
  statement: z.string().trim().min(5, "Finding statement must be at least 5 characters"),
  evidenceIds: z.array(z.string()).default([]),
});

export const ConfirmFindingSchema = z.object({
  rationale: z.string().trim().min(5, "Rationale must be provided if no direct evidence is attached").optional(),
  evidenceId: z.string().optional(),
}).refine(
  (data) => !!data.evidenceId || !!data.rationale,
  {
    message: "Cause confirmation requires either a supporting evidence reference or an audited rationale",
    path: ["evidenceId"],
  }
);

export const WhyStepInputSchema = z.object({
  stepNumber: z.number().int().min(1).max(10),
  question: z.string().trim().min(3, "Question is required"),
  answer: z.string().trim().min(3, "Answer is required"),
  evidenceIds: z.array(z.string()).default([]),
});

export const SaveWhyStepsSchema = z.object({
  steps: z.array(WhyStepInputSchema),
});

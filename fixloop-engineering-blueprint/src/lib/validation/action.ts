import { z } from "zod";

export const CreateActionSchema = z.object({
  actionType: z.enum(["CONTAINMENT", "CORRECTIVE", "PREVENTIVE"]),
  description: z.string().trim().min(5, "Action description must be at least 5 characters"),
  assigneeId: z.string().min(1, "Assignee is required"),
  dueAt: z.string().datetime().or(z.date()),
  isRequired: z.boolean().default(true),
});

export const CompleteActionSchema = z.object({
  expectedVersion: z.number().int().positive(),
  completionNote: z.string().trim().min(5, "Completion note must be at least 5 characters"),
  proofEvidenceIds: z.array(z.string()).default([]),
  waiverReason: z.string().trim().min(10, "Audited waiver reason must be at least 10 characters").optional(),
}).refine(
  (data) => data.proofEvidenceIds.length > 0 || !!data.waiverReason,
  {
    message: "Action completion requires either at least one proof evidence link or an audited waiver reason",
    path: ["proofEvidenceIds"],
  }
);

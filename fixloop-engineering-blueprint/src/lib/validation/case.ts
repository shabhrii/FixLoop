import { z } from "zod";

export const CreateCaseSchema = z.object({
  siteId: z.string().min(1, "Site is required"),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  category: z.string().trim().max(100).optional().nullable(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  partNumber: z.string().trim().max(100).optional().nullable(),
  machineId: z.string().trim().max(100).optional().nullable(),
  operation: z.string().trim().max(100).optional().nullable(),
  observedValue: z.number().optional().nullable(),
  unit: z.string().trim().max(50).optional().nullable(),
  specification: z.string().trim().max(200).optional().nullable(),
  quantityInspected: z.number().int().positive().optional().nullable(),
  quantityAffected: z.number().int().nonnegative().optional().nullable(),
  isDraft: z.boolean().optional().default(false),
  bot_field: z.string().max(0, "Automated submission detected").optional().default(""),
}).refine(
  (data) => {
    if (data.quantityInspected != null && data.quantityAffected != null) {
      return data.quantityAffected <= data.quantityInspected;
    }
    return true;
  },
  {
    message: "Quantity affected cannot exceed quantity inspected",
    path: ["quantityAffected"],
  }
);

export type CreateCaseInput = z.input<typeof CreateCaseSchema>;

export const SubmitCaseSchema = z.object({
  expectedVersion: z.number().int().positive(),
});

export const TriageCaseSchema = z.object({
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  category: z.string().trim().min(2, "Category is required"),
  containmentAssessment: z.string().trim().min(5, "Containment assessment is required"),
});

export const ReopenCaseSchema = z.object({
  expectedVersion: z.number().int().positive(),
  reason: z.string().trim().min(5, "Reopen reason must be at least 5 characters"),
});

export const CancelCaseSchema = z.object({
  expectedVersion: z.number().int().positive(),
  reason: z.string().trim().min(5, "Cancellation reason must be at least 5 characters"),
});

export const CloseCaseSchema = z.object({
  expectedVersion: z.number().int().positive(),
  notes: z.string().trim().optional(),
});

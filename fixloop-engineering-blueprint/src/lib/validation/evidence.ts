import { z } from "zod";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/csv",
] as const;

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB

export const CreateUploadIntentSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileType: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({ message: "Unsupported file type. Allowed: JPEG, PNG, WebP, PDF, CSV" }),
  }),
  fileSize: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(MAX_UPLOAD_BYTES, "File size exceeds the 15MB limit"),
  evidenceType: z.enum([
    "DEFECT_PHOTO",
    "MEASUREMENT",
    "PROCESS_RECORD",
    "ACTION_PROOF",
    "VERIFICATION_PROOF",
    "OTHER",
  ]),
  caption: z.string().trim().max(300).optional(),
});

export const FinalizeEvidenceSchema = z.object({
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i, "Valid SHA-256 hash required").optional(),
});

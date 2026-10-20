import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { CaseService } from "@/server/services/case-service";
import { handleApiError, jsonResponse } from "@/lib/api/handler";
import { DomainError } from "@/lib/errors/domain-error";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { z } from "zod";

const PatchCaseSchema = z.object({
  expectedVersion: z.number().int().positive(),
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).optional(),
  category: z.string().trim().max(100).optional().nullable(),
  partNumber: z.string().trim().max(100).optional().nullable(),
  machineId: z.string().trim().max(100).optional().nullable(),
  operation: z.string().trim().max(100).optional().nullable(),
  specification: z.string().trim().max(200).optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const qc = await CaseService.getCase(ctx, caseId);
    return jsonResponse(qc);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const data = PatchCaseSchema.parse(body);

    const updated = await CaseService.updateCase(ctx, caseId, data);
    return jsonResponse(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

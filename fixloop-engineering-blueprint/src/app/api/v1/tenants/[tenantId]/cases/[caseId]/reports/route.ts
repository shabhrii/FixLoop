import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { ReportService } from "@/server/services/report-service";
import { handleApiError, jsonResponse } from "@/lib/api/handler";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    let idempotencyKey = req.headers.get("Idempotency-Key");
    if (!idempotencyKey) {
      idempotencyKey = `rep-${caseId}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    }

    const report = await ReportService.generateCaseReport(ctx, caseId, idempotencyKey);
    return jsonResponse(report, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

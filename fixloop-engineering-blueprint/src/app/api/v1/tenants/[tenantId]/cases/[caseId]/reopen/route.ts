import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { CaseService } from "@/server/services/case-service";
import { ReopenCaseSchema } from "@/lib/validation/case";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const { expectedVersion, reason } = ReopenCaseSchema.parse(body);

    const reopened = await CaseService.reopenCase(ctx, caseId, expectedVersion, reason);
    return jsonResponse(reopened);
  } catch (err) {
    return handleApiError(err);
  }
}

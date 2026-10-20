import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { InvestigationService } from "@/server/services/investigation-service";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const investigation = await InvestigationService.getOrCreateInvestigation(ctx, caseId);
    return jsonResponse(investigation);
  } catch (err) {
    return handleApiError(err);
  }
}

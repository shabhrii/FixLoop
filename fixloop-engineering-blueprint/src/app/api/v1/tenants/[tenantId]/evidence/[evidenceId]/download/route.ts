import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { EvidenceService } from "@/server/services/evidence-service";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; evidenceId: string }> }
) {
  try {
    const { tenantId, evidenceId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const result = await EvidenceService.createDownloadUrl(ctx, evidenceId);
    return jsonResponse(result);
  } catch (err) {
    return handleApiError(err);
  }
}

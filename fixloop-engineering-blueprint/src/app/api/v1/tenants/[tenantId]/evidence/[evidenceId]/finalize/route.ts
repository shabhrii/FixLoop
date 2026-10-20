import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { EvidenceService } from "@/server/services/evidence-service";
import { FinalizeEvidenceSchema } from "@/lib/validation/evidence";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; evidenceId: string }> }
) {
  try {
    const { tenantId, evidenceId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    let bodyData: any = {};
    try {
      bodyData = await req.json();
    } catch {
      // Body is optional
    }
    const validated = FinalizeEvidenceSchema.optional().parse(bodyData);

    const finalized = await EvidenceService.finalizeEvidence(ctx, evidenceId, validated);
    return jsonResponse(finalized);
  } catch (err) {
    return handleApiError(err);
  }
}

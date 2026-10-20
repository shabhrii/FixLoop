import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { InvestigationService } from "@/server/services/investigation-service";
import { ConfirmFindingSchema } from "@/lib/validation/investigation";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string; findingId: string }> }
) {
  try {
    const { tenantId, caseId, findingId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = ConfirmFindingSchema.parse(body);

    const confirmed = await InvestigationService.confirmFinding(ctx, caseId, findingId, validated);
    return jsonResponse(confirmed);
  } catch (err) {
    return handleApiError(err);
  }
}

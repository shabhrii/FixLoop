import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { InvestigationService } from "@/server/services/investigation-service";
import { SaveWhyStepsSchema } from "@/lib/validation/investigation";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = SaveWhyStepsSchema.parse(body);

    const investigation = await InvestigationService.saveWhySteps(ctx, caseId, validated);
    return jsonResponse(investigation);
  } catch (err) {
    return handleApiError(err);
  }
}

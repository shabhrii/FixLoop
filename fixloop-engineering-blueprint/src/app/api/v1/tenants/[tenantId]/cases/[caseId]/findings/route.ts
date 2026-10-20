import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { InvestigationService } from "@/server/services/investigation-service";
import { CreateFindingSchema } from "@/lib/validation/investigation";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = CreateFindingSchema.parse(body);

    const finding = await InvestigationService.createFinding(ctx, caseId, validated);
    return jsonResponse(finding, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

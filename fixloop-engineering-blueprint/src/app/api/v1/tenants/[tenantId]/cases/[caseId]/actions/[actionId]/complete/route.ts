import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { ActionService } from "@/server/services/action-service";
import { CompleteActionSchema } from "@/lib/validation/action";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string; actionId: string }> }
) {
  try {
    const { tenantId, caseId, actionId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = CompleteActionSchema.parse(body);

    const completed = await ActionService.completeAction(ctx, caseId, actionId, validated);
    return jsonResponse(completed);
  } catch (err) {
    return handleApiError(err);
  }
}

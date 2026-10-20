import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { ActionService } from "@/server/services/action-service";
import { CreateActionSchema } from "@/lib/validation/action";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = CreateActionSchema.parse(body);

    const action = await ActionService.createAction(ctx, caseId, validated);
    return jsonResponse(action, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

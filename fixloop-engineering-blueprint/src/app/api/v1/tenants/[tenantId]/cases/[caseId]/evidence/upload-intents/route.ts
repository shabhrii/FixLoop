import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { EvidenceService } from "@/server/services/evidence-service";
import { CreateUploadIntentSchema } from "@/lib/validation/evidence";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = CreateUploadIntentSchema.parse(body);

    const result = await EvidenceService.createUploadIntent(ctx, caseId, validated);
    return jsonResponse(result, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

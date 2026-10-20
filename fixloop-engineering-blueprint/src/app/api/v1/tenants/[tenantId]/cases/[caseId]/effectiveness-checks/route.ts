import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { VerificationService } from "@/server/services/verification-service";
import { CreateEffectivenessCheckSchema } from "@/lib/validation/verification";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = CreateEffectivenessCheckSchema.parse(body);

    const check = await VerificationService.recordEffectivenessCheck(ctx, caseId, validated);
    return jsonResponse(check, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

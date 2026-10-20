import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { CaseService } from "@/server/services/case-service";
import { SubmitCaseSchema } from "@/lib/validation/case";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = SubmitCaseSchema.parse(body);

    const submitted = await CaseService.submitCase(ctx, caseId, validated.expectedVersion);
    return jsonResponse(submitted);
  } catch (err) {
    return handleApiError(err);
  }
}

import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { AiSuggestionService } from "@/server/services/ai-suggestion-service";
import { AiDecisionSchema } from "@/lib/validation/ai";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string; suggestionId: string }> }
) {
  try {
    const { tenantId, caseId, suggestionId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = AiDecisionSchema.parse(body);

    const result = await AiSuggestionService.recordDecision(ctx, caseId, suggestionId, validated);
    return jsonResponse(result);
  } catch (err) {
    return handleApiError(err);
  }
}

import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { AiSuggestionService } from "@/server/services/ai-suggestion-service";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string; suggestionId: string }> }
) {
  try {
    const { tenantId, suggestionId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const suggestion = await AiSuggestionService.getSuggestion(ctx, suggestionId);
    return jsonResponse(suggestion);
  } catch (err) {
    return handleApiError(err);
  }
}

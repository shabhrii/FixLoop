import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { AiSuggestionService } from "@/server/services/ai-suggestion-service";
import { handleApiError, jsonResponse } from "@/lib/api/handler";
import { SuggestionType } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    let type: SuggestionType = "CAUSE_HYPOTHESES";
    try {
      const body = await req.json();
      if (body.suggestionType) type = body.suggestionType;
    } catch {
      // Body is optional
    }

    const suggestion = await AiSuggestionService.requestSuggestion(ctx, caseId, type);
    return jsonResponse(suggestion, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

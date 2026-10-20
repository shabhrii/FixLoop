import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { SearchService } from "@/server/services/search-service";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const url = new URL(req.url);
    const query = url.searchParams.get("q") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const partNumber = url.searchParams.get("partNumber") || undefined;
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : 20;

    const results = await SearchService.searchClosedCases(ctx, {
      query,
      category,
      partNumber,
      limit,
    });

    return jsonResponse(results);
  } catch (err) {
    return handleApiError(err);
  }
}

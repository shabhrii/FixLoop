import { NextRequest, NextResponse } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { EvidenceService } from "@/server/services/evidence-service";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; evidenceId: string }> }
) {
  try {
    const { tenantId, evidenceId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const result = await EvidenceService.createDownloadUrl(ctx, evidenceId);

    // If request is from browser navigation (direct link click), redirect to signed download URL
    const acceptHeader = req.headers.get("accept") || "";
    if (acceptHeader.includes("text/html") || !acceptHeader.includes("application/json")) {
      return NextResponse.redirect(result.downloadUrl);
    }

    return jsonResponse(result);
  } catch (err) {
    return handleApiError(err);
  }
}

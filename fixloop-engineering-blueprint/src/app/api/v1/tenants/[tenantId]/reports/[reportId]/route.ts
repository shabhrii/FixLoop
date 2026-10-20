import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { ReportService } from "@/server/services/report-service";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; reportId: string }> }
) {
  try {
    const { tenantId, reportId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const result = await ReportService.getReportDownloadUrl(ctx, reportId);
    return jsonResponse(result);
  } catch (err) {
    return handleApiError(err);
  }
}

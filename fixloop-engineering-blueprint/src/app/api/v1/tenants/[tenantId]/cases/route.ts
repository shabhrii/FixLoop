import { NextRequest } from "next/server";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { CaseService } from "@/server/services/case-service";
import { CreateCaseSchema } from "@/lib/validation/case";
import { handleApiError, jsonResponse } from "@/lib/api/handler";
import { CaseStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const url = new URL(req.url);
    const status = url.searchParams.get("status") as CaseStatus | undefined;
    const siteId = url.searchParams.get("siteId") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const cases = await CaseService.listCases(ctx, { status, siteId, search });
    return jsonResponse(cases);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const body = await req.json();
    const validated = CreateCaseSchema.parse(body);

    const created = await CaseService.createCase(ctx, validated);
    return jsonResponse(created, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

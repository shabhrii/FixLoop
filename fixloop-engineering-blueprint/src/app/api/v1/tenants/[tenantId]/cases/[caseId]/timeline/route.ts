import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { Policy } from "@/lib/auth/policy";
import { handleApiError, jsonResponse } from "@/lib/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; caseId: string }> }
) {
  try {
    const { tenantId, caseId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);
    Policy.assert(Policy.canViewAudit(ctx.role), "Insufficient permissions to view audit timeline");

    const events = await prisma.auditEvent.findMany({
      where: { tenantId: ctx.tenantId, caseId },
      orderBy: { createdAt: "asc" },
      include: {
        actor: { select: { id: true, displayName: true, email: true } },
      },
    });

    return jsonResponse(events);
  } catch (err) {
    return handleApiError(err);
  }
}

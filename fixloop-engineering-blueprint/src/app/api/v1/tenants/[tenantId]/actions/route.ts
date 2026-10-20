import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { handleApiError, jsonResponse } from "@/lib/api/handler";
import { ActionStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const ctx = await resolveTenantContext(tenantId, req);

    const url = new URL(req.url);
    const assignedToMe = url.searchParams.get("assignedToMe") === "true";
    const status = url.searchParams.get("status") as ActionStatus | undefined;

    const where: any = {
      tenantId: ctx.tenantId,
    };

    if (assignedToMe || ctx.role === "ACTION_OWNER") {
      where.assigneeId = ctx.user.id;
    }

    if (status) {
      where.status = status;
    }

    const actions = await prisma.action.findMany({
      where,
      orderBy: { dueAt: "asc" },
      include: {
        case: { select: { id: true, caseNumber: true, title: true, severity: true } },
        assignee: { select: { id: true, displayName: true, email: true } },
        proofLinks: { include: { evidence: true } },
      },
    });

    return jsonResponse(actions);
  } catch (err) {
    return handleApiError(err);
  }
}

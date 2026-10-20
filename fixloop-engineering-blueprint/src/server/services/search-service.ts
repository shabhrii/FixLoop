import prisma from "@/lib/db/prisma";
import { TenantContext } from "@/types/auth";
import { CaseStatus, FindingKind } from "@prisma/client";

export const SearchService = {
  /**
   * Searches historical closed cases strictly scoped to the tenant workspace.
   */
  async searchClosedCases(
    ctx: TenantContext,
    params: { query?: string; category?: string; partNumber?: string; limit?: number }
  ) {
    const limit = Math.min(params.limit || 20, 50);

    const where: any = {
      tenantId: ctx.tenantId,
      status: CaseStatus.CLOSED,
    };

    if (params.category) {
      where.category = params.category;
    }
    if (params.partNumber) {
      where.partNumber = { contains: params.partNumber, mode: "insensitive" };
    }

    if (params.query && params.query.trim().length > 0) {
      const q = params.query.trim();
      where.OR = [
        { caseNumber: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { partNumber: { contains: q, mode: "insensitive" } },
        { machineId: { contains: q, mode: "insensitive" } },
        {
          findings: {
            some: {
              kind: FindingKind.CONFIRMED,
              statement: { contains: q, mode: "insensitive" },
            },
          },
        },
      ];
    }

    return await prisma.qualityCase.findMany({
      where,
      take: limit,
      orderBy: { closedAt: "desc" },
      include: {
        site: { select: { id: true, name: true } },
        closedBy: { select: { id: true, displayName: true, email: true } },
        findings: {
          where: { kind: FindingKind.CONFIRMED },
          select: { id: true, statement: true, confirmedAt: true },
        },
        actions: {
          select: { id: true, actionType: true, description: true, status: true },
        },
        effectivenessChecks: {
          take: 1,
          orderBy: { reviewedAt: "desc" },
          select: { outcome: true, criterion: true, reviewedAt: true },
        },
      },
    });
  },
};

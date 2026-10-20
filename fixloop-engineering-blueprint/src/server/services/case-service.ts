import prisma from "@/lib/db/prisma";
import { TenantContext } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";
import { CasePolicy } from "@/server/policies/case-policy";
import { Policy } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { CaseStatus, Severity } from "@prisma/client";
import { z } from "zod";
import { CreateCaseSchema, CreateCaseInput, TriageCaseSchema } from "@/lib/validation/case";

export const CaseService = {
  /**
   * Generates a safe tenant-scoped case number.
   */
  async generateCaseNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.qualityCase.count({
      where: { tenantId },
    });
    const seq = String(count + 1).padStart(4, "0");
    return `CASE-${year}-${seq}`;
  },

  /**
   * Creates a new Quality Case scoped to the verified tenant.
   */
  async createCase(ctx: TenantContext, input: CreateCaseInput) {
    Policy.assert(Policy.canReportCase(ctx.role), "Auditors cannot report cases");

    const validated = CreateCaseSchema.parse(input);

    // Enforce site belongs to the same tenant
    const site = await prisma.site.findFirst({
      where: { id: validated.siteId, tenantId: ctx.tenantId, isActive: true },
    });
    if (!site) {
      throw DomainError.validation("Selected site is invalid or does not belong to this workspace");
    }

    const caseNumber = await this.generateCaseNumber(ctx.tenantId);

    return await prisma.$transaction(async (tx) => {
      const newCase = await tx.qualityCase.create({
        data: {
          tenantId: ctx.tenantId,
          siteId: site.id,
          caseNumber,
          title: validated.title,
          description: validated.description,
          category: validated.category,
          severity: validated.severity as Severity,
          status: validated.isDraft ? CaseStatus.DRAFT : CaseStatus.SUBMITTED,
          partNumber: validated.partNumber,
          machineId: validated.machineId,
          operation: validated.operation,
          observedValue: validated.observedValue != null ? validated.observedValue : null,
          unit: validated.unit,
          specification: validated.specification,
          quantityInspected: validated.quantityInspected,
          quantityAffected: validated.quantityAffected,
          reportedById: ctx.user.id,
          submittedAt: validated.isDraft ? null : new Date(),
          version: 1,
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: newCase.id,
          actorId: ctx.user.id,
          eventName: "CASE_CREATED",
          entityType: "QualityCase",
          entityId: newCase.id,
          caseVersion: 1,
          metadata: {
            caseNumber,
            severity: input.severity,
            siteId: site.id,
            reportedBy: ctx.user.email,
          },
        },
        tx
      );

      return newCase;
    });
  },

  /**
   * Retrieves a single case by ID strictly scoped to tenant.
   */
  async getCase(ctx: TenantContext, caseId: string) {
    const qc = await prisma.qualityCase.findFirst({
      where: {
        id: caseId,
        tenantId: ctx.tenantId,
      },
      include: {
        site: true,
        reportedBy: { select: { id: true, email: true, displayName: true } },
        triageOwner: { select: { id: true, email: true, displayName: true } },
        closedBy: { select: { id: true, email: true, displayName: true } },
        evidence: true,
        findings: {
          include: {
            evidenceLinks: { include: { evidence: true } },
            createdBy: { select: { id: true, displayName: true, email: true } },
            confirmedBy: { select: { id: true, displayName: true, email: true } },
          },
        },
        investigations: {
          include: {
            whySteps: {
              orderBy: { stepNumber: "asc" },
              include: { evidenceLinks: { include: { evidence: true } } },
            },
          },
        },
        actions: {
          include: {
            assignee: { select: { id: true, displayName: true, email: true } },
            createdBy: { select: { id: true, displayName: true, email: true } },
            completedBy: { select: { id: true, displayName: true, email: true } },
            proofLinks: { include: { evidence: true } },
          },
        },
        effectivenessChecks: {
          orderBy: { reviewedAt: "desc" },
          include: {
            reviewer: { select: { id: true, displayName: true, email: true } },
            evidenceLinks: { include: { evidence: true } },
          },
        },
        aiSuggestions: {
          orderBy: { requestedAt: "desc" },
          take: 5,
        },
      },
    });

    if (!qc) {
      throw DomainError.notFound("Case");
    }

    return qc;
  },

  /**
   * Lists cases strictly scoped to tenant with optional filters.
   */
  async listCases(
    ctx: TenantContext,
    filters?: { status?: CaseStatus; siteId?: string; search?: string }
  ) {
    const where: any = {
      tenantId: ctx.tenantId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.siteId) {
      where.siteId = filters.siteId;
    }
    if (filters?.search) {
      where.OR = [
        { caseNumber: { contains: filters.search, mode: "insensitive" } },
        { title: { contains: filters.search, mode: "insensitive" } },
        { partNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return await prisma.qualityCase.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        site: { select: { id: true, name: true, code: true } },
        reportedBy: { select: { id: true, displayName: true, email: true } },
        _count: {
          select: {
            evidence: true,
            actions: true,
            findings: true,
          },
        },
      },
    });
  },

  /**
   * Triages a case, updating severity and containment assessment and advancing state.
   */
  async triageCase(ctx: TenantContext, caseId: string, input: z.infer<typeof TriageCaseSchema>) {
    Policy.assert(Policy.canTriageCase(ctx.role), "Only Quality Engineers can triage cases");

    const existing = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!existing) {
      throw DomainError.notFound("Case");
    }

    if (!CasePolicy.isAllowedTransition(existing.status, CaseStatus.INVESTIGATING)) {
      throw DomainError.invalidTransition(existing.status, CaseStatus.INVESTIGATING);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.qualityCase.update({
        where: { id: existing.id },
        data: {
          severity: input.severity as Severity,
          category: input.category,
          containmentAssessment: input.containmentAssessment,
          triageOwnerId: ctx.user.id,
          status: CaseStatus.INVESTIGATING,
          version: { increment: 1 },
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: existing.id,
          actorId: ctx.user.id,
          eventName: "CASE_TRIAGED",
          entityType: "QualityCase",
          entityId: existing.id,
          caseVersion: updated.version,
          metadata: {
            severity: input.severity,
            containment: input.containmentAssessment,
          },
        },
        tx
      );

      return updated;
    });
  },

  /**
   * Closes a case enforcing all closure guards, verification outcome, and proofs.
   */
  async closeCase(ctx: TenantContext, caseId: string, expectedVersion: number, notes?: string) {
    Policy.assert(Policy.canCloseCase(ctx.role), "Only Quality Engineers can close cases");

    const existing = await this.getCase(ctx, caseId);

    if (existing.version !== expectedVersion) {
      throw DomainError.staleVersion(expectedVersion, existing.version);
    }

    // Map candidate actions for policy verification
    const actions = existing.actions.map((a) => ({
      id: a.id,
      status: a.status,
      isRequired: a.isRequired,
      proofCount: a.proofLinks.length,
      hasAuditedWaiver: !!a.completionNote?.includes("[WAIVER]"),
    }));

    const latestCheck = existing.effectivenessChecks[0]
      ? {
          id: existing.effectivenessChecks[0].id,
          outcome: existing.effectivenessChecks[0].outcome,
          reviewedAt: existing.effectivenessChecks[0].reviewedAt,
          reviewerId: existing.effectivenessChecks[0].reviewerId,
        }
      : null;

    const findings = existing.findings.map((f) => ({
      id: f.id,
      kind: f.kind,
      hasEvidence: f.evidenceLinks.length > 0,
      rationale: null,
    }));

    // Verify closure rules via central deterministic policy
    const policyResult = CasePolicy.canClose({
      role: ctx.role,
      currentStatus: existing.status,
      actions,
      latestEffectivenessCheck: latestCheck,
      findings,
    });

    if (!policyResult.allowed) {
      throw DomainError.invalidTransition(
        existing.status,
        CaseStatus.CLOSED,
        policyResult.reasons.join(" ")
      );
    }

    return await prisma.$transaction(async (tx) => {
      const closed = await tx.qualityCase.update({
        where: { id: existing.id },
        data: {
          status: CaseStatus.CLOSED,
          closedById: ctx.user.id,
          closedAt: new Date(),
          version: { increment: 1 },
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: existing.id,
          actorId: ctx.user.id,
          eventName: "CASE_CLOSED",
          entityType: "QualityCase",
          entityId: existing.id,
          caseVersion: closed.version,
          metadata: {
            closedBy: ctx.user.email,
            notes,
            effectivenessCheckId: latestCheck?.id,
          },
        },
        tx
      );

      return closed;
    });
  },

  /**
   * Reopens a closed case with mandatory reason.
   */
  async reopenCase(ctx: TenantContext, caseId: string, expectedVersion: number, reason: string) {
    Policy.assert(Policy.canReopenCase(ctx.role), "Only Quality Engineers can reopen cases");

    const existing = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!existing) {
      throw DomainError.notFound("Case");
    }

    if (existing.version !== expectedVersion) {
      throw DomainError.staleVersion(expectedVersion, existing.version);
    }

    if (!CasePolicy.isAllowedTransition(existing.status, CaseStatus.REOPENED)) {
      throw DomainError.invalidTransition(existing.status, CaseStatus.REOPENED);
    }

    return await prisma.$transaction(async (tx) => {
      const reopened = await tx.qualityCase.update({
        where: { id: existing.id },
        data: {
          status: CaseStatus.REOPENED,
          reopenReason: reason,
          closedAt: null,
          closedById: null,
          version: { increment: 1 },
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: existing.id,
          actorId: ctx.user.id,
          eventName: "CASE_REOPENED",
          entityType: "QualityCase",
          entityId: existing.id,
          caseVersion: reopened.version,
          reason,
        },
        tx
      );

      return reopened;
    });
  },

  /**
   * Submits a DRAFT case to SUBMITTED status.
   */
  async submitCase(ctx: TenantContext, caseId: string, expectedVersion: number) {
    Policy.assert(Policy.canReportCase(ctx.role), "Auditors cannot submit cases");

    const existing = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!existing) throw DomainError.notFound("Case");

    if (existing.version !== expectedVersion) {
      throw DomainError.staleVersion(expectedVersion, existing.version);
    }

    if (!CasePolicy.isAllowedTransition(existing.status, CaseStatus.SUBMITTED)) {
      throw DomainError.invalidTransition(existing.status, CaseStatus.SUBMITTED);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.qualityCase.update({
        where: { id: existing.id },
        data: {
          status: CaseStatus.SUBMITTED,
          submittedAt: new Date(),
          version: { increment: 1 },
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: existing.id,
          actorId: ctx.user.id,
          eventName: "CASE_SUBMITTED",
          entityType: "QualityCase",
          entityId: existing.id,
          caseVersion: updated.version,
          metadata: {
            caseNumber: existing.caseNumber,
          },
        },
        tx
      );

      return updated;
    });
  },

  /**
   * Updates allow-listed non-status case fields.
   */
  async updateCase(
    ctx: TenantContext,
    caseId: string,
    data: {
      expectedVersion: number;
      title?: string;
      description?: string;
      category?: string | null;
      partNumber?: string | null;
      machineId?: string | null;
      operation?: string | null;
      specification?: string | null;
    }
  ) {
    Policy.assert(Policy.canReportCase(ctx.role), "Insufficient permissions to edit case");

    const existing = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!existing) throw DomainError.notFound("Case");

    if (existing.version !== data.expectedVersion) {
      throw DomainError.staleVersion(data.expectedVersion, existing.version);
    }

    return await prisma.$transaction(async (tx) => {
      const result = await tx.qualityCase.update({
        where: { id: existing.id },
        data: {
          title: data.title ?? undefined,
          description: data.description ?? undefined,
          category: data.category !== undefined ? data.category : undefined,
          partNumber: data.partNumber !== undefined ? data.partNumber : undefined,
          machineId: data.machineId !== undefined ? data.machineId : undefined,
          operation: data.operation !== undefined ? data.operation : undefined,
          specification: data.specification !== undefined ? data.specification : undefined,
          version: { increment: 1 },
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: existing.id,
          actorId: ctx.user.id,
          eventName: "CASE_UPDATED",
          entityType: "QualityCase",
          entityId: existing.id,
          caseVersion: result.version,
          metadata: { updatedFields: Object.keys(data).filter((k) => k !== "expectedVersion") },
        },
        tx
      );

      return result;
    });
  },
};

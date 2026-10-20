import prisma from "@/lib/db/prisma";
import { TenantContext } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";
import { Policy } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { FindingKind } from "@prisma/client";
import { z } from "zod";
import { CreateFindingSchema, ConfirmFindingSchema, SaveWhyStepsSchema } from "@/lib/validation/investigation";

export const InvestigationService = {
  /**
   * Adds a finding to a case. Note that CONFIRMED cannot be set directly; it requires confirmFinding.
   */
  async createFinding(
    ctx: TenantContext,
    caseId: string,
    input: z.infer<typeof CreateFindingSchema>
  ) {
    Policy.assert(Policy.canManageInvestigation(ctx.role), "Insufficient permissions to manage investigation");

    const qc = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!qc) throw DomainError.notFound("Case");

    return await prisma.$transaction(async (tx) => {
      const finding = await tx.finding.create({
        data: {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          kind: input.kind as FindingKind,
          statement: input.statement,
          createdById: ctx.user.id,
        },
      });

      // Link evidence if provided
      if (input.evidenceIds && input.evidenceIds.length > 0) {
        for (const evidenceId of input.evidenceIds) {
          // Verify evidence belongs to same tenant and case
          const ev = await tx.caseEvidence.findFirst({
            where: { id: evidenceId, tenantId: ctx.tenantId, caseId: qc.id },
          });
          if (ev) {
            await tx.findingEvidence.create({
              data: {
                tenantId: ctx.tenantId,
                findingId: finding.id,
                evidenceId: ev.id,
              },
            });
          }
        }
      }

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          actorId: ctx.user.id,
          eventName: "FINDING_CREATED",
          entityType: "Finding",
          entityId: finding.id,
          caseVersion: qc.version,
          metadata: { kind: input.kind, statement: input.statement },
        },
        tx
      );

      return finding;
    });
  },

  /**
   * Explicit human cause-confirmation command requiring Quality Engineer capability and proof or rationale.
   */
  async confirmFinding(
    ctx: TenantContext,
    caseId: string,
    findingId: string,
    input: z.infer<typeof ConfirmFindingSchema>
  ) {
    Policy.assert(
      Policy.canConfirmFinding(ctx.role),
      "Only a Quality Engineer can confirm a root cause"
    );

    const finding = await prisma.finding.findFirst({
      where: { id: findingId, caseId, tenantId: ctx.tenantId },
      include: { evidenceLinks: true },
    });
    if (!finding) throw DomainError.notFound("Finding");

    return await prisma.$transaction(async (tx) => {
      // If evidenceId is supplied, link it
      if (input.evidenceId) {
        const ev = await tx.caseEvidence.findFirst({
          where: { id: input.evidenceId, tenantId: ctx.tenantId, caseId },
        });
        if (!ev) throw DomainError.notFound("Evidence");

        await tx.findingEvidence.upsert({
          where: {
            tenantId_findingId_evidenceId: {
              tenantId: ctx.tenantId,
              findingId: finding.id,
              evidenceId: ev.id,
            },
          },
          create: {
            tenantId: ctx.tenantId,
            findingId: finding.id,
            evidenceId: ev.id,
          },
          update: {},
        });
      }

      const confirmed = await tx.finding.update({
        where: { id: finding.id },
        data: {
          kind: FindingKind.CONFIRMED,
          confirmedById: ctx.user.id,
          confirmedAt: new Date(),
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId,
          actorId: ctx.user.id,
          eventName: "FINDING_CONFIRMED",
          entityType: "Finding",
          entityId: finding.id,
          metadata: {
            confirmedBy: ctx.user.email,
            rationale: input.rationale,
            evidenceId: input.evidenceId,
          },
        },
        tx
      );

      return confirmed;
    });
  },

  /**
   * Saves ordered 5-Why investigation steps.
   */
  async saveWhySteps(
    ctx: TenantContext,
    caseId: string,
    input: z.infer<typeof SaveWhyStepsSchema>
  ) {
    Policy.assert(Policy.canManageInvestigation(ctx.role), "Insufficient permissions to edit investigation");

    const qc = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!qc) throw DomainError.notFound("Case");

    return await prisma.$transaction(async (tx) => {
      // Find or create the root investigation record
      let investigation = await tx.investigation.findFirst({
        where: { caseId: qc.id, tenantId: ctx.tenantId },
      });
      if (!investigation) {
        investigation = await tx.investigation.create({
          data: {
            tenantId: ctx.tenantId,
            caseId: qc.id,
            title: qc.title,
            summary: qc.description,
          },
        });
      }

      // Upsert/replace why steps
      await tx.whyStepEvidence.deleteMany({
        where: { tenantId: ctx.tenantId, whyStep: { investigationId: investigation.id } },
      });
      await tx.whyStep.deleteMany({
        where: { tenantId: ctx.tenantId, investigationId: investigation.id },
      });

      for (const step of input.steps) {
        const createdStep = await tx.whyStep.create({
          data: {
            tenantId: ctx.tenantId,
            investigationId: investigation.id,
            stepNumber: step.stepNumber,
            question: step.question,
            answer: step.answer,
          },
        });

        if (step.evidenceIds && step.evidenceIds.length > 0) {
          for (const evId of step.evidenceIds) {
            await tx.whyStepEvidence.create({
              data: {
                tenantId: ctx.tenantId,
                whyStepId: createdStep.id,
                evidenceId: evId,
              },
            });
          }
        }
      }

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          actorId: ctx.user.id,
          eventName: "FIVE_WHY_UPDATED",
          entityType: "Investigation",
          entityId: investigation.id,
          metadata: { stepCount: input.steps.length },
        },
        tx
      );

      return investigation;
    });
  },

  /**
   * Scoped read or initialize of the root investigation.
   */
  async getOrCreateInvestigation(ctx: TenantContext, caseId: string) {
    const qc = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!qc) throw DomainError.notFound("Case");

    let investigation = await prisma.investigation.findFirst({
      where: { caseId: qc.id, tenantId: ctx.tenantId },
      include: {
        whySteps: {
          orderBy: { stepNumber: "asc" },
          include: { evidenceLinks: { include: { evidence: true } } },
        },
      },
    });

    if (!investigation) {
      investigation = await prisma.investigation.create({
        data: {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          title: qc.title,
          summary: qc.description,
        },
        include: {
          whySteps: {
            orderBy: { stepNumber: "asc" },
            include: { evidenceLinks: { include: { evidence: true } } },
          },
        },
      });
    }

    return investigation;
  },
};

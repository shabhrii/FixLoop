import prisma from "@/lib/db/prisma";
import { TenantContext } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";
import { Policy } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { CaseStatus, EffectivenessOutcome, EvidenceStatus } from "@prisma/client";
import { z } from "zod";
import { CreateEffectivenessCheckSchema } from "@/lib/validation/verification";

export const VerificationService = {
  /**
   * Records an explicit human effectiveness review. Non-effective outcomes transition case backwards.
   */
  async recordEffectivenessCheck(
    ctx: TenantContext,
    caseId: string,
    input: z.infer<typeof CreateEffectivenessCheckSchema>
  ) {
    Policy.assert(
      Policy.canReviewEffectiveness(ctx.role),
      "Only a Quality Engineer can record effectiveness verification"
    );

    const qc = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!qc) throw DomainError.notFound("Case");

    // Verify evidence links if supplied
    if (input.evidenceIds && input.evidenceIds.length > 0) {
      const verifiedEvidence = await prisma.caseEvidence.findMany({
        where: {
          id: { in: input.evidenceIds },
          caseId,
          tenantId: ctx.tenantId,
          status: EvidenceStatus.AVAILABLE,
        },
      });
      if (verifiedEvidence.length !== input.evidenceIds.length) {
        throw DomainError.validation("One or more verification evidence files are not available");
      }
    }

    return await prisma.$transaction(async (tx) => {
      const check = await tx.effectivenessCheck.create({
        data: {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          criterion: input.criterion,
          samplePlan: input.samplePlan,
          sampleSize: input.sampleSize,
          outOfToleranceCount: input.outOfToleranceCount,
          acceptableFailures: input.acceptableFailures,
          measurementWindow: input.measurementWindow,
          outcome: input.outcome as EffectivenessOutcome,
          reviewerComment: input.reviewerComment,
          reviewerId: ctx.user.id,
          caseVersionAtReview: qc.version,
        },
      });

      // Link evidence
      if (input.evidenceIds) {
        for (const evId of input.evidenceIds) {
          await tx.effectivenessEvidence.create({
            data: {
              tenantId: ctx.tenantId,
              effectivenessCheckId: check.id,
              evidenceId: evId,
            },
          });
        }
      }

      // Handle backwards transitions for failed or inconclusive outcomes
      let nextStatus = qc.status;
      if (input.outcome === "NOT_EFFECTIVE") {
        nextStatus = CaseStatus.ACTION_IN_PROGRESS;
      } else if (input.outcome === "INCONCLUSIVE") {
        nextStatus = CaseStatus.INVESTIGATING;
      }

      if (nextStatus !== qc.status) {
        await tx.qualityCase.update({
          where: { id: qc.id },
          data: {
            status: nextStatus,
            version: { increment: 1 },
          },
        });
      }

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          actorId: ctx.user.id,
          eventName: "EFFECTIVENESS_REVIEWED",
          entityType: "EffectivenessCheck",
          entityId: check.id,
          caseVersion: qc.version,
          metadata: {
            outcome: input.outcome,
            sampleSize: input.sampleSize,
            outOfToleranceCount: input.outOfToleranceCount,
            nextStatus,
          },
        },
        tx
      );

      return check;
    });
  },
};

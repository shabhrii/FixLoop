import prisma from "@/lib/db/prisma";
import { TenantContext } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";
import { Policy } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { ActionStatus, ActionType, CaseStatus, EvidenceStatus } from "@prisma/client";
import { z } from "zod";
import { CreateActionSchema, CompleteActionSchema } from "@/lib/validation/action";

export const ActionService = {
  /**
   * Creates an assigned action on a case.
   */
  async createAction(ctx: TenantContext, caseId: string, input: z.infer<typeof CreateActionSchema>) {
    Policy.assert(Policy.canCreateAction(ctx.role), "Insufficient permissions to assign actions");

    const qc = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!qc) throw DomainError.notFound("Case");

    // Verify assignee has an active membership in this tenant
    const assigneeMembership = await prisma.membership.findFirst({
      where: { userId: input.assigneeId, tenantId: ctx.tenantId, isActive: true },
    });
    if (!assigneeMembership) {
      throw DomainError.validation("Assignee must be an active member of this workspace");
    }

    return await prisma.$transaction(async (tx) => {
      const action = await tx.action.create({
        data: {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          actionType: input.actionType as ActionType,
          description: input.description,
          assigneeId: input.assigneeId,
          createdById: ctx.user.id,
          dueAt: new Date(input.dueAt),
          isRequired: input.isRequired,
          status: ActionStatus.OPEN,
          version: 1,
        },
      });

      // Advance case state from INVESTIGATING to ACTION_IN_PROGRESS if needed
      if (qc.status === CaseStatus.INVESTIGATING) {
        await tx.qualityCase.update({
          where: { id: qc.id },
          data: {
            status: CaseStatus.ACTION_IN_PROGRESS,
            version: { increment: 1 },
          },
        });
      }

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          actorId: ctx.user.id,
          eventName: "ACTION_ASSIGNED",
          entityType: "Action",
          entityId: action.id,
          metadata: {
            actionType: input.actionType,
            assigneeId: input.assigneeId,
            dueAt: input.dueAt,
          },
        },
        tx
      );

      return action;
    });
  },

  /**
   * Completes an action, enforcing proof evidence or audited waiver, and updating case state when all required actions finish.
   */
  async completeAction(
    ctx: TenantContext,
    caseId: string,
    actionId: string,
    input: z.infer<typeof CompleteActionSchema>
  ) {
    const action = await prisma.action.findFirst({
      where: { id: actionId, caseId, tenantId: ctx.tenantId },
    });
    if (!action) throw DomainError.notFound("Action");

    Policy.assert(
      Policy.canCompleteAction(ctx.role, action.assigneeId, ctx.user.id),
      "You are not authorized to complete this action"
    );

    if (action.version !== input.expectedVersion) {
      throw DomainError.staleVersion(input.expectedVersion, action.version);
    }

    // Verify proof evidence files exist and are finalized/available
    if (input.proofEvidenceIds && input.proofEvidenceIds.length > 0) {
      const evidenceList = await prisma.caseEvidence.findMany({
        where: {
          id: { in: input.proofEvidenceIds },
          caseId,
          tenantId: ctx.tenantId,
          status: EvidenceStatus.AVAILABLE,
        },
      });

      if (evidenceList.length !== input.proofEvidenceIds.length) {
        throw DomainError.validation(
          "One or more proof evidence items are missing or not finalized in AVAILABLE status"
        );
      }
    }

    return await prisma.$transaction(async (tx) => {
      // Link proof evidence
      if (input.proofEvidenceIds) {
        for (const evId of input.proofEvidenceIds) {
          await tx.actionEvidence.upsert({
            where: {
              tenantId_actionId_evidenceId: {
                tenantId: ctx.tenantId,
                actionId: action.id,
                evidenceId: evId,
              },
            },
            create: {
              tenantId: ctx.tenantId,
              actionId: action.id,
              evidenceId: evId,
            },
            update: {},
          });
        }
      }

      const note = input.waiverReason
        ? `[WAIVER]: ${input.waiverReason} | ${input.completionNote}`
        : input.completionNote;

      const updatedAction = await tx.action.update({
        where: { id: action.id },
        data: {
          status: ActionStatus.COMPLETED,
          completionNote: note,
          completedById: ctx.user.id,
          completedAt: new Date(),
          version: { increment: 1 },
        },
      });

      // Check if all required actions on the case are completed
      const remainingUncompleted = await tx.action.count({
        where: {
          caseId,
          tenantId: ctx.tenantId,
          isRequired: true,
          status: { not: ActionStatus.COMPLETED },
        },
      });

      // If all required actions completed, transition case to VERIFICATION_PENDING
      if (remainingUncompleted === 0) {
        await tx.qualityCase.update({
          where: { id: caseId },
          data: {
            status: CaseStatus.VERIFICATION_PENDING,
            version: { increment: 1 },
          },
        });
      }

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId,
          actorId: ctx.user.id,
          eventName: "ACTION_COMPLETED",
          entityType: "Action",
          entityId: action.id,
          caseVersion: updatedAction.version,
          metadata: {
            hasWaiver: !!input.waiverReason,
            proofCount: input.proofEvidenceIds.length,
          },
        },
        tx
      );

      return updatedAction;
    });
  },
};

import prisma from "@/lib/db/prisma";
import { TenantContext } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";
import { AiAdapter } from "@/lib/ai/adapter";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { SuggestionStatus, SuggestionType, FindingKind } from "@prisma/client";
import { z } from "zod";
import { AiDecisionSchema } from "@/lib/validation/ai";

export const AiSuggestionService = {
  /**
   * Generates a schema-validated AI suggestion for the specified case.
   */
  async requestSuggestion(
    ctx: TenantContext,
    caseId: string,
    suggestionType: SuggestionType = "CAUSE_HYPOTHESES"
  ) {
    const qc = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
    });
    if (!qc) throw DomainError.notFound("Case");

    const result = await AiAdapter.generateSuggestion({
      suggestionType,
      input: {
        title: qc.title,
        description: qc.description,
        category: qc.category,
        observedValue: qc.observedValue ? Number(qc.observedValue) : null,
        unit: qc.unit,
        specification: qc.specification,
        machineId: qc.machineId,
        operation: qc.operation,
      },
    });

    return await prisma.$transaction(async (tx) => {
      const suggestion = await tx.aiSuggestion.create({
        data: {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          requestedById: ctx.user.id,
          suggestionType,
          status: SuggestionStatus.READY,
          provider: result.provider,
          model: result.model,
          promptVersion: result.promptVersion,
          schemaVersion: result.schemaVersion,
          inputHash: result.inputHash,
          outputJson: result.output as any,
          completedAt: new Date(),
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          actorId: ctx.user.id,
          eventName: "AI_SUGGESTION_GENERATED",
          entityType: "AiSuggestion",
          entityId: suggestion.id,
          metadata: {
            provider: result.provider,
            model: result.model,
            inputHash: result.inputHash,
          },
        },
        tx
      );

      return suggestion;
    });
  },

  /**
   * Records human accept/edit/reject decision for an AI proposal.
   */
  async recordDecision(
    ctx: TenantContext,
    caseId: string,
    suggestionId: string,
    input: z.infer<typeof AiDecisionSchema>
  ) {
    const suggestion = await prisma.aiSuggestion.findFirst({
      where: { id: suggestionId, caseId, tenantId: ctx.tenantId },
    });
    if (!suggestion) throw DomainError.notFound("AI Suggestion");

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.aiSuggestion.update({
        where: { id: suggestion.id },
        data: {
          status: input.decision as SuggestionStatus,
          decidedById: ctx.user.id,
          decidedAt: new Date(),
          decisionNote: input.decisionNote,
          decisionJson: input.approvedValues ? (input.approvedValues as any) : undefined,
        },
      });

      // If user accepted approved values, apply non-authoritative field suggestions
      if (input.approvedValues) {
        if (input.approvedValues.acceptedTitle || input.approvedValues.acceptedCategory) {
          await tx.qualityCase.update({
            where: { id: caseId },
            data: {
              title: input.approvedValues.acceptedTitle || undefined,
              category: input.approvedValues.acceptedCategory || undefined,
            },
          });
        }

        // If findings were adopted, create them as unconfirmed FACT or HYPOTHESIS
        if (input.approvedValues.adoptedFindings) {
          for (const f of input.approvedValues.adoptedFindings) {
            await tx.finding.create({
              data: {
                tenantId: ctx.tenantId,
                caseId,
                kind: f.kind === "FACT" ? FindingKind.FACT : FindingKind.AI_HYPOTHESIS,
                statement: f.statement,
                createdById: ctx.user.id,
              },
            });
          }
        }
      }

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId,
          actorId: ctx.user.id,
          eventName: "AI_SUGGESTION_DECIDED",
          entityType: "AiSuggestion",
          entityId: suggestion.id,
          metadata: {
            decision: input.decision,
            hasApprovedValues: !!input.approvedValues,
          },
        },
        tx
      );

      return updated;
    });
  },

  /**
   * Retrieves an AI suggestion strictly scoped to tenant.
   */
  async getSuggestion(ctx: TenantContext, suggestionId: string) {
    const suggestion = await prisma.aiSuggestion.findFirst({
      where: { id: suggestionId, tenantId: ctx.tenantId },
    });
    if (!suggestion) throw DomainError.notFound("AiSuggestion");
    return suggestion;
  },
};

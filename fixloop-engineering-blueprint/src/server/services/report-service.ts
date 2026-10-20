import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { TenantContext } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";
import { PrivateStorage } from "@/lib/storage/private-storage";
import { writeAuditEvent } from "@/lib/audit/write-audit-event";
import { FindingKind, ReportStatus } from "@prisma/client";

export const ReportService = {
  /**
   * Generates a tamper-evident audit report for a quality case using only human-approved records.
   */
  async generateCaseReport(ctx: TenantContext, caseId: string, idempotencyKey: string) {
    const qc = await prisma.qualityCase.findFirst({
      where: { id: caseId, tenantId: ctx.tenantId },
      include: {
        site: true,
        reportedBy: { select: { displayName: true, email: true } },
        closedBy: { select: { displayName: true, email: true } },
        findings: {
          where: { kind: { in: [FindingKind.FACT, FindingKind.TESTED, FindingKind.CONFIRMED] } },
          include: { confirmedBy: { select: { displayName: true, email: true } } },
        },
        actions: {
          include: {
            assignee: { select: { displayName: true, email: true } },
            completedBy: { select: { displayName: true, email: true } },
          },
        },
        effectivenessChecks: {
          include: { reviewer: { select: { displayName: true, email: true } } },
        },
      },
    });

    if (!qc) throw DomainError.notFound("Case");

    // Existing idempotent report check
    const existing = await prisma.caseReport.findFirst({
      where: { tenantId: ctx.tenantId, idempotencyKey },
    });
    if (existing && existing.status === ReportStatus.READY) {
      return existing;
    }

    const reportData = {
      title: `FixLoop Quality Report: ${qc.caseNumber}`,
      generatedAt: new Date().toISOString(),
      tenant: { id: ctx.tenantId, name: ctx.membership.tenantName },
      caseSummary: {
        caseNumber: qc.caseNumber,
        title: qc.title,
        status: qc.status,
        severity: qc.severity,
        site: qc.site.name,
        partNumber: qc.partNumber,
        machineId: qc.machineId,
        observedValue: qc.observedValue,
        unit: qc.unit,
        specification: qc.specification,
        containment: qc.containmentAssessment,
        reportedBy: qc.reportedBy.displayName || qc.reportedBy.email,
        closedBy: qc.closedBy?.displayName || qc.closedBy?.email || null,
        closedAt: qc.closedAt?.toISOString() || null,
      },
      confirmedRootCauses: qc.findings
        .filter((f) => f.kind === FindingKind.CONFIRMED)
        .map((f) => ({
          statement: f.statement,
          confirmedBy: f.confirmedBy?.displayName || f.confirmedBy?.email,
          confirmedAt: f.confirmedAt?.toISOString(),
        })),
      actionsTaken: qc.actions.map((a) => ({
        type: a.actionType,
        description: a.description,
        assignee: a.assignee.displayName || a.assignee.email,
        status: a.status,
        note: a.completionNote,
      })),
      verificationHistory: qc.effectivenessChecks.map((v) => ({
        criterion: v.criterion,
        sampleSize: v.sampleSize,
        outOfToleranceCount: v.outOfToleranceCount,
        outcome: v.outcome,
        reviewer: v.reviewer.displayName || v.reviewer.email,
        reviewedAt: v.reviewedAt.toISOString(),
      })),
    };

    const reportJson = JSON.stringify(reportData, null, 2);
    const buffer = Buffer.from(reportJson, "utf-8");
    const checksumSha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const objectKey = `tenants/${ctx.tenantId}/reports/${qc.id}/${checksumSha256}.json`;

    await PrivateStorage.writeBytes(objectKey, buffer);

    return await prisma.$transaction(async (tx) => {
      const report = await tx.caseReport.upsert({
        where: { tenantId_idempotencyKey: { tenantId: ctx.tenantId, idempotencyKey } },
        create: {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          requestedById: ctx.user.id,
          status: ReportStatus.READY,
          caseVersion: qc.version,
          objectKey,
          checksumSha256,
          idempotencyKey,
          completedAt: new Date(),
        },
        update: {
          status: ReportStatus.READY,
          objectKey,
          checksumSha256,
          completedAt: new Date(),
        },
      });

      await writeAuditEvent(
        {
          tenantId: ctx.tenantId,
          caseId: qc.id,
          actorId: ctx.user.id,
          eventName: "REPORT_GENERATED",
          entityType: "CaseReport",
          entityId: report.id,
          caseVersion: qc.version,
          metadata: { checksum: checksumSha256 },
        },
        tx
      );

      return report;
    });
  },

  /**
   * Retrieves signed download URL for report.
   */
  async getReportDownloadUrl(ctx: TenantContext, reportId: string) {
    const report = await prisma.caseReport.findFirst({
      where: { id: reportId, tenantId: ctx.tenantId },
    });
    if (!report || !report.objectKey) throw DomainError.notFound("Report");

    const { downloadUrl, expiresAt } = await PrivateStorage.createSignedDownloadUrl(
      ctx.tenantId,
      report.objectKey
    );

    return { downloadUrl, expiresAt, checksum: report.checksumSha256 };
  },
};

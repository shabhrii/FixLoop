import { describe, it, expect, beforeAll } from "vitest";
import prisma from "../../src/lib/db/prisma";
import { CaseService } from "../../src/server/services/case-service";
import { ActionService } from "../../src/server/services/action-service";
import { VerificationService } from "../../src/server/services/verification-service";
import { EvidenceService } from "../../src/server/services/evidence-service";
import { InvestigationService } from "../../src/server/services/investigation-service";
import { ReportService } from "../../src/server/services/report-service";
import { PrivateStorage } from "../../src/lib/storage/private-storage";
import { TenantContext } from "../../src/types/auth";
import { CaseStatus, ActionStatus, EffectivenessOutcome, EvidenceStatus, FindingKind } from "@prisma/client";

describe("End-to-End Defect-to-Verified-Closure Flow", () => {
  let qeContext: TenantContext;
  let operatorContext: TenantContext;
  let actionOwnerContext: TenantContext;
  let siteId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.findUniqueOrThrow({ where: { slug: "apex-precision-demo" } });
    const qeUser = await prisma.user.findUniqueOrThrow({ where: { email: "qe@synthetic-demo.com" } });
    const opUser = await prisma.user.findUniqueOrThrow({ where: { email: "operator@synthetic-demo.com" } });
    const actionUser = await prisma.user.findUniqueOrThrow({ where: { email: "actionowner@synthetic-demo.com" } });
    const site = await prisma.site.findFirstOrThrow({ where: { tenantId: tenant.id } });

    siteId = site.id;

    qeContext = {
      user: { id: qeUser.id, email: qeUser.email, displayName: qeUser.displayName },
      membership: {
        id: "mem-qe",
        tenantId: tenant.id,
        userId: qeUser.id,
        role: "QUALITY_ENGINEER",
        isActive: true,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
      },
      tenantId: tenant.id,
      role: "QUALITY_ENGINEER",
    };

    operatorContext = {
      user: { id: opUser.id, email: opUser.email, displayName: opUser.displayName },
      membership: {
        id: "mem-op",
        tenantId: tenant.id,
        userId: opUser.id,
        role: "OPERATOR",
        isActive: true,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
      },
      tenantId: tenant.id,
      role: "OPERATOR",
    };

    actionOwnerContext = {
      user: { id: actionUser.id, email: actionUser.email, displayName: actionUser.displayName },
      membership: {
        id: "mem-ao",
        tenantId: tenant.id,
        userId: actionUser.id,
        role: "ACTION_OWNER",
        isActive: true,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
      },
      tenantId: tenant.id,
      role: "ACTION_OWNER",
    };
  });

  it("completes full lifecycle: intake -> triage -> evidence -> 5-why -> confirmed finding -> action -> verification -> closure -> report", async () => {
    // 1. Operator reports nonconformance
    const newCase = await CaseService.createCase(operatorContext, {
      siteId,
      title: "Cylinder bore concentricity runout on CNC-4",
      description: "Bore concentricity exceeds 0.015mm tolerance band on station 4 during morning shift.",
      severity: "HIGH",
      category: "DIMENSIONAL",
      partNumber: "CYL-8820",
      machineId: "CNC-04",
      operation: "OP-40-BORE",
      observedValue: 0.028,
      specification: "0.015mm max",
      unit: "mm",
      quantityInspected: 50,
      quantityAffected: 6,
      isDraft: false,
    });

    expect(newCase.status).toBe(CaseStatus.SUBMITTED);
    expect(newCase.caseNumber).toMatch(/^CASE-\d{4}-\d{4}$/);

    // 2. QE triages defect and assigns containment assessment
    const triaged = await CaseService.triageCase(qeContext, newCase.id, {
      severity: "HIGH",
      category: "DIMENSIONAL",
      containmentAssessment: "Quarantined 6 affected cylinders in Lot B4. Paused OP-40 spindle for tool inspection.",
    });

    expect(triaged.status).toBe(CaseStatus.INVESTIGATING);
    expect(triaged.containmentAssessment).toContain("Quarantined 6 affected cylinders");

    // 3. Evidence Upload: Intent -> Write Bytes -> Finalize
    const intent = await EvidenceService.createUploadIntent(qeContext, newCase.id, {
      fileName: "cmm_runout_scan.png",
      fileType: "image/png",
      fileSize: 1024,
      evidenceType: "MEASUREMENT",
      caption: "CMM profile showing 0.028mm deviation",
    });

    expect(intent.evidence.status).toBe(EvidenceStatus.UPLOAD_PENDING);

    // Simulate raw bytes upload to private storage
    const fakeImageBytes = Buffer.from("FAKE_PNG_BINARY_DATA_FOR_VERIFICATION");
    await PrivateStorage.writeBytes(intent.evidence.objectKey, fakeImageBytes);

    const finalizedEvidence = await EvidenceService.finalizeEvidence(qeContext, intent.evidence.id);
    expect(finalizedEvidence.status).toBe(EvidenceStatus.AVAILABLE);
    expect(finalizedEvidence.sha256).toBeDefined();

    // 4. Save 5-Why Investigation steps
    const investigation = await InvestigationService.saveWhySteps(qeContext, newCase.id, {
      steps: [
        {
          stepNumber: 1,
          question: "Why was bore runout excessive?",
          answer: "Spindle toolholder exhibited radial runout during high-speed pass.",
          evidenceIds: [finalizedEvidence.id],
        },
        {
          stepNumber: 2,
          question: "Why did the spindle toolholder exhibit runout?",
          answer: "Collet clamping torque was below nominal specification.",
          evidenceIds: [],
        },
        {
          stepNumber: 3,
          question: "Why was collet torque below spec?",
          answer: "Torque wrench preset calibration expired 12 days prior without shop-floor alert.",
          evidenceIds: [],
        },
      ],
    });

    expect(investigation).toBeDefined();

    // 5. Create Finding and Confirm Root Cause with Human Authorization
    const finding = await InvestigationService.createFinding(qeContext, newCase.id, {
      kind: "FACT",
      statement: "Calibration of torque wrench TW-09 expired on 2026-10-08",
      evidenceIds: [finalizedEvidence.id],
    });

    const confirmedFinding = await InvestigationService.confirmFinding(qeContext, newCase.id, finding.id, {
      rationale: "Physical inspection of TW-09 verified out-of-calibration setting; recalibration restored nominal torque.",
      evidenceId: finalizedEvidence.id,
    });

    expect(confirmedFinding.kind).toBe(FindingKind.CONFIRMED);
    expect(confirmedFinding.confirmedById).toBe(qeContext.user.id);

    // 6. Assign Corrective Action
    const action = await ActionService.createAction(qeContext, newCase.id, {
      actionType: "CORRECTIVE",
      description: "Recalibrate torque wrench TW-09 and update shop-floor calibration log",
      assigneeId: actionOwnerContext.user.id,
      dueAt: new Date(Date.now() + 86400000).toISOString(),
      isRequired: true,
    });

    expect(action.status).toBe(ActionStatus.OPEN);

    // Verify case transitioned to ACTION_IN_PROGRESS
    const caseAfterAction = await CaseService.getCase(qeContext, newCase.id);
    expect(caseAfterAction.status).toBe(CaseStatus.ACTION_IN_PROGRESS);

    // 7. Complete Action with Proof Evidence
    const completedAction = await ActionService.completeAction(actionOwnerContext, newCase.id, action.id, {
      expectedVersion: action.version,
      completionNote: "TW-09 recalibrated to 45Nm nominal. Attached calibration verification certificate.",
      proofEvidenceIds: [finalizedEvidence.id],
    });

    expect(completedAction.status).toBe(ActionStatus.COMPLETED);

    // Verify case transitioned to VERIFICATION_PENDING
    const caseAfterActionComplete = await CaseService.getCase(qeContext, newCase.id);
    expect(caseAfterActionComplete.status).toBe(CaseStatus.VERIFICATION_PENDING);

    // 8. Record Statistical Effectiveness Review
    const effectiveness = await VerificationService.recordEffectivenessCheck(qeContext, newCase.id, {
      criterion: "Runout <= 0.012mm across 30 consecutive machined parts",
      sampleSize: 30,
      outOfToleranceCount: 0,
      outcome: "EFFECTIVE",
      reviewerComment: "30/30 sample pieces within spec. Maximum runout recorded 0.009mm.",
      evidenceIds: [finalizedEvidence.id],
    });

    expect(effectiveness.outcome).toBe(EffectivenessOutcome.EFFECTIVE);

    // 9. Close Case (Closure Guard passes)
    const currentCase = await CaseService.getCase(qeContext, newCase.id);
    const closedCase = await CaseService.closeCase(
      qeContext,
      newCase.id,
      currentCase.version,
      "Countermeasure confirmed effective. Closed by Lead Quality Engineer."
    );

    expect(closedCase.status).toBe(CaseStatus.CLOSED);
    expect(closedCase.closedById).toBe(qeContext.user.id);
    expect(closedCase.closedAt).toBeDefined();

    // 10. Generate Tamper-Evident Report
    const idempotencyKey = `e2e-report-${newCase.id}-${Date.now()}`;
    const report = await ReportService.generateCaseReport(qeContext, newCase.id, idempotencyKey);

    expect(report.status).toBe("READY");
    expect(report.checksumSha256).toBeDefined();

    const dl = await ReportService.getReportDownloadUrl(qeContext, report.id);
    expect(dl.downloadUrl).toContain("/api/v1/storage/transfer?token=");
    expect(dl.checksum).toBe(report.checksumSha256);
  });
});

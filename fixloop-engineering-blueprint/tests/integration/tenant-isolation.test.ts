import { describe, it, expect, beforeAll } from "vitest";
import prisma from "../../src/lib/db/prisma";
import { CaseService } from "../../src/server/services/case-service";
import { ActionService } from "../../src/server/services/action-service";
import { VerificationService } from "../../src/server/services/verification-service";
import { EvidenceService } from "../../src/server/services/evidence-service";
import { TenantContext } from "../../src/types/auth";
import { CaseStatus, EffectivenessOutcome, EvidenceStatus } from "@prisma/client";

describe("Tenant Isolation and Case Lifecycle Integration Tests", () => {
  let tenantAContext: TenantContext;
  let tenantBContext: TenantContext;
  let operatorContext: TenantContext;
  let tenantASiteId: string;

  beforeAll(async () => {
    // Retrieve seeded demo records
    const tenantA = await prisma.tenant.findUniqueOrThrow({ where: { slug: "apex-precision-demo" } });
    const tenantB = await prisma.tenant.findUniqueOrThrow({ where: { slug: "b-corp-demo" } });

    const qeUser = await prisma.user.findUniqueOrThrow({ where: { email: "qe@synthetic-demo.com" } });
    const operatorUser = await prisma.user.findUniqueOrThrow({ where: { email: "operator@synthetic-demo.com" } });
    const tenantBUser = await prisma.user.findUniqueOrThrow({ where: { email: "engineer@tenant-b-synthetic.com" } });

    const site = await prisma.site.findFirstOrThrow({ where: { tenantId: tenantA.id } });
    tenantASiteId = site.id;

    tenantAContext = {
      user: { id: qeUser.id, email: qeUser.email, displayName: qeUser.displayName },
      membership: {
        id: "mem-a-qe",
        tenantId: tenantA.id,
        userId: qeUser.id,
        role: "QUALITY_ENGINEER",
        isActive: true,
        tenantName: tenantA.name,
        tenantSlug: tenantA.slug,
      },
      tenantId: tenantA.id,
      role: "QUALITY_ENGINEER",
    };

    operatorContext = {
      user: { id: operatorUser.id, email: operatorUser.email, displayName: operatorUser.displayName },
      membership: {
        id: "mem-a-op",
        tenantId: tenantA.id,
        userId: operatorUser.id,
        role: "OPERATOR",
        isActive: true,
        tenantName: tenantA.name,
        tenantSlug: tenantA.slug,
      },
      tenantId: tenantA.id,
      role: "OPERATOR",
    };

    tenantBContext = {
      user: { id: tenantBUser.id, email: tenantBUser.email, displayName: tenantBUser.displayName },
      membership: {
        id: "mem-b-eng",
        tenantId: tenantB.id,
        userId: tenantBUser.id,
        role: "QUALITY_ENGINEER",
        isActive: true,
        tenantName: tenantB.name,
        tenantSlug: tenantB.slug,
      },
      tenantId: tenantB.id,
      role: "QUALITY_ENGINEER",
    };
  });

  it("Strictly isolates cross-tenant case access: Tenant B cannot read Tenant A case", async () => {
    // Create case in Tenant A
    const newCase = await CaseService.createCase(operatorContext, {
      siteId: tenantASiteId,
      title: "Test case for isolation check",
      description: "Sample test case description with sufficient characters",
      severity: "MEDIUM",
      quantityInspected: 10,
      quantityAffected: 1,
    });

    // Tenant A Quality Engineer can retrieve the case
    const retrievedA = await CaseService.getCase(tenantAContext, newCase.id);
    expect(retrievedA.id).toBe(newCase.id);

    // Tenant B Quality Engineer attempting to read Tenant A case MUST receive 404 NOT_FOUND
    await expect(CaseService.getCase(tenantBContext, newCase.id)).rejects.toThrow(
      "Case not found"
    );
  });

  it("DENIES closure if an unauthorized role (e.g. Operator) attempts to close", async () => {
    const newCase = await CaseService.createCase(operatorContext, {
      siteId: tenantASiteId,
      title: "Negative test for unauthorized closure",
      description: "Testing unauthorized closure attempt by operator",
      severity: "LOW",
    });

    await expect(
      CaseService.closeCase(operatorContext, newCase.id, newCase.version)
    ).rejects.toThrow(/Only Quality Engineers can close cases/i);
  });

  it("DENIES closure if effectiveness is not recorded or outcome is NOT_EFFECTIVE", async () => {
    const newCase = await CaseService.createCase(operatorContext, {
      siteId: tenantASiteId,
      title: "Negative test for non-effective closure",
      description: "Testing closure prevention when effectiveness outcome fails",
      severity: "HIGH",
    });

    // Triage case
    await CaseService.triageCase(tenantAContext, newCase.id, {
      severity: "HIGH",
      category: "DIMENSIONAL",
      containmentAssessment: "Quarantined lot 102 and stopped CNC-01",
    });

    // Assign action
    const action = await ActionService.createAction(tenantAContext, newCase.id, {
      actionType: "CORRECTIVE",
      description: "Replace worn cutting tool and recalibrate offset",
      assigneeId: operatorContext.user.id,
      dueAt: new Date(Date.now() + 86400000),
      isRequired: true,
    });

    // Create and finalize proof evidence
    const intent = await EvidenceService.createUploadIntent(operatorContext, newCase.id, {
      fileName: "tool_offset_check.png",
      fileType: "image/png",
      fileSize: 1024,
      evidenceType: "ACTION_PROOF",
    });

    // Simulate byte upload
    const { PrivateStorage } = await import("../../src/lib/storage/private-storage");
    await PrivateStorage.writeBytes(intent.evidence.objectKey, Buffer.from("fake image bytes"));
    await EvidenceService.finalizeEvidence(operatorContext, intent.evidence.id);

    // Complete action with proof
    await ActionService.completeAction(operatorContext, newCase.id, action.id, {
      expectedVersion: action.version,
      completionNote: "Tool replaced and verified with dial indicator",
      proofEvidenceIds: [intent.evidence.id],
    });

    // Record NOT_EFFECTIVE verification
    await VerificationService.recordEffectivenessCheck(tenantAContext, newCase.id, {
      criterion: "Diameter must remain within 45.000 +/- 0.010mm across 20 consecutive parts",
      sampleSize: 20,
      outOfToleranceCount: 3,
      outcome: EffectivenessOutcome.NOT_EFFECTIVE,
      reviewerComment: "3 out of 20 parts still exceeded tolerance",
      evidenceIds: [],
    });

    const updatedCase = await CaseService.getCase(tenantAContext, newCase.id);

    // Closure MUST be rejected because outcome was NOT_EFFECTIVE and case returned to ACTION_IN_PROGRESS
    await expect(
      CaseService.closeCase(tenantAContext, newCase.id, updatedCase.version)
    ).rejects.toThrow(/Closure requires an explicit 'EFFECTIVE' human verification|must be in 'VERIFICATION_PENDING'/);
  });

  it("Executes the full happy path: Intake -> Triage -> Action + Proof -> Effective Review -> Close Case", async () => {
    // 1. Report Case
    const newCase = await CaseService.createCase(operatorContext, {
      siteId: tenantASiteId,
      title: "End-to-end lifecycle verification test",
      description: "Comprehensive end-to-end validation case for FixLoop blueprint",
      severity: "MEDIUM",
      partNumber: "PART-VAL-900",
      machineId: "VMC-04",
      quantityInspected: 100,
      quantityAffected: 2,
    });
    expect(newCase.status).toBe(CaseStatus.SUBMITTED);

    // 2. Triage
    const triaged = await CaseService.triageCase(tenantAContext, newCase.id, {
      severity: "MEDIUM",
      category: "DIMENSIONAL",
      containmentAssessment: "Containment: parts segregated and tagged with red tag",
    });
    expect(triaged.status).toBe(CaseStatus.INVESTIGATING);

    // 3. Action
    const action = await ActionService.createAction(tenantAContext, newCase.id, {
      actionType: "CORRECTIVE",
      description: "Recalibrate zero-point reference on machine VMC-04",
      assigneeId: tenantAContext.user.id,
      dueAt: new Date(Date.now() + 86400000),
      isRequired: true,
    });

    // 4. Evidence Proof
    const intent = await EvidenceService.createUploadIntent(tenantAContext, newCase.id, {
      fileName: "calibration_certificate.pdf",
      fileType: "application/pdf",
      fileSize: 2048,
      evidenceType: "ACTION_PROOF",
    });
    const { PrivateStorage } = await import("../../src/lib/storage/private-storage");
    await PrivateStorage.writeBytes(intent.evidence.objectKey, Buffer.from("pdf calibration bytes"));
    const finalizedEvidence = await EvidenceService.finalizeEvidence(tenantAContext, intent.evidence.id);
    expect(finalizedEvidence.status).toBe(EvidenceStatus.AVAILABLE);

    // 5. Complete Action
    const completedAction = await ActionService.completeAction(tenantAContext, newCase.id, action.id, {
      expectedVersion: action.version,
      completionNote: "Zero-point reference calibrated and certified by tooling tech",
      proofEvidenceIds: [finalizedEvidence.id],
    });
    expect(completedAction.status).toBe("COMPLETED");

    // Case should now automatically be in VERIFICATION_PENDING
    const casePendingVerification = await CaseService.getCase(tenantAContext, newCase.id);
    expect(casePendingVerification.status).toBe(CaseStatus.VERIFICATION_PENDING);

    // 6. Record EFFECTIVE review
    await VerificationService.recordEffectivenessCheck(tenantAContext, newCase.id, {
      criterion: "Zero defects observed across next 50 consecutive pieces",
      sampleSize: 50,
      outOfToleranceCount: 0,
      outcome: EffectivenessOutcome.EFFECTIVE,
      reviewerComment: "All 50 inspected parts were within 45.002 - 45.006mm (tolerance +/- 0.010mm)",
      evidenceIds: [],
    });

    const readyCase = await CaseService.getCase(tenantAContext, newCase.id);

    // 7. Close Case
    const closedCase = await CaseService.closeCase(tenantAContext, newCase.id, readyCase.version);
    expect(closedCase.status).toBe(CaseStatus.CLOSED);
    expect(closedCase.closedById).toBe(tenantAContext.user.id);

    // 8. Verify Audit Trail
    const auditEvents = await prisma.auditEvent.findMany({
      where: { caseId: newCase.id, tenantId: tenantAContext.tenantId },
      orderBy: { createdAt: "asc" },
    });
    expect(auditEvents.length).toBeGreaterThanOrEqual(4);
    const eventNames = auditEvents.map((e) => e.eventName);
    expect(eventNames).toContain("CASE_CREATED");
    expect(eventNames).toContain("CASE_TRIAGED");
    expect(eventNames).toContain("ACTION_COMPLETED");
    expect(eventNames).toContain("EFFECTIVENESS_REVIEWED");
    expect(eventNames).toContain("CASE_CLOSED");
  });

  it("DENIES cross-tenant mutations: Tenant B cannot create actions, upload intents, or close Tenant A cases", async () => {
    // Create case in Tenant A
    const caseA = await CaseService.createCase(tenantAContext, {
      siteId: tenantASiteId,
      title: "Target Case for Cross-Tenant Mutation Attempt",
      description: "Testing cross-tenant mutation denial across services",
      severity: "MEDIUM",
    });

    // 1. Tenant B attempts to create action on Case A -> rejected
    await expect(
      ActionService.createAction(tenantBContext, caseA.id, {
        actionType: "CONTAINMENT",
        description: "Malicious cross-tenant action injection",
        assigneeId: tenantBContext.user.id,
        dueAt: new Date(Date.now() + 86400000),
        isRequired: true,
      })
    ).rejects.toThrow("Case not found");

    // 2. Tenant B attempts to create upload intent on Case A -> rejected
    await expect(
      EvidenceService.createUploadIntent(tenantBContext, caseA.id, {
        fileName: "malicious_file.png",
        fileType: "image/png",
        fileSize: 1024,
        evidenceType: "DEFECT_PHOTO",
      })
    ).rejects.toThrow("Case not found");

    // 3. Tenant B attempts to close Case A -> rejected
    await expect(
      CaseService.closeCase(tenantBContext, caseA.id, caseA.version)
    ).rejects.toThrow("Case not found");
  });

  it("DENIES cross-tenant discovery in closed-case library search", async () => {
    const { SearchService } = await import("../../src/server/services/search-service");
    // Search closed cases as Tenant B looking for Tenant A's closed case
    const results = await SearchService.searchClosedCases(tenantBContext, {
      partNumber: "PART-VAL-900",
    });

    expect(results.length).toBe(0);
  });
});

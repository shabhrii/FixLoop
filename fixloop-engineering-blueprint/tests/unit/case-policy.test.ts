import { describe, it, expect } from "vitest";
import { CasePolicy } from "../../src/server/policies/case-policy";
import { ActionStatus, CaseStatus, EffectivenessOutcome, FindingKind } from "@prisma/client";

describe("CasePolicy State Machine Transitions", () => {
  it("allows valid forward transitions", () => {
    expect(CasePolicy.isAllowedTransition(CaseStatus.DRAFT, CaseStatus.SUBMITTED)).toBe(true);
    expect(CasePolicy.isAllowedTransition(CaseStatus.SUBMITTED, CaseStatus.TRIAGE)).toBe(true);
    expect(CasePolicy.isAllowedTransition(CaseStatus.TRIAGE, CaseStatus.INVESTIGATING)).toBe(true);
    expect(CasePolicy.isAllowedTransition(CaseStatus.INVESTIGATING, CaseStatus.ACTION_IN_PROGRESS)).toBe(true);
    expect(CasePolicy.isAllowedTransition(CaseStatus.ACTION_IN_PROGRESS, CaseStatus.VERIFICATION_PENDING)).toBe(true);
    expect(CasePolicy.isAllowedTransition(CaseStatus.VERIFICATION_PENDING, CaseStatus.CLOSED)).toBe(true);
  });

  it("allows valid backward transition on failed or inconclusive verification", () => {
    expect(CasePolicy.isAllowedTransition(CaseStatus.VERIFICATION_PENDING, CaseStatus.ACTION_IN_PROGRESS)).toBe(true);
    expect(CasePolicy.isAllowedTransition(CaseStatus.VERIFICATION_PENDING, CaseStatus.INVESTIGATING)).toBe(true);
  });

  it("allows reopening a closed case", () => {
    expect(CasePolicy.isAllowedTransition(CaseStatus.CLOSED, CaseStatus.REOPENED)).toBe(true);
    expect(CasePolicy.isAllowedTransition(CaseStatus.REOPENED, CaseStatus.INVESTIGATING)).toBe(true);
  });

  it("rejects unauthorized arbitrary state jumps", () => {
    expect(CasePolicy.isAllowedTransition(CaseStatus.DRAFT, CaseStatus.CLOSED)).toBe(false);
    expect(CasePolicy.isAllowedTransition(CaseStatus.SUBMITTED, CaseStatus.CLOSED)).toBe(false);
    expect(CasePolicy.isAllowedTransition(CaseStatus.INVESTIGATING, CaseStatus.CLOSED)).toBe(false);
    expect(CasePolicy.isAllowedTransition(CaseStatus.CANCELLED, CaseStatus.SUBMITTED)).toBe(false);
  });
});

describe("CasePolicy Closure Guard (canClose)", () => {
  const validAction = {
    id: "act-1",
    status: ActionStatus.COMPLETED,
    isRequired: true,
    proofCount: 1,
  };

  const validEffectiveness = {
    id: "eff-1",
    outcome: EffectivenessOutcome.EFFECTIVE,
    reviewedAt: new Date(),
    reviewerId: "user-qe",
  };

  const validFinding = {
    id: "find-1",
    kind: FindingKind.CONFIRMED,
    hasEvidence: true,
  };

  it("approves closure when all requirements are satisfied by a Quality Engineer", () => {
    const result = CasePolicy.canClose({
      role: "QUALITY_ENGINEER",
      currentStatus: CaseStatus.VERIFICATION_PENDING,
      actions: [validAction],
      latestEffectivenessCheck: validEffectiveness,
      findings: [validFinding],
    });

    expect(result.allowed).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it("DENIES closure if caller is NOT a Quality Engineer (e.g. Operator, Admin, Auditor)", () => {
    const operatorResult = CasePolicy.canClose({
      role: "OPERATOR",
      currentStatus: CaseStatus.VERIFICATION_PENDING,
      actions: [validAction],
      latestEffectivenessCheck: validEffectiveness,
      findings: [validFinding],
    });
    expect(operatorResult.allowed).toBe(false);
    expect(operatorResult.reasons[0]).toContain("Only a Quality Engineer can authorize case closure");

    const adminResult = CasePolicy.canClose({
      role: "TENANT_ADMIN",
      currentStatus: CaseStatus.VERIFICATION_PENDING,
      actions: [validAction],
      latestEffectivenessCheck: validEffectiveness,
      findings: [validFinding],
    });
    expect(adminResult.allowed).toBe(false);
  });

  it("DENIES closure if effectiveness check is NOT_EFFECTIVE or INCONCLUSIVE", () => {
    const notEffectiveResult = CasePolicy.canClose({
      role: "QUALITY_ENGINEER",
      currentStatus: CaseStatus.VERIFICATION_PENDING,
      actions: [validAction],
      latestEffectivenessCheck: { ...validEffectiveness, outcome: EffectivenessOutcome.NOT_EFFECTIVE },
      findings: [validFinding],
    });
    expect(notEffectiveResult.allowed).toBe(false);
    expect(notEffectiveResult.reasons[0]).toContain("NOT_EFFECTIVE");

    const inconclusiveResult = CasePolicy.canClose({
      role: "QUALITY_ENGINEER",
      currentStatus: CaseStatus.VERIFICATION_PENDING,
      actions: [validAction],
      latestEffectivenessCheck: { ...validEffectiveness, outcome: EffectivenessOutcome.INCONCLUSIVE },
      findings: [validFinding],
    });
    expect(inconclusiveResult.allowed).toBe(false);
  });

  it("DENIES closure if required actions lack proof or are incomplete", () => {
    const missingProofResult = CasePolicy.canClose({
      role: "QUALITY_ENGINEER",
      currentStatus: CaseStatus.VERIFICATION_PENDING,
      actions: [{ ...validAction, proofCount: 0 }],
      latestEffectivenessCheck: validEffectiveness,
      findings: [validFinding],
    });
    expect(missingProofResult.allowed).toBe(false);
    expect(missingProofResult.reasons[0]).toContain("lack finalized proof evidence");

    const openActionResult = CasePolicy.canClose({
      role: "QUALITY_ENGINEER",
      currentStatus: CaseStatus.VERIFICATION_PENDING,
      actions: [{ ...validAction, status: ActionStatus.IN_PROGRESS }],
      latestEffectivenessCheck: validEffectiveness,
      findings: [validFinding],
    });
    expect(openActionResult.allowed).toBe(false);
    expect(openActionResult.reasons[0]).toContain("are not completed");
  });
});

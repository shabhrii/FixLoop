import { CaseStatus, ActionStatus, EffectivenessOutcome, FindingKind, EvidenceStatus } from "@prisma/client";
import { TenantRole } from "@/types/auth";

export interface ClosureCandidateAction {
  id: string;
  status: ActionStatus;
  isRequired: boolean;
  proofCount: number;
  hasAuditedWaiver?: boolean;
}

export interface ClosureCandidateEffectiveness {
  id: string;
  outcome: EffectivenessOutcome;
  reviewedAt: Date;
  reviewerId: string;
}

export interface ClosureCandidateFinding {
  id: string;
  kind: FindingKind;
  hasEvidence: boolean;
  rationale?: string | null;
}

export interface CanCloseParams {
  role: TenantRole;
  currentStatus: CaseStatus;
  actions: ClosureCandidateAction[];
  latestEffectivenessCheck: ClosureCandidateEffectiveness | null;
  findings: ClosureCandidateFinding[];
}

export interface PolicyCheckResult {
  allowed: boolean;
  reasons: string[];
}

export const CasePolicy = {
  /**
   * Pure state machine transition rules.
   */
  isAllowedTransition(from: CaseStatus, to: CaseStatus): boolean {
    if (from === to) return true;

    switch (from) {
      case "DRAFT":
        return to === "SUBMITTED" || to === "CANCELLED";

      case "SUBMITTED":
        return to === "TRIAGE" || to === "INVESTIGATING" || to === "CANCELLED";

      case "TRIAGE":
        return to === "INVESTIGATING" || to === "CANCELLED";

      case "INVESTIGATING":
        return to === "ACTION_IN_PROGRESS" || to === "CANCELLED";

      case "ACTION_IN_PROGRESS":
        return to === "INVESTIGATING" || to === "VERIFICATION_PENDING" || to === "CANCELLED";

      case "VERIFICATION_PENDING":
        return to === "CLOSED" || to === "ACTION_IN_PROGRESS" || to === "INVESTIGATING";

      case "REOPENED":
        return to === "INVESTIGATING" || to === "ACTION_IN_PROGRESS";

      case "CLOSED":
        return to === "REOPENED";

      case "CANCELLED":
        return false; // Terminal state

      default:
        return false;
    }
  },

  /**
   * Deterministic closure guard implementing FR-08, FR-09 and non-negotiable rules.
   * Fails if actions lack proof, effectiveness outcome is not EFFECTIVE, or role is unauthorized.
   */
  canClose(params: CanCloseParams): PolicyCheckResult {
    const reasons: string[] = [];

    // 1. Role capability check
    if (params.role !== "QUALITY_ENGINEER") {
      reasons.push("Only a Quality Engineer can authorize case closure.");
    }

    // 2. State machine precondition
    if (params.currentStatus !== "VERIFICATION_PENDING") {
      reasons.push(`Case cannot be closed from '${params.currentStatus}'. It must be in 'VERIFICATION_PENDING'.`);
    }

    // 3. Action completion & proof verification
    const uncompletedRequiredActions = params.actions.filter(
      (a) => a.isRequired && a.status !== "COMPLETED"
    );
    if (uncompletedRequiredActions.length > 0) {
      reasons.push(
        `${uncompletedRequiredActions.length} required action(s) are not completed.`
      );
    }

    const actionsLackingProof = params.actions.filter(
      (a) => a.status === "COMPLETED" && a.proofCount === 0 && !a.hasAuditedWaiver
    );
    if (actionsLackingProof.length > 0) {
      reasons.push(
        `${actionsLackingProof.length} completed action(s) lack finalized proof evidence or an authorized waiver.`
      );
    }

    // 4. Effectiveness review check
    if (!params.latestEffectivenessCheck) {
      reasons.push("No effectiveness verification review has been recorded.");
    } else {
      if (params.latestEffectivenessCheck.outcome !== "EFFECTIVE") {
        reasons.push(
          `Effectiveness review outcome is '${params.latestEffectivenessCheck.outcome}'. Closure requires an explicit 'EFFECTIVE' human verification.`
        );
      }
    }

    // 5. Confirmed findings must be substantiated
    const unsubstantiatedFindings = params.findings.filter(
      (f) => f.kind === "CONFIRMED" && !f.hasEvidence && !f.rationale
    );
    if (unsubstantiatedFindings.length > 0) {
      reasons.push(
        `${unsubstantiatedFindings.length} confirmed finding(s) lack supporting evidence or documented rationale.`
      );
    }

    return {
      allowed: reasons.length === 0,
      reasons,
    };
  },
};

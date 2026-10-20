import { TenantRole } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";

export const Policy = {
  canReportCase(role: TenantRole): boolean {
    return role !== "AUDITOR";
  },

  canTriageCase(role: TenantRole): boolean {
    // Only Quality Engineers possess quality triage capability
    return role === "QUALITY_ENGINEER";
  },

  canConfirmFinding(role: TenantRole): boolean {
    // Cause confirmation is strictly reserved for human Quality Engineers
    return role === "QUALITY_ENGINEER";
  },

  canManageInvestigation(role: TenantRole): boolean {
    return role === "QUALITY_ENGINEER" || role === "TENANT_ADMIN";
  },

  canCreateAction(role: TenantRole): boolean {
    return role === "QUALITY_ENGINEER" || role === "TENANT_ADMIN";
  },

  canCompleteAction(role: TenantRole, assigneeId: string, currentUserId: string): boolean {
    if (role === "QUALITY_ENGINEER" || role === "TENANT_ADMIN") return true;
    return assigneeId === currentUserId;
  },

  canReviewEffectiveness(role: TenantRole): boolean {
    // Effectiveness review requires Quality Engineer capability
    return role === "QUALITY_ENGINEER";
  },

  canCloseCase(role: TenantRole): boolean {
    // Only Quality Engineer may close a case after effectiveness verification
    return role === "QUALITY_ENGINEER";
  },

  canReopenCase(role: TenantRole): boolean {
    return role === "QUALITY_ENGINEER";
  },

  canManageSites(role: TenantRole): boolean {
    return role === "TENANT_ADMIN";
  },

  canManageMembers(role: TenantRole): boolean {
    return role === "TENANT_ADMIN";
  },

  canViewAudit(role: TenantRole): boolean {
    return role === "QUALITY_ENGINEER" || role === "TENANT_ADMIN" || role === "AUDITOR";
  },

  assert(condition: boolean, message = "Insufficient permissions for this operation"): void {
    if (!condition) {
      throw DomainError.forbidden(message);
    }
  },
};

export type TenantRole =
  | "TENANT_ADMIN"
  | "OPERATOR"
  | "QUALITY_ENGINEER"
  | "ACTION_OWNER"
  | "AUDITOR";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantRole;
  isActive: boolean;
  tenantName: string;
  tenantSlug: string;
}

export interface TenantContext {
  user: SessionUser;
  membership: TenantMembership;
  tenantId: string;
  role: TenantRole;
}

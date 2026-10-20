import prisma from "@/lib/db/prisma";
import { getSessionUser } from "./session";
import { TenantContext } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";

/**
 * Resolves trusted TenantContext for a given tenant ID and incoming request.
 * Enforces identity, active tenant status, and active user membership.
 * Never trusts client-supplied role or membership IDs.
 */
export async function resolveTenantContext(
  tenantId: string,
  req?: Request
): Promise<TenantContext> {
  const user = await getSessionUser(req);
  if (!user) {
    throw DomainError.unauthenticated("Authentication required");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId: user.id,
      },
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      },
    },
  });

  if (!membership || !membership.isActive || !membership.tenant.isActive) {
    throw DomainError.forbidden("Access denied: You do not have active membership in this workspace");
  }

  return {
    user,
    membership: {
      id: membership.id,
      tenantId: membership.tenantId,
      userId: membership.userId,
      role: membership.role,
      isActive: membership.isActive,
      tenantName: membership.tenant.name,
      tenantSlug: membership.tenant.slug,
    },
    tenantId: membership.tenantId,
    role: membership.role,
  };
}

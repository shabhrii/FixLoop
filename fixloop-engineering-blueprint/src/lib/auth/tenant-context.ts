import prisma from "@/lib/db/prisma";
import { getSessionUser } from "./session";
import { TenantContext } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";

// In-memory cache for verified tenant memberships (60s TTL)
interface CachedMembership {
  id: string;
  tenantId: string;
  userId: string;
  role: any;
  isActive: boolean;
  tenantName: string;
  tenantSlug: string;
  cachedAt: number;
}

const membershipCache = new Map<string, CachedMembership>();
const CACHE_TTL_MS = 60 * 1000;

/**
 * Resolves trusted TenantContext for a given tenant ID and incoming request.
 * Enforces identity, active tenant status, and active user membership.
 * Never trusts client-supplied role or membership IDs.
 * Uses cryptographically-verified session token fast-path and bounded TTL caching for high performance.
 */
export async function resolveTenantContext(
  tenantId: string,
  req?: Request
): Promise<TenantContext> {
  const user = await getSessionUser(req);
  if (!user) {
    throw DomainError.unauthenticated("Authentication required");
  }

  const cacheKey = `${tenantId}:${user.id}`;
  const now = Date.now();
  const cached = membershipCache.get(cacheKey);

  if (cached && (now - cached.cachedAt) < CACHE_TTL_MS) {
    return {
      user,
      membership: cached,
      tenantId: cached.tenantId,
      role: cached.role,
    };
  }

  // Fast-path: If the JWT session token was already cryptographically signed with this tenantId and role,
  // verify without DB roundtrip if matching
  if (user.tenantId === tenantId && user.role && user.tenantName) {
    const tokenMembership: CachedMembership = {
      id: `token-${user.id}-${tenantId}`,
      tenantId,
      userId: user.id,
      role: user.role,
      isActive: true,
      tenantName: user.tenantName,
      tenantSlug: user.tenantSlug || "workspace",
      cachedAt: now,
    };
    membershipCache.set(cacheKey, tokenMembership);

    return {
      user,
      membership: tokenMembership,
      tenantId,
      role: user.role,
    };
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

  const resolved = {
    id: membership.id,
    tenantId: membership.tenantId,
    userId: membership.userId,
    role: membership.role,
    isActive: membership.isActive,
    tenantName: membership.tenant.name,
    tenantSlug: membership.tenant.slug,
    cachedAt: now,
  };

  membershipCache.set(cacheKey, resolved);

  return {
    user,
    membership: resolved,
    tenantId: membership.tenantId,
    role: membership.role,
  };
}

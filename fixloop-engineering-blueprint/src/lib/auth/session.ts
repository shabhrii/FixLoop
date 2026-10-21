import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionUser } from "@/types/auth";
import { DomainError } from "@/lib/errors/domain-error";

const COOKIE_NAME = "fixloop_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_COOKIE_SECRET || "development_cookie_secret_at_least_32_chars_long_12345"
);

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  displayName: string | null;
  tenantId?: string;
  role?: string;
  tenantName?: string;
  tenantSlug?: string;
  membershipId?: string;
  [key: string]: unknown;
}

/**
 * Signs a JWT session token with 7-day expiration.
 * Optionally embeds verified tenant membership to eliminate redundant DB lookups.
 */
export async function createSessionToken(
  user: SessionUser,
  membership?: {
    id?: string;
    tenantId: string;
    role: string;
    tenantName: string;
    tenantSlug: string;
  }
): Promise<string> {
  const payload: Record<string, any> = {
    email: user.email,
    displayName: user.displayName,
  };

  const tenantId = membership?.tenantId || user.tenantId;
  const role = membership?.role || user.role;
  const tenantName = membership?.tenantName || user.tenantName;
  const tenantSlug = membership?.tenantSlug || user.tenantSlug;
  const membershipId = membership?.id;

  if (tenantId) payload.tenantId = tenantId;
  if (role) payload.role = role;
  if (tenantName) payload.tenantName = tenantName;
  if (tenantSlug) payload.tenantSlug = tenantSlug;
  if (membershipId) payload.membershipId = membershipId;

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT token and returns the session payload.
 */
export async function verifySessionToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as TokenPayload;
  } catch {
    throw DomainError.unauthenticated("Invalid or expired session token");
  }
}

/**
 * Extracts and verifies the session from cookies or Authorization header.
 */
export async function getSessionUser(req?: Request): Promise<SessionUser | null> {
  let token: string | null = null;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(COOKIE_NAME);
      if (sessionCookie?.value) {
        token = sessionCookie.value;
      }
    } catch {
      // Cookies might not be available in non-request contexts
    }
  }

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      displayName: (payload.displayName as string) ?? null,
      tenantId: (payload.tenantId as string) || undefined,
      role: (payload.role as any) || undefined,
      tenantName: (payload.tenantName as string) || undefined,
      tenantSlug: (payload.tenantSlug as string) || undefined,
    };
  } catch {
    return null;
  }
}

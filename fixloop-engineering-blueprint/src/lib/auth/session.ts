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
  [key: string]: unknown;
}

/**
 * Signs a JWT session token with 7-day expiration.
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    email: user.email,
    displayName: user.displayName,
  })
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
    };
  } catch {
    return null;
  }
}

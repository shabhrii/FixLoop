import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { createSessionToken } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { z } from "zod";
import { checkRateLimit, extractClientIp } from "@/lib/security/rate-limiter";

const LoginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().optional(),
  bot_field: z.string().max(0, "Automated submission detected").optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting (defense against automated credential stuffing)
    const clientIp = extractClientIp(req);
    const rateResult = checkRateLimit(clientIp, 15, 60);
    if (!rateResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Too many sign-in attempts. Please retry in ${rateResult.resetSeconds} seconds.`,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateResult.resetSeconds.toString(),
          },
        }
      );
    }

    const body = await req.json();
    const { email, bot_field } = LoginSchema.parse(body);

    if (bot_field && bot_field.length > 0) {
      return NextResponse.json(
        { error: { code: "SPAM_DETECTED", message: "Automated submission rejected" } },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            tenant: {
              select: { id: true, name: true, slug: true, isActive: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or credentials" } },
        { status: 401 }
      );
    }

    const activeMembership = user.memberships.find((m) => m.tenant.isActive);

    const sessionUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      tenantId: activeMembership?.tenantId,
      role: activeMembership?.role,
      tenantName: activeMembership?.tenant.name,
      tenantSlug: activeMembership?.tenant.slug,
    };

    const token = await createSessionToken(sessionUser, activeMembership ? {
      id: activeMembership.id,
      tenantId: activeMembership.tenantId,
      role: activeMembership.role,
      tenantName: activeMembership.tenant.name,
      tenantSlug: activeMembership.tenant.slug,
    } : undefined);

    const response = NextResponse.json({
      user: sessionUser,
      memberships: user.memberships
        .filter((m) => m.tenant.isActive)
        .map((m) => ({
          id: m.id,
          tenantId: m.tenantId,
          role: m.role,
          tenantName: m.tenant.name,
          tenantSlug: m.tenant.slug,
        })),
    });

    // Set secure HttpOnly cookie
    response.cookies.set("fixloop_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

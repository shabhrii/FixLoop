import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { createSessionToken } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/handler";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = LoginSchema.parse(body);

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

    const sessionUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };

    const token = await createSessionToken(sessionUser);

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

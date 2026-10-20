import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser(req);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
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
}

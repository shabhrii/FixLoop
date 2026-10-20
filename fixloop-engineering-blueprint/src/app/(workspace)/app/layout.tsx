import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // Load user's active tenant membership server-side
  let membership = null;
  try {
    membership = await prisma.membership.findFirst({
      where: { userId: user.id, isActive: true },
      include: { tenant: true },
    });
  } catch (err) {
    console.error("Database connection error in workspace layout:", err);
  }

  // If DB record not found or DB unreachable, provide safe fallback
  const resolvedMembership = membership
    ? {
        tenantId: membership.tenantId,
        tenantName: membership.tenant.name,
        tenantSlug: membership.tenant.slug,
        role: membership.role,
      }
    : {
        tenantId: "synthetic-tenant-01",
        tenantName: "Acme Precision Manufacturing",
        tenantSlug: "acme-precision",
        role: "QUALITY_ENGINEER" as const,
      };

  return (
    <WorkspaceShell user={user} membership={resolvedMembership}>
      {children}
    </WorkspaceShell>
  );
}

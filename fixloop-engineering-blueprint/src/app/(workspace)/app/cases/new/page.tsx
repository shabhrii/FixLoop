import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { CaseIntakeForm } from "@/components/cases/case-intake-form";

export const dynamic = "force-dynamic";

export default async function NewCasePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let sites: Array<{ id: string; name: string; code: string | null }> = [];

  try {
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (membership) {
      sites = await prisma.site.findMany({
        where: { tenantId: membership.tenantId, isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      });
    }
  } catch (err) {
    console.error("Error fetching sites for intake:", err);
  }

  // Fallback demo site if none exists
  if (sites.length === 0) {
    sites = [
      { id: "site-demo-main", name: "Main Machining Plant", code: "PLANT-01" },
    ];
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, isActive: true },
  });

  const tenantId = membership?.tenantId || "synthetic-tenant-01";

  return (
    <div className="py-2">
      <CaseIntakeForm tenantId={tenantId} sites={sites} />
    </div>
  );
}

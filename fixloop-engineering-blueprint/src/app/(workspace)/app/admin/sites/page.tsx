import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Building2, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSitesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, isActive: true },
  });

  if (!membership || membership.role !== "TENANT_ADMIN") {
    redirect("/app");
  }

  const sites = await prisma.site.findMany({
    where: { tenantId: membership.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cases: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17212F] tracking-tight">
            Factory Sites Management
          </h1>
          <p className="text-xs text-[#526173] mt-0.5">
            Configure manufacturing plants, cells, and production locations for this tenant workspace.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#D8E0E9] overflow-hidden shadow-sm">
        <div className="divide-y divide-[#D8E0E9]">
          <div className="grid grid-cols-12 px-6 py-3.5 bg-[#F7F9FC] text-[11px] font-bold uppercase tracking-wider text-[#526173] font-mono border-b border-[#D8E0E9]">
            <div className="col-span-5">Site Name</div>
            <div className="col-span-3">Plant Code</div>
            <div className="col-span-2">Active Cases</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {sites.map((site) => (
            <div
              key={site.id}
              className="grid grid-cols-12 px-6 py-4 items-center text-xs text-[#17212F]"
            >
              <div className="col-span-5 font-semibold text-[#17212F] flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-[#2F5F91] shrink-0" />
                <span>{site.name}</span>
              </div>
              <div className="col-span-3 font-mono text-[#526173]">{site.code || "N/A"}</div>
              <div className="col-span-2 font-mono text-[#2F5F91] font-bold">{site._count.cases} cases</div>
              <div className="col-span-2 text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-medium ${
                    site.isActive
                      ? "bg-emerald-50 text-[#216E4A] border-emerald-200"
                      : "bg-slate-100 text-[#526173] border-slate-200"
                  }`}
                >
                  {site.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {site.isActive ? "Active" : "Archived"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Building2, Plus, CheckCircle2, XCircle } from "lucide-react";

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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Factory Sites Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure manufacturing plants, cells, and production locations for this tenant workspace.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-sm">
        <div className="divide-y divide-slate-800">
          <div className="grid grid-cols-12 px-6 py-3.5 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            <div className="col-span-5">Site Name</div>
            <div className="col-span-3">Plant Code</div>
            <div className="col-span-2">Active Cases</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {sites.map((site) => (
            <div
              key={site.id}
              className="grid grid-cols-12 px-6 py-4 items-center text-xs text-slate-300"
            >
              <div className="col-span-5 font-semibold text-white flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{site.name}</span>
              </div>
              <div className="col-span-3 font-mono text-slate-400">{site.code || "N/A"}</div>
              <div className="col-span-2 font-mono text-blue-400 font-bold">{site._count.cases} cases</div>
              <div className="col-span-2 text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-medium ${
                    site.isActive
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/60"
                      : "bg-slate-800 text-slate-400 border-slate-700"
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

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Users, Shield, CheckCircle2, XCircle } from "lucide-react";
import { TenantRole } from "@/types/auth";

export const dynamic = "force-dynamic";

const ROLE_BADGES: Record<TenantRole, { label: string; bg: string; text: string; border: string }> = {
  TENANT_ADMIN: { label: "Admin", bg: "bg-emerald-950/60", text: "text-emerald-300", border: "border-emerald-700/60" },
  QUALITY_ENGINEER: { label: "Quality Engineer", bg: "bg-purple-950/60", text: "text-purple-300", border: "border-purple-700/60" },
  OPERATOR: { label: "Operator", bg: "bg-amber-950/60", text: "text-amber-300", border: "border-amber-700/60" },
  ACTION_OWNER: { label: "Action Owner", bg: "bg-blue-950/60", text: "text-blue-300", border: "border-blue-700/60" },
  AUDITOR: { label: "Auditor", bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700" },
};

export default async function AdminMembersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, isActive: true },
  });

  if (!membership || membership.role !== "TENANT_ADMIN") {
    redirect("/app");
  }

  const members = await prisma.membership.findMany({
    where: { tenantId: membership.tenantId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, displayName: true, email: true, createdAt: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Team Members & Capability Roles
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role assignments and access capabilities strictly enforced by server-side policies.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-sm">
        <div className="divide-y divide-slate-800">
          <div className="grid grid-cols-12 px-6 py-3.5 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            <div className="col-span-5">Member Name & Email</div>
            <div className="col-span-4">Role & Capabilities</div>
            <div className="col-span-3 text-right">Membership Status</div>
          </div>

          {members.map((m) => {
            const role = ROLE_BADGES[m.role as TenantRole] || ROLE_BADGES.AUDITOR;

            return (
              <div
                key={m.id}
                className="grid grid-cols-12 px-6 py-4 items-center text-xs text-slate-300"
              >
                <div className="col-span-5">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{m.user.displayName || m.user.email}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono pl-6 mt-0.5">
                    {m.user.email}
                  </div>
                </div>

                <div className="col-span-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium ${role.bg} ${role.border} ${role.text}`}
                  >
                    <Shield className="h-3 w-3" />
                    {role.label}
                  </span>
                </div>

                <div className="col-span-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-medium ${
                      m.isActive
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/60"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {m.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {m.isActive ? "Active Member" : "Suspended"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

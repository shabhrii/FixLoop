import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Users, Shield, CheckCircle2, XCircle } from "lucide-react";
import { TenantRole } from "@/types/auth";

export const dynamic = "force-dynamic";

const ROLE_BADGES: Record<TenantRole, { label: string; bg: string; text: string; border: string }> = {
  TENANT_ADMIN: { label: "Admin", bg: "bg-emerald-50", text: "text-[#216E4A]", border: "border-emerald-200" },
  QUALITY_ENGINEER: { label: "Quality Engineer", bg: "bg-[#E7EFF7]", text: "text-[#2F5F91]", border: "border-blue-200" },
  OPERATOR: { label: "Operator", bg: "bg-amber-50", text: "text-[#8A5700]", border: "border-amber-200" },
  ACTION_OWNER: { label: "Action Owner", bg: "bg-sky-50", text: "text-[#245B86]", border: "border-sky-200" },
  AUDITOR: { label: "Auditor", bg: "bg-slate-100", text: "text-[#526173]", border: "border-slate-200" },
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
          <h1 className="text-2xl font-extrabold text-[#17212F] tracking-tight">
            Team Members & Capability Roles
          </h1>
          <p className="text-xs text-[#526173] mt-0.5">
            Role assignments and access capabilities strictly enforced by server-side policies.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#D8E0E9] overflow-hidden shadow-sm">
        <div className="divide-y divide-[#D8E0E9]">
          <div className="grid grid-cols-12 px-6 py-3.5 bg-[#F7F9FC] text-[11px] font-bold uppercase tracking-wider text-[#526173] font-mono border-b border-[#D8E0E9]">
            <div className="col-span-5">Member Name & Email</div>
            <div className="col-span-4">Role & Capabilities</div>
            <div className="col-span-3 text-right">Membership Status</div>
          </div>

          {members.map((m) => {
            const role = ROLE_BADGES[m.role as TenantRole] || ROLE_BADGES.AUDITOR;

            return (
              <div
                key={m.id}
                className="grid grid-cols-12 px-6 py-4 items-center text-xs text-[#17212F]"
              >
                <div className="col-span-5">
                  <div className="font-semibold text-[#17212F] flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{m.user.displayName || m.user.email}</span>
                  </div>
                  <div className="text-[11px] text-[#526173] font-mono pl-6 mt-0.5">
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
                        ? "bg-emerald-50 text-[#216E4A] border-emerald-200"
                        : "bg-slate-100 text-[#526173] border-slate-200"
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

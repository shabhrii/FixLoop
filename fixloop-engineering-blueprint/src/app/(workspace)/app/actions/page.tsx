import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  CheckSquare,
  Clock,
  User,
  ArrowRight,
  FileCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ActionsPageProps {
  searchParams: Promise<{
    status?: string;
    mine?: string;
  }>;
}

export default async function ActionsQueuePage({ searchParams }: ActionsPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;

  let actions: Array<any> = [];

  try {
    const membership = await prisma.membership.findFirst({
      where: { userId: user?.id, isActive: true },
    });

    if (membership) {
      const where: any = {
        tenantId: membership.tenantId,
      };

      if (params.status) {
        where.status = params.status;
      }
      if (params.mine === "true" && user) {
        where.assigneeId = user.id;
      }

      actions = await prisma.action.findMany({
        where,
        orderBy: { dueAt: "asc" },
        include: {
          case: {
            select: { id: true, caseNumber: true, title: true, severity: true },
          },
          assignee: { select: { displayName: true, email: true } },
          completedBy: { select: { displayName: true, email: true } },
          proofLinks: { include: { evidence: true } },
        },
      });
    }
  } catch (err) {
    console.error("Error loading action tasks:", err);
  }

  const STATUS_TABS = [
    { label: "All Tasks", value: "" },
    { label: "My Tasks", value: "", mine: "true" },
    { label: "Open", value: "OPEN" },
    { label: "Completed", value: "COMPLETED" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17212F] tracking-tight">
          Corrective Actions & Proof Queue
        </h1>
        <p className="text-xs text-[#526173] mt-0.5">
          Assign, execute, and verify physical containment and root-cause countermeasures before case closure.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#D8E0E9]">
        {STATUS_TABS.map((tab) => {
          const isActive =
            tab.mine === "true"
              ? params.mine === "true"
              : (!params.status && !params.mine && tab.value === "") || params.status === tab.value;

          const href = tab.mine
            ? "/app/actions?mine=true"
            : tab.value
            ? `/app/actions?status=${tab.value}`
            : "/app/actions";

          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#E7EFF7] text-[#2F5F91] border border-[#2F5F91]/20 font-semibold"
                  : "text-[#526173] hover:text-[#17212F] hover:bg-slate-100 font-medium"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Action Cards Grid */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <div className="py-16 text-center text-[#526173] rounded-2xl bg-white border border-[#D8E0E9]">
            <CheckSquare className="h-10 w-10 mx-auto mb-3 text-slate-400" />
            <h3 className="text-sm font-semibold text-[#17212F]">No action tasks found</h3>
            <p className="text-xs text-[#526173] mt-1 max-w-sm mx-auto">
              All assigned actions have been resolved or no tasks match your current filter.
            </p>
          </div>
        ) : (
          actions.map((a) => {
            const isCompleted = a.status === "COMPLETED";
            const isOverdue = !isCompleted && new Date(a.dueAt) < new Date();

            return (
              <div
                key={a.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? "bg-[#F7F9FC] border-[#D8E0E9]"
                    : isOverdue
                    ? "bg-red-50/70 border-red-200 shadow-sm"
                    : "bg-white border-[#D8E0E9] shadow-sm hover:border-[#2F5F91]/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#2F5F91]">
                      {a.case.caseNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold bg-[#E7EFF7] text-[#245B86] border-[#D8E0E9]">
                      {a.actionType}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${
                      isCompleted
                        ? "bg-emerald-50 text-[#216E4A] border-emerald-200"
                        : "bg-slate-100 text-[#17212F] border-slate-200"
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Clock className={`h-3.5 w-3.5 ${isOverdue ? "text-[#B42318]" : "text-slate-400"}`} />
                    <span suppressHydrationWarning className={isOverdue ? "text-[#B42318] font-bold" : "text-[#526173]"}>
                      Due {new Date(a.dueAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-[#17212F] mb-1">
                  {a.description}
                </h3>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D8E0E9] mt-3 text-xs text-[#526173]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{a.assignee.displayName || a.assignee.email}</span>
                    </div>
                    {a.proofLinks.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#216E4A] font-semibold">
                        <FileCheck className="h-3 w-3" /> Proof attached
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {!isCompleted && (
                      <Link
                        href={`/app/cases/${a.case.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#E7EFF7] hover:bg-blue-100 text-[#2F5F91] border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        Complete Task &amp; Attach Proof
                      </Link>
                    )}
                    <Link
                      href={`/app/cases/${a.case.id}`}
                      className="text-xs font-semibold text-[#526173] hover:text-[#17212F] flex items-center gap-1"
                    >
                      Case Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

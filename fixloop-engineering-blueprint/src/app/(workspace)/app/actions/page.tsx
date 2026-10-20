import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  CheckSquare,
  Clock,
  User,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Corrective Actions & Proof Queue
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Assign, execute, and verify physical containment and root-cause countermeasures before case closure.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
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
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cyan-600/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
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
          <div className="py-16 text-center text-slate-500 rounded-2xl bg-slate-900/40 border border-slate-800">
            <CheckSquare className="h-10 w-10 mx-auto mb-3 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-300">No action tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
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
                    ? "bg-slate-950/40 border-slate-800"
                    : isOverdue
                    ? "bg-red-950/15 border-red-800/60 shadow-lg shadow-red-500/5"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {a.case.caseNumber}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold bg-cyan-950/60 text-cyan-300 border-cyan-700/60">
                      {a.actionType}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${
                      isCompleted
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/60"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Clock className={`h-3.5 w-3.5 ${isOverdue ? "text-red-400" : "text-slate-500"}`} />
                    <span className={isOverdue ? "text-red-400 font-bold" : "text-slate-400"}>
                      Due {new Date(a.dueAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mb-1">
                  {a.description}
                </h3>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 mt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>{a.assignee.displayName || a.assignee.email}</span>
                    </div>
                    {a.proofLinks.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <FileCheck className="h-3 w-3" /> Proof attached
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/app/cases/${a.case.id}`}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Open Case Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

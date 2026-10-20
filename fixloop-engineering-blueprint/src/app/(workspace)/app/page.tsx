import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  AlertOctagon,
  CheckSquare,
  ShieldCheck,
  TrendingDown,
  Clock,
  Plus,
  ArrowRight,
  Flame,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();

  // Load tenant metrics safely
  let openCasesCount = 0;
  let criticalCount = 0;
  let investigatingCount = 0;
  let pendingActionsCount = 0;
  let pendingVerificationCount = 0;
  let closedCasesCount = 0;
  let recentCases: Array<any> = [];

  try {
    const membership = await prisma.membership.findFirst({
      where: { userId: user?.id, isActive: true },
    });

    if (membership) {
      const tenantId = membership.tenantId;

      [
        openCasesCount,
        criticalCount,
        investigatingCount,
        pendingActionsCount,
        pendingVerificationCount,
        closedCasesCount,
        recentCases,
      ] = await Promise.all([
        prisma.qualityCase.count({
          where: { tenantId, status: { notIn: ["CLOSED", "CANCELLED"] } },
        }),
        prisma.qualityCase.count({
          where: { tenantId, severity: "CRITICAL", status: { notIn: ["CLOSED", "CANCELLED"] } },
        }),
        prisma.qualityCase.count({
          where: { tenantId, status: "INVESTIGATING" },
        }),
        prisma.action.count({
          where: { tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } },
        }),
        prisma.qualityCase.count({
          where: { tenantId, status: "VERIFICATION_PENDING" },
        }),
        prisma.qualityCase.count({
          where: { tenantId, status: "CLOSED" },
        }),
        prisma.qualityCase.findMany({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            site: { select: { name: true } },
            reportedBy: { select: { displayName: true, email: true } },
          },
        }),
      ]);
    }
  } catch (err) {
    console.error("Dashboard metric fetch error:", err);
  }

  const SEVERITY_BADGES: Record<string, { label: string; bg: string; icon: any }> = {
    CRITICAL: { label: "Critical", bg: "bg-red-500/15 text-red-400 border-red-500/30", icon: Flame },
    HIGH: { label: "High", bg: "bg-orange-500/15 text-orange-400 border-orange-500/30", icon: AlertTriangle },
    MEDIUM: { label: "Medium", bg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: Info },
    LOW: { label: "Low", bg: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: CheckCircle2 },
  };

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Draft", color: "bg-slate-800 text-slate-300 border-slate-700" },
    SUBMITTED: { label: "Submitted", color: "bg-blue-900/40 text-blue-300 border-blue-700" },
    TRIAGE: { label: "Triage", color: "bg-amber-900/40 text-amber-300 border-amber-700" },
    INVESTIGATING: { label: "5-Why Investigating", color: "bg-purple-900/40 text-purple-300 border-purple-700" },
    ACTION_IN_PROGRESS: { label: "Action in Progress", color: "bg-cyan-900/40 text-cyan-300 border-cyan-700" },
    VERIFICATION_PENDING: { label: "Verification Pending", color: "bg-indigo-900/40 text-indigo-300 border-indigo-700" },
    CLOSED: { label: "Closed & Verified", color: "bg-emerald-900/40 text-emerald-300 border-emerald-700" },
    REOPENED: { label: "Reopened", color: "bg-rose-900/40 text-rose-300 border-rose-700" },
    CANCELLED: { label: "Cancelled", color: "bg-slate-800 text-slate-400 border-slate-700" },
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Operational Quality Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time shop-floor defect containment, active root-cause investigations, and verification gates.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/app/cases/new"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Report New Nonconformance
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Cases */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Cases</span>
            <AlertOctagon className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{openCasesCount}</span>
            <span className="text-xs text-slate-400">nonconformances</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>{investigatingCount} in 5-Why root cause analysis</span>
          </div>
        </div>

        {/* Critical Nonconformances */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Critical Severity</span>
            <Flame className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-400 tracking-tight">{criticalCount}</span>
            <span className="text-xs text-red-300/80">containment required</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Immediate line quarantine enforced
          </div>
        </div>

        {/* Pending Actions */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Actions In Flight</span>
            <CheckSquare className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{pendingActionsCount}</span>
            <span className="text-xs text-slate-400">open tasks</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Awaiting owner proof uploads
          </div>
        </div>

        {/* Verification Pending & Closed */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Verified Closed</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">{closedCasesCount}</span>
            <span className="text-xs text-slate-400">proven fixes</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span className="font-semibold text-yellow-400">{pendingVerificationCount}</span> awaiting QE audit
          </div>
        </div>
      </div>

      {/* Quick Launch & Workflows Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/app/cases"
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 hover:border-blue-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="mt-4 text-base font-bold text-white">Quality Cases Queue</h2>
          <p className="mt-1 text-xs text-slate-400">
            Filter, triage, and investigate shop-floor defect reports through structured state transitions.
          </p>
        </Link>

        <Link
          href="/app/actions"
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CheckSquare className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="mt-4 text-base font-bold text-white">Corrective Actions</h2>
          <p className="mt-1 text-xs text-slate-400">
            Assign containment and corrective tasks. Upload proof artifacts before marking complete.
          </p>
        </Link>

        <Link
          href="/app/library"
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="mt-4 text-base font-bold text-white">Closed Knowledge Base</h2>
          <p className="mt-1 text-xs text-slate-400">
            Search verified historical root causes and solutions across part numbers and operations.
          </p>
        </Link>
      </div>

      {/* Recent Cases Stream */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white">Recent Quality Cases</h2>
            <p className="text-xs text-slate-400">Latest nonconformances logged across active factory sites</p>
          </div>
          <Link
            href="/app/cases"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All Cases
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentCases.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <AlertOctagon className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium">No cases found in this workspace yet.</p>
            <Link
              href="/app/cases/new"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Report the first nonconformance
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentCases.map((qc) => {
              const sev = SEVERITY_BADGES[qc.severity] || SEVERITY_BADGES.MEDIUM;
              const SevIcon = sev.icon;
              const status = STATUS_LABELS[qc.status] || { label: qc.status, color: "bg-slate-800 text-slate-300" };

              return (
                <Link
                  key={qc.id}
                  href={`/app/cases/${qc.id}`}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 px-3 -mx-3 rounded-xl transition-colors group"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-400 shrink-0">
                      {qc.caseNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {qc.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{qc.site?.name}</span>
                        <span>•</span>
                        <span>Part: {qc.partNumber || "N/A"}</span>
                        <span>•</span>
                        <span>Reported by {qc.reportedBy?.displayName || qc.reportedBy?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium font-mono ${sev.bg}`}>
                      <SevIcon className="h-3 w-3" />
                      {sev.label}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium font-mono ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

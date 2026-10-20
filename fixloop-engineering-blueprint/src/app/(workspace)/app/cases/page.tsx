import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import {
  AlertOctagon,
  Plus,
  Search,
  Filter,
  Flame,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
} from "lucide-react";
import { CaseStatus, Severity } from "@prisma/client";

export const dynamic = "force-dynamic";

interface CasesPageProps {
  searchParams: Promise<{
    status?: string;
    severity?: string;
    query?: string;
  }>;
}

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; bg: string; icon: any; border: string; text: string }
> = {
  CRITICAL: {
    label: "Critical",
    bg: "bg-red-950/60",
    border: "border-red-700/60",
    text: "text-red-400",
    icon: Flame,
  },
  HIGH: {
    label: "High",
    bg: "bg-orange-950/60",
    border: "border-orange-700/60",
    text: "text-orange-400",
    icon: AlertTriangle,
  },
  MEDIUM: {
    label: "Medium",
    bg: "bg-yellow-950/60",
    border: "border-yellow-700/60",
    text: "text-yellow-400",
    icon: Info,
  },
  LOW: {
    label: "Low",
    bg: "bg-blue-950/60",
    border: "border-blue-700/60",
    text: "text-blue-400",
    icon: CheckCircle2,
  },
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;

  const statusFilter = params.status as CaseStatus | undefined;
  const severityFilter = params.severity as Severity | undefined;
  const search = params.query;

  let cases: Array<any> = [];

  try {
    const membership = await prisma.membership.findFirst({
      where: { userId: user?.id, isActive: true },
    });

    if (membership) {
      const where: any = {
        tenantId: membership.tenantId,
      };

      if (statusFilter) where.status = statusFilter;
      if (severityFilter) where.severity = severityFilter;
      if (search) {
        where.OR = [
          { caseNumber: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
          { partNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      cases = await prisma.qualityCase.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          site: { select: { name: true, code: true } },
          reportedBy: { select: { displayName: true, email: true } },
          _count: {
            select: {
              evidence: true,
              actions: true,
              findings: true,
            },
          },
        },
      });
    }
  } catch (err) {
    console.error("Error loading cases:", err);
  }

  const STATUS_TABS = [
    { label: "All Cases", value: "" },
    { label: "Submitted", value: "SUBMITTED" },
    { label: "Investigating", value: "INVESTIGATING" },
    { label: "Action in Progress", value: "ACTION_IN_PROGRESS" },
    { label: "Verification Pending", value: "VERIFICATION_PENDING" },
    { label: "Closed", value: "CLOSED" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Quality Nonconformance Queue
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time shop-floor defect logs, active 5-Why root cause investigations, and verification gates.
          </p>
        </div>

        <Link
          href="/app/cases/new"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Report Nonconformance
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {STATUS_TABS.map((tab) => {
          const isActive = (!statusFilter && tab.value === "") || statusFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/app/cases?status=${tab.value}` : "/app/cases"}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Cases Table / Cards */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm overflow-hidden">
        {cases.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <AlertOctagon className="h-10 w-10 mx-auto mb-3 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-300">No cases match selected filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your status filters or report a new defect from the intake form.
            </p>
            <Link
              href="/app/cases/new"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" /> Report Nonconformance
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 px-6 py-3.5 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              <div className="col-span-2">Case #</div>
              <div className="col-span-4">Title & Context</div>
              <div className="col-span-2">Site / Machine</div>
              <div className="col-span-2">Severity</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Rows */}
            {cases.map((qc) => {
              const sev = SEVERITY_CONFIG[qc.severity as Severity] || SEVERITY_CONFIG.MEDIUM;
              const SevIcon = sev.icon;
              const date = new Date(qc.createdAt);

              return (
                <Link
                  key={qc.id}
                  href={`/app/cases/${qc.id}`}
                  className="block lg:grid lg:grid-cols-12 px-6 py-4 hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Case # and Date */}
                  <div className="lg:col-span-2 flex items-center justify-between lg:block mb-2 lg:mb-0">
                    <span className="font-mono text-xs font-bold text-blue-400 group-hover:text-blue-300">
                      {qc.caseNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono mt-0.5">
                      {date.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title & Stats */}
                  <div className="lg:col-span-4 pr-4 mb-2 lg:mb-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {qc.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span>Part: {qc.partNumber || "N/A"}</span>
                      <span>•</span>
                      <span>{qc._count?.findings || 0} findings</span>
                      <span>•</span>
                      <span>{qc._count?.actions || 0} actions</span>
                      <span>•</span>
                      <span>{qc._count?.evidence || 0} files</span>
                    </div>
                  </div>

                  {/* Site & Cell */}
                  <div className="lg:col-span-2 text-xs text-slate-300 mb-2 lg:mb-0">
                    <div className="font-medium">{qc.site?.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {qc.machineId || "Line General"}
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="lg:col-span-2 mb-2 lg:mb-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium font-mono ${sev.bg} ${sev.border} ${sev.text}`}
                    >
                      <SevIcon className="h-3 w-3" />
                      {sev.label}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="lg:col-span-2 flex items-center justify-between lg:justify-end">
                    <CaseStatusBadge status={qc.status} size="sm" />
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

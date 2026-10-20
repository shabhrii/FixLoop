import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import {
  AlertOctagon,
  Plus,
  Flame,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
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
  { label: string; style: React.CSSProperties; icon: any }
> = {
  CRITICAL: {
    label: "Critical",
    style: { backgroundColor: "#FEF2F2", color: "#B42318", borderColor: "#DC2626" },
    icon: Flame,
  },
  HIGH: {
    label: "High",
    style: { backgroundColor: "#FFF7ED", color: "#C2570B", borderColor: "#EA580C" },
    icon: AlertTriangle,
  },
  MEDIUM: {
    label: "Medium",
    style: { backgroundColor: "#FEFCE8", color: "#8A5700", borderColor: "#CA8A04" },
    icon: Info,
  },
  LOW: {
    label: "Low",
    style: { backgroundColor: "#E7EFF7", color: "#245B86", borderColor: "#3E74A8" },
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
    { label: "Triage", value: "TRIAGE" },
    { label: "Investigating", value: "INVESTIGATING" },
    { label: "Action in Progress", value: "ACTION_IN_PROGRESS" },
    { label: "Verification Pending", value: "VERIFICATION_PENDING" },
    { label: "Closed", value: "CLOSED" },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fl-text)" }}>
            Quality Cases
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--fl-text-muted)" }}>
            Shop-floor defect reports, active 5-Why investigations, and verification queue.
          </p>
        </div>

        <Link
          href="/app/cases/new"
          id="cases-report-new"
          className="fl-btn-primary rounded-lg px-4 py-2.5 text-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Report nonconformance
        </Link>
      </div>

      {/* Status filter tabs */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1"
        style={{ borderBottom: "1px solid var(--fl-border)" }}
        role="tablist"
        aria-label="Filter by case status"
      >
        {STATUS_TABS.map((tab) => {
          const isActive = (!statusFilter && tab.value === "") || statusFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/app/cases?status=${tab.value}` : "/app/cases"}
              role="tab"
              aria-selected={isActive}
              className="px-3.5 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors"
              style={{
                backgroundColor: isActive ? "var(--fl-blue-100)" : "transparent",
                color: isActive ? "var(--fl-blue-900)" : "var(--fl-text-muted)",
                borderBottom: isActive ? "2px solid var(--fl-blue-700)" : "2px solid transparent",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Cases table / cards */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--fl-surface)",
          border: "1px solid var(--fl-border)",
        }}
      >
        {cases.length === 0 ? (
          <div className="py-16 text-center">
            <AlertOctagon className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--fl-border)" }} aria-hidden="true" />
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--fl-text)" }}>
              No cases match selected filters
            </h3>
            <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--fl-text-muted)" }}>
              Try adjusting your status filters or report a new defect from the intake form.
            </p>
            <Link
              href="/app/cases/new"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              style={{
                backgroundColor: "var(--fl-blue-050)",
                color: "var(--fl-blue-700)",
                border: "1px solid var(--fl-blue-100)",
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Report nonconformance
            </Link>
          </div>
        ) : (
          <div>
            {/* Desktop table header */}
            <div
              className="hidden lg:grid grid-cols-12 px-6 py-3 text-[11px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--fl-surface-muted)",
                borderBottom: "1px solid var(--fl-border)",
                color: "var(--fl-text-muted)",
              }}
            >
              <div className="col-span-2">Case #</div>
              <div className="col-span-4">Title &amp; Context</div>
              <div className="col-span-2">Site / Machine</div>
              <div className="col-span-2">Severity</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Rows */}
            {cases.map((qc, index) => {
              const sev = SEVERITY_CONFIG[qc.severity as Severity] || SEVERITY_CONFIG.MEDIUM;
              const SevIcon = sev.icon;
              const date = new Date(qc.createdAt);

              return (
                <Link
                  key={qc.id}
                  href={`/app/cases/${qc.id}`}
                  className="block lg:grid lg:grid-cols-12 px-6 py-4 transition-colors group hover:bg-[var(--fl-blue-050)]"
                  style={{
                    borderTop: index > 0 ? "1px solid var(--fl-border)" : undefined,
                  }}
                >
                  {/* Case # and date */}
                  <div className="lg:col-span-2 flex items-center justify-between lg:block mb-2 lg:mb-0">
                    <span className="font-mono text-xs font-bold tabular-nums" style={{ color: "var(--fl-blue-700)" }}>
                      {qc.caseNumber}
                    </span>
                    <span
                      className="text-[11px] font-mono block mt-0.5 flex items-center gap-1"
                      style={{ color: "var(--fl-text-muted)" }}
                    >
                      <Calendar className="h-3 w-3 inline" aria-hidden="true" />
                      {date.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title & stats */}
                  <div className="lg:col-span-4 pr-4 mb-2 lg:mb-0">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--fl-text)" }}>
                      {qc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: "var(--fl-text-muted)" }}>
                      <span>Part: {qc.partNumber || "N/A"}</span>
                      <span aria-hidden="true">·</span>
                      <span>{qc._count?.findings || 0} findings</span>
                      <span aria-hidden="true">·</span>
                      <span>{qc._count?.actions || 0} actions</span>
                    </div>
                  </div>

                  {/* Site & cell */}
                  <div className="lg:col-span-2 text-xs mb-2 lg:mb-0">
                    <div className="font-medium" style={{ color: "var(--fl-text)" }}>{qc.site?.name}</div>
                    <div className="font-mono text-[11px] mt-0.5" style={{ color: "var(--fl-text-muted)" }}>
                      {qc.machineId || "General"}
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="lg:col-span-2 mb-2 lg:mb-0">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold font-mono"
                      style={sev.style}
                    >
                      <SevIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {sev.label}
                    </span>
                  </div>

                  {/* Status */}
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

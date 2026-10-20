import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  AlertOctagon,
  CheckSquare,
  ShieldCheck,
  Clock,
  Plus,
  ArrowRight,
  Flame,
  AlertTriangle,
  Info,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();

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

  const SEVERITY_BADGES: Record<string, { label: string; icon: any; style: React.CSSProperties }> = {
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

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--fl-text)" }}>
            Quality Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fl-text-muted)" }}>
            Active cases, open corrective actions, and verification queue for your workspace.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/app/cases/new"
            id="dashboard-report-defect"
            className="fl-btn-primary rounded-lg px-4 py-2.5 text-sm"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Report nonconformance
          </Link>
        </div>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Quality metrics">

        {/* Active cases */}
        <div
          className="p-5 rounded-xl"
          style={{
            backgroundColor: "var(--fl-surface)",
            border: "1px solid var(--fl-border)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fl-text-muted)" }}>
              Active Cases
            </span>
            <AlertOctagon className="h-4 w-4 shrink-0" style={{ color: "var(--fl-blue-700)" }} aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--fl-text)" }}>
              {openCasesCount}
            </span>
            <span className="text-xs" style={{ color: "var(--fl-text-muted)" }}>open</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: "var(--fl-text-muted)" }}>
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{investigatingCount} in 5-Why analysis</span>
          </div>
        </div>

        {/* Critical severity */}
        <div
          className="p-5 rounded-xl"
          style={{
            backgroundColor: criticalCount > 0 ? "#FEF2F2" : "var(--fl-surface)",
            border: `1px solid ${criticalCount > 0 ? "#FECACA" : "var(--fl-border)"}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fl-text-muted)" }}>
              Critical Severity
            </span>
            <Flame className="h-4 w-4 shrink-0" style={{ color: "var(--fl-danger)" }} aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" style={{ color: criticalCount > 0 ? "var(--fl-danger)" : "var(--fl-text)" }}>
              {criticalCount}
            </span>
            <span className="text-xs" style={{ color: "var(--fl-text-muted)" }}>
              {criticalCount > 0 ? "need attention" : "cases"}
            </span>
          </div>
          <div className="mt-2 text-xs" style={{ color: "var(--fl-text-muted)" }}>
            Containment required
          </div>
        </div>

        {/* Actions in flight */}
        <div
          className="p-5 rounded-xl"
          style={{
            backgroundColor: "var(--fl-surface)",
            border: "1px solid var(--fl-border)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fl-text-muted)" }}>
              Actions In Flight
            </span>
            <CheckSquare className="h-4 w-4 shrink-0" style={{ color: "var(--fl-info)" }} aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--fl-text)" }}>
              {pendingActionsCount}
            </span>
            <span className="text-xs" style={{ color: "var(--fl-text-muted)" }}>open tasks</span>
          </div>
          <div className="mt-2 text-xs" style={{ color: "var(--fl-text-muted)" }}>
            Awaiting proof uploads
          </div>
        </div>

        {/* Verified closed */}
        <div
          className="p-5 rounded-xl"
          style={{
            backgroundColor: "var(--fl-surface)",
            border: "1px solid var(--fl-border)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fl-text-muted)" }}>
              Verified Closed
            </span>
            <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: "var(--fl-success)" }} aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--fl-success)" }}>
              {closedCasesCount}
            </span>
            <span className="text-xs" style={{ color: "var(--fl-text-muted)" }}>proven fixes</span>
          </div>
          <div className="mt-2 text-xs" style={{ color: "var(--fl-text-muted)" }}>
            <span style={{ color: "var(--fl-warning)", fontWeight: 600 }}>{pendingVerificationCount}</span>
            {" "}awaiting QE review
          </div>
        </div>
      </div>

      {/* Quick launch cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" role="region" aria-label="Quick actions">
        <Link
          href="/app/cases"
          className="p-6 rounded-xl transition-all group block hover:border-[var(--fl-blue-700)] shadow-sm hover:shadow"
          style={{
            backgroundColor: "var(--fl-surface)",
            border: "1px solid var(--fl-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: "var(--fl-blue-050)" }}>
              <AlertOctagon className="h-5 w-5" style={{ color: "var(--fl-blue-700)" }} aria-hidden="true" />
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: "var(--fl-text-muted)" }} aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold mb-1" style={{ color: "var(--fl-text)" }}>Quality Cases Queue</h2>
          <p className="text-sm" style={{ color: "var(--fl-text-muted)" }}>
            Filter, triage, and investigate shop-floor defect reports through structured state transitions.
          </p>
        </Link>

        <Link
          href="/app/actions"
          className="p-6 rounded-xl transition-all group block hover:border-[var(--fl-blue-700)] shadow-sm hover:shadow"
          style={{
            backgroundColor: "var(--fl-surface)",
            border: "1px solid var(--fl-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: "#ECFDF5" }}>
              <CheckSquare className="h-5 w-5" style={{ color: "var(--fl-success)" }} aria-hidden="true" />
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: "var(--fl-text-muted)" }} aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold mb-1" style={{ color: "var(--fl-text)" }}>Corrective Actions</h2>
          <p className="text-sm" style={{ color: "var(--fl-text-muted)" }}>
            Assign and track corrective tasks. Upload proof artifacts before marking complete.
          </p>
        </Link>

        <Link
          href="/app/library"
          className="p-6 rounded-xl transition-all group block hover:border-[var(--fl-blue-700)] shadow-sm hover:shadow"
          style={{
            backgroundColor: "var(--fl-surface)",
            border: "1px solid var(--fl-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: "var(--fl-blue-050)" }}>
              <BookOpen className="h-5 w-5" style={{ color: "var(--fl-blue-700)" }} aria-hidden="true" />
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: "var(--fl-text-muted)" }} aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold mb-1" style={{ color: "var(--fl-text)" }}>Closed Knowledge Base</h2>
          <p className="text-sm" style={{ color: "var(--fl-text-muted)" }}>
            Search verified historical root causes and solutions across part numbers and operations.
          </p>
        </Link>
      </div>

      {/* Recent cases */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--fl-surface)",
          border: "1px solid var(--fl-border)",
        }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--fl-border)" }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--fl-text)" }}>Recent Quality Cases</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--fl-text-muted)" }}>
              Latest nonconformances across active factory sites
            </p>
          </div>
          <Link
            href="/app/cases"
            className="text-xs font-semibold flex items-center gap-1 transition-colors"
            style={{ color: "var(--fl-blue-700)" }}
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recentCases.length === 0 ? (
          <div className="py-14 text-center">
            <AlertOctagon className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--fl-border)" }} aria-hidden="true" />
            <p className="text-sm font-medium" style={{ color: "var(--fl-text-muted)" }}>
              No cases in this workspace yet.
            </p>
            <Link
              href="/app/cases/new"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "var(--fl-blue-700)" }}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Report the first nonconformance
            </Link>
          </div>
        ) : (
          <div>
            {recentCases.map((qc, index) => {
              const sev = SEVERITY_BADGES[qc.severity] || SEVERITY_BADGES.MEDIUM;
              const SevIcon = sev.icon;

              return (
                <Link
                  key={qc.id}
                  href={`/app/cases/${qc.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 transition-colors group hover:bg-[var(--fl-blue-050)]"
                  style={{
                    borderTop: index > 0 ? "1px solid var(--fl-border)" : undefined,
                  }}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-xs font-bold tabular-nums" style={{ color: "var(--fl-blue-700)" }}>
                      {qc.caseNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: "var(--fl-text)" }}>
                        {qc.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs" style={{ color: "var(--fl-text-muted)" }}>
                        <span>{qc.site?.name}</span>
                        <span aria-hidden="true">·</span>
                        <span>Part: {qc.partNumber || "N/A"}</span>
                        <span aria-hidden="true">·</span>
                        <span>By {qc.reportedBy?.displayName || qc.reportedBy?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold font-mono"
                      style={sev.style}
                    >
                      <SevIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {sev.label}
                    </span>
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

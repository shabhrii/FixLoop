import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { resolveTenantContext } from "@/lib/auth/tenant-context";
import { CaseService } from "@/server/services/case-service";
import prisma from "@/lib/db/prisma";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { FiveWhyEditor } from "@/components/cases/five-why-editor";
import { FindingEditor } from "@/components/cases/finding-editor";
import { AiSuggestionPanel } from "@/components/cases/ai-suggestion-panel";
import { CaseActionsSection } from "@/components/actions/case-actions-section";
import { EvidenceUploader } from "@/components/cases/evidence-uploader";
import { AuditTimeline } from "@/components/cases/audit-timeline";
import { CaseActionBar } from "@/components/cases/case-action-bar";
import { EffectivenessForm } from "@/components/verification/effectiveness-form";
import { CasePipelineStepper } from "@/components/cases/case-pipeline-stepper";
import {
  AlertOctagon,
  ArrowLeft,
  Calendar,
  Layers,
  Wrench,
  Gauge,
  CheckCircle2,
  FileText,
  Clock,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Info,
  Download,
  Plus,
} from "lucide-react";
import { Severity } from "@prisma/client";

export const dynamic = "force-dynamic";

interface CaseDetailPageProps {
  params: Promise<{
    caseId: string;
  }>;
}

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; style: React.CSSProperties; icon: any }
> = {
  CRITICAL: { label: "Critical", style: { backgroundColor: "#FEF2F2", color: "#B42318", borderColor: "#DC2626" }, icon: Flame },
  HIGH:     { label: "High",     style: { backgroundColor: "#FFF7ED", color: "#C2570B", borderColor: "#EA580C" }, icon: AlertTriangle },
  MEDIUM:   { label: "Medium",   style: { backgroundColor: "#FEFCE8", color: "#8A5700", borderColor: "#CA8A04" }, icon: Info },
  LOW:      { label: "Low",      style: { backgroundColor: "#E7EFF7", color: "#245B86", borderColor: "#3E74A8" }, icon: CheckCircle2 },
};

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { caseId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // Fast-path membership resolution
  let membership: any = null;
  if (user.tenantId && user.role && user.tenantName) {
    membership = {
      id: `token-${user.id}`,
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      isActive: true,
      tenant: { name: user.tenantName, slug: user.tenantSlug || "workspace" },
    };
  } else {
    membership = await prisma.membership.findFirst({
      where: { userId: user.id, isActive: true },
      include: { tenant: true },
    });
  }

  if (!membership) redirect("/login");

  const tenantContext = {
    user,
    membership: {
      id: membership.id,
      tenantId: membership.tenantId,
      userId: membership.userId,
      role: membership.role,
      isActive: membership.isActive,
      tenantName: membership.tenant.name,
      tenantSlug: membership.tenant.slug,
    },
    tenantId: membership.tenantId,
    role: membership.role,
  };

  let qc: any = null;
  let tenantMembers: Array<any> = [];

  try {
    const [fetchedCase, members] = await Promise.all([
      CaseService.getCase(tenantContext, caseId),
      prisma.membership.findMany({
        where: { tenantId: membership.tenantId, isActive: true },
        include: { user: { select: { id: true, displayName: true, email: true } } },
      }),
    ]);
    qc = fetchedCase;
    tenantMembers = members;
  } catch (err) {
    console.error("Error retrieving case:", err);
    notFound();
  }

  const isQE = membership.role === "QUALITY_ENGINEER" || membership.role === "TENANT_ADMIN";
  const isActionOwner = membership.role === "ACTION_OWNER";
  const sev = SEVERITY_CONFIG[qc.severity as Severity] || SEVERITY_CONFIG.MEDIUM;
  const SevIcon = sev.icon;

  const investigation = qc.investigations[0];
  const whySteps = investigation?.whySteps || [];

  const evidenceOptions = qc.evidence
    .filter((e: any) => e.status === "AVAILABLE")
    .map((e: any) => ({
      id: e.id,
      originalFilename: e.originalFileName || e.originalFilename || "Evidence File",
      caption: e.caption,
    }));

  const memberOptions = tenantMembers.map((m) => ({
    id: m.user.id,
    displayName: m.user.displayName,
    email: m.user.email,
    role: m.role,
  }));

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs" aria-label="Breadcrumb">
        <Link
          href="/app/cases"
          className="flex items-center gap-1 transition-colors"
          style={{ color: "var(--fl-blue-700)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Cases Queue
        </Link>
        <span aria-hidden="true" style={{ color: "var(--fl-text-muted)" }}>/</span>
        <span className="font-mono font-semibold" style={{ color: "var(--fl-text)" }}>{qc.caseNumber}</span>
      </nav>

      {/* Case Header Card */}
      <div
        className="p-6 rounded-xl space-y-4"
        style={{ backgroundColor: "var(--fl-surface)", border: "1px solid var(--fl-border)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-base font-bold tabular-nums" style={{ color: "var(--fl-blue-700)" }}>
              {qc.caseNumber}
            </span>
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--fl-surface-muted)", color: "var(--fl-text-muted)", border: "1px solid var(--fl-border)" }}
            >
              v{qc.version}
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold font-mono"
              style={sev.style}
            >
              <SevIcon className="h-3 w-3" aria-hidden="true" />
              {sev.label}
            </span>
            <CaseStatusBadge status={qc.status} size="sm" />
          </div>

          <div suppressHydrationWarning className="text-xs font-mono flex items-center gap-1" style={{ color: "var(--fl-text-muted)" }}>
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Reported {new Date(qc.createdAt).toLocaleDateString()}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: "var(--fl-text)" }}>
          {qc.title}
        </h1>

        <p className="text-sm leading-relaxed max-w-4xl" style={{ color: "var(--fl-text-muted)" }}>
          {qc.description}
        </p>

        {/* Manufacturing Metadata Bar */}
        <div
          className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs"
          style={{ borderTop: "1px solid var(--fl-border)" }}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--fl-text-muted)" }}>Site / Facility</span>
            <span className="font-semibold mt-0.5 block" style={{ color: "var(--fl-text)" }}>{qc.site?.name}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--fl-text-muted)" }}>Part Number</span>
            <span className="font-semibold font-mono mt-0.5 block tabular-nums" style={{ color: "var(--fl-text)" }}>{qc.partNumber || "N/A"}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--fl-text-muted)" }}>Machine / Cell</span>
            <span className="font-semibold font-mono mt-0.5 block" style={{ color: "var(--fl-text)" }}>{qc.machineId || "N/A"}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--fl-text-muted)" }}>Reported By</span>
            <span className="font-semibold mt-0.5 block" style={{ color: "var(--fl-text)" }}>
              {qc.reportedBy?.displayName || qc.reportedBy?.email}
            </span>
          </div>
        </div>

        {/* Tolerance Deviation Bar if present */}
        {(qc.observedValue != null || qc.specification) && (
          <div
            className="p-3.5 rounded-lg flex flex-wrap items-center gap-6 text-xs font-mono"
            style={{ backgroundColor: "var(--fl-surface-muted)", border: "1px solid var(--fl-border)" }}
          >
            <div>
              <span style={{ color: "var(--fl-text-muted)" }}>Observed:</span>{" "}
              <strong style={{ color: "var(--fl-danger)" }}>{qc.observedValue != null ? String(qc.observedValue) : ""} {qc.unit}</strong>
            </div>
            <div>
              <span style={{ color: "var(--fl-text-muted)" }}>Specification:</span>{" "}
              <strong style={{ color: "var(--fl-text)" }}>{qc.specification}</strong>
            </div>
            {qc.quantityInspected != null && (
              <div>
                <span style={{ color: "var(--fl-text-muted)" }}>Defect Ratio:</span>{" "}
                <strong style={{ color: "var(--fl-warning)" }}>
                  {qc.quantityAffected} / {qc.quantityInspected} units
                </strong>
              </div>
            )}
          </div>
        )}

        {/* State Action Bar (Triage / Close / Export) */}
        <div className="pt-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--fl-border)" }}>
          <CaseActionBar
            tenantId={membership.tenantId}
            caseId={qc.id}
            caseVersion={qc.version}
            currentStatus={qc.status}
            isQualityEngineer={isQE}
            actions={qc.actions}
            findings={qc.findings}
            latestEffectiveness={qc.effectivenessChecks[0] || null}
          />
        </div>
      </div>

      {/* Visual Workflow Pipeline Stepper */}
      <CasePipelineStepper
        status={qc.status}
        hasConfirmedFinding={qc.findings.some((f: any) => f.kind === "CONFIRMED")}
        actionsCount={qc.actions.length}
        completedActionsCount={qc.actions.filter((a: any) => a.status === "COMPLETED").length}
        hasEffectivenessPass={qc.effectivenessChecks.some((e: any) => e.outcome === "EFFECTIVE")}
        userRole={membership.role}
      />

      {/* Main Investigation & Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: 5-Why & Findings & Actions (2 cols on large) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 5-Why Root Cause Editor */}
          <FiveWhyEditor
            tenantId={membership.tenantId}
            caseId={qc.id}
            initialSteps={whySteps}
            availableEvidence={evidenceOptions}
            canEdit={isQE || qc.status === "INVESTIGATING"}
          />

          {/* Root Cause Findings */}
          <FindingEditor
            tenantId={membership.tenantId}
            caseId={qc.id}
            findings={qc.findings}
            availableEvidence={evidenceOptions}
            isQualityEngineer={isQE}
          />

          {/* AI Diagnostic Assistant */}
          <AiSuggestionPanel
            tenantId={membership.tenantId}
            caseId={qc.id}
            suggestions={qc.aiSuggestions}
            canRequest={isQE}
          />

          {/* Corrective Actions Section with Task Assignment */}
          <CaseActionsSection
            tenantId={membership.tenantId}
            caseId={qc.id}
            actions={qc.actions}
            availableEvidence={evidenceOptions}
            assignees={memberOptions}
            isQualityEngineer={isQE}
            isActionOwner={isActionOwner}
            currentUserId={user.id}
          />

          {/* Verification & Effectiveness Section */}
          <div className="space-y-4">
            {isQE && (
              <EffectivenessForm
                tenantId={membership.tenantId}
                caseId={qc.id}
                availableEvidence={evidenceOptions}
                isPendingVerification={qc.status === "VERIFICATION_PENDING"}
              />
            )}

            {qc.effectivenessChecks.length > 0 && (
              <div
                className="p-6 rounded-xl space-y-3"
                style={{ backgroundColor: "var(--fl-surface)", border: "1px solid var(--fl-border)" }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "var(--fl-text)" }}>
                  Effectiveness Verification History ({qc.effectivenessChecks.length})
                </h3>
                <div className="space-y-2.5">
                  {qc.effectivenessChecks.map((v: any) => {
                    const outcomeStyle: React.CSSProperties =
                      v.outcome === "EFFECTIVE"
                        ? { backgroundColor: "#DCFCE7", color: "#216E4A", borderColor: "#16A34A" }
                        : v.outcome === "NOT_EFFECTIVE"
                        ? { backgroundColor: "#FEF2F2", color: "#B42318", borderColor: "#DC2626" }
                        : { backgroundColor: "#FEFCE8", color: "#8A5700", borderColor: "#CA8A04" };
                    return (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-lg text-xs space-y-1"
                        style={{ backgroundColor: "var(--fl-surface-muted)", border: "1px solid var(--fl-border)" }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold"
                            style={outcomeStyle}
                          >
                            {v.outcome}
                          </span>
                          <span suppressHydrationWarning className="text-[11px] font-mono tabular-nums" style={{ color: "var(--fl-text-muted)" }}>
                            {new Date(v.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-semibold mt-1" style={{ color: "var(--fl-text)" }}>{v.criterion}</div>
                        <div className="text-[11px] font-mono" style={{ color: "var(--fl-text-muted)" }}>
                          Sample Size: {v.sampleSize} · Failures: {v.outOfToleranceCount} · Auditor: {v.reviewer.displayName || v.reviewer.email}
                        </div>
                        {(v.reviewerComment || v.notes) && (
                          <p className="italic mt-1" style={{ color: "var(--fl-text-muted)" }}>
                            &quot;{v.reviewerComment || v.notes}&quot;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Evidence Gallery & Audit Timeline (1 col on large) */}
        <div className="space-y-8">
          {/* Evidence Uploader */}
          <EvidenceUploader
            tenantId={membership.tenantId}
            caseId={qc.id}
          />

          {/* Evidence Files List */}
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: "var(--fl-surface)", border: "1px solid var(--fl-border)" }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--fl-text)" }}>
              Captured Evidence ({qc.evidence.length})
            </h3>
            {qc.evidence.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: "var(--fl-text-muted)" }}>No files uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {qc.evidence.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg flex items-center justify-between text-xs"
                    style={{ backgroundColor: "var(--fl-surface-muted)", border: "1px solid var(--fl-border)" }}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold truncate" style={{ color: "var(--fl-text)" }}>
                        {ev.originalFileName || ev.originalFilename || "Evidence File"}
                      </div>
                      <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--fl-text-muted)" }}>
                        {ev.evidenceType} · {(Number(ev.byteSize || 0) / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <a
                      href={`/api/v1/tenants/${membership.tenantId}/evidence/${ev.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg transition-colors shrink-0"
                      style={{ color: "var(--fl-text-muted)" }}
                      title="Download file"
                      aria-label={`Download ${ev.originalFileName || ev.originalFilename || "Evidence"}`}
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Timeline */}
          <AuditTimeline
            tenantId={membership.tenantId}
            caseId={qc.id}
          />
        </div>
      </div>
    </div>
  );
}

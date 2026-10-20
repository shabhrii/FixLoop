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
import { ActionCard } from "@/components/actions/action-card";
import { ActionEditor } from "@/components/actions/action-editor";
import { EvidenceUploader } from "@/components/cases/evidence-uploader";
import { AuditTimeline } from "@/components/cases/audit-timeline";
import { CaseActionBar } from "@/components/cases/case-action-bar";
import { EffectivenessForm } from "@/components/verification/effectiveness-form";
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
  { label: string; bg: string; icon: any; border: string; text: string }
> = {
  CRITICAL: { label: "Critical", bg: "bg-red-950/60", border: "border-red-700/60", text: "text-red-400", icon: Flame },
  HIGH: { label: "High", bg: "bg-orange-950/60", border: "border-orange-700/60", text: "text-orange-400", icon: AlertTriangle },
  MEDIUM: { label: "Medium", bg: "bg-yellow-950/60", border: "border-yellow-700/60", text: "text-yellow-400", icon: Info },
  LOW: { label: "Low", bg: "bg-blue-950/60", border: "border-blue-700/60", text: "text-blue-400", icon: CheckCircle2 },
};

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { caseId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, isActive: true },
    include: { tenant: true },
  });

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
    qc = await CaseService.getCase(tenantContext, caseId);
    tenantMembers = await prisma.membership.findMany({
      where: { tenantId: membership.tenantId, isActive: true },
      include: { user: { select: { id: true, displayName: true, email: true } } },
    });
  } catch (err) {
    console.error("Error retrieving case:", err);
    notFound();
  }

  const isQE = membership.role === "QUALITY_ENGINEER" || membership.role === "TENANT_ADMIN";
  const sev = SEVERITY_CONFIG[qc.severity as Severity] || SEVERITY_CONFIG.MEDIUM;
  const SevIcon = sev.icon;

  const investigation = qc.investigations[0];
  const whySteps = investigation?.whySteps || [];

  const evidenceOptions = qc.evidence
    .filter((e: any) => e.status === "AVAILABLE")
    .map((e: any) => ({
      id: e.id,
      originalFilename: e.originalFilename,
      caption: e.caption,
    }));

  const memberOptions = tenantMembers.map((m) => ({
    id: m.user.id,
    displayName: m.user.displayName,
    email: m.user.email,
  }));

  return (
    <div className="space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link
          href="/app/cases"
          className="hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cases Queue
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-300 font-semibold">{qc.caseNumber}</span>
      </div>

      {/* Case Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-base font-extrabold text-blue-400">
              {qc.caseNumber}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
              v{qc.version}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium font-mono ${sev.bg} ${sev.border} ${sev.text}`}
            >
              <SevIcon className="h-3 w-3" />
              {sev.label}
            </span>
            <CaseStatusBadge status={qc.status} size="sm" />
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Reported {new Date(qc.createdAt).toLocaleDateString()}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {qc.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          {qc.description}
        </p>

        {/* Manufacturing Metadata Bar */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">
              Site / Facility
            </span>
            <span className="font-semibold text-white mt-0.5 block">{qc.site?.name}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">
              Part Number
            </span>
            <span className="font-semibold text-white mt-0.5 block font-mono">{qc.partNumber || "N/A"}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">
              Machine / Cell
            </span>
            <span className="font-semibold text-white mt-0.5 block font-mono">{qc.machineId || "N/A"}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">
              Reported By
            </span>
            <span className="font-semibold text-white mt-0.5 block">
              {qc.reportedBy?.displayName || qc.reportedBy?.email}
            </span>
          </div>
        </div>

        {/* Tolerance Deviation Bar if present */}
        {(qc.observedValue != null || qc.specification) && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-500">Observed:</span>{" "}
              <strong className="text-red-400">{qc.observedValue} {qc.unit}</strong>
            </div>
            <div>
              <span className="text-slate-500">Specification:</span>{" "}
              <strong className="text-slate-200">{qc.specification}</strong>
            </div>
            {qc.quantityInspected != null && (
              <div>
                <span className="text-slate-500">Defect Ratio:</span>{" "}
                <strong className="text-yellow-400">
                  {qc.quantityAffected} / {qc.quantityInspected} units
                </strong>
              </div>
            )}
          </div>
        )}

        {/* State Action Bar (Triage / Close / Export) */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
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

          {/* Corrective Actions Section */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Corrective & Containment Actions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tasks required to isolate the failure and prevent defect recurrence.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {qc.actions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No corrective actions assigned yet.
                </div>
              ) : (
                qc.actions.map((action: any) => (
                  <ActionCard
                    key={action.id}
                    tenantId={membership.tenantId}
                    caseId={qc.id}
                    action={action}
                    availableEvidence={evidenceOptions}
                    isCurrentAssigneeOrQE={isQE || action.assigneeId === user.id}
                  />
                ))
              )}
            </div>
          </div>

          {/* Verification & Effectiveness Section */}
          <div className="space-y-4">
            {isQE && (
              <EffectivenessForm
                tenantId={membership.tenantId}
                caseId={qc.id}
                availableEvidence={evidenceOptions}
              />
            )}

            {qc.effectivenessChecks.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Effectiveness Verification History ({qc.effectivenessChecks.length})
                </h3>
                <div className="space-y-2.5">
                  {qc.effectivenessChecks.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${
                          v.outcome === "EFFECTIVE"
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/60"
                            : v.outcome === "NOT_EFFECTIVE"
                            ? "bg-red-950/60 text-red-300 border-red-700/60"
                            : "bg-yellow-950/60 text-yellow-300 border-yellow-700/60"
                        }`}>
                          {v.outcome}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(v.reviewedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-200 mt-1">{v.criterion}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Sample Size: {v.sampleSize} • Failures: {v.outOfToleranceCount} • Auditor: {v.reviewer.displayName || v.reviewer.email}
                      </div>
                      {v.notes && <p className="text-slate-400 italic mt-1">&quot;{v.notes}&quot;</p>}
                    </div>
                  ))}
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
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Captured Evidence ({qc.evidence.length})
            </h3>
            {qc.evidence.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No files uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {qc.evidence.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-white truncate">{ev.originalFilename}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {ev.evidenceType} • {(ev.fileSizeBytes / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <a
                      href={`/api/v1/tenants/${membership.tenantId}/evidence/${ev.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-900 transition-colors shrink-0"
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
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

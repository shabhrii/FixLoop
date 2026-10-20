"use client";

import { useState } from "react";
import { CheckCircle2, Plus, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { FindingKind } from "@prisma/client";

interface FindingEvidenceLink {
  evidence: {
    id: string;
    originalFilename: string;
    caption?: string | null;
  };
}

interface FindingItem {
  id: string;
  statement: string;
  kind: FindingKind;
  confirmedAt?: string | null;
  confirmedBy?: { displayName: string | null; email: string } | null;
  createdBy?: { displayName: string | null; email: string } | null;
  evidenceLinks: FindingEvidenceLink[];
}

interface FindingEditorProps {
  tenantId: string;
  caseId: string;
  findings: FindingItem[];
  availableEvidence: Array<{ id: string; originalFilename: string; caption?: string | null }>;
  isQualityEngineer: boolean;
  onRefresh?: () => void;
}

export function FindingEditor({
  tenantId,
  caseId,
  findings,
  availableEvidence,
  isQualityEngineer,
  onRefresh,
}: FindingEditorProps) {
  // New Finding state
  const [statement, setStatement] = useState("");
  const [kind, setKind] = useState<FindingKind>("FACT");
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Confirmation modal state
  const [confirmingFindingId, setConfirmingFindingId] = useState<string | null>(null);
  const [confirmRationale, setConfirmRationale] = useState("");
  const [confirmEvidenceId, setConfirmEvidenceId] = useState(availableEvidence[0]?.id || "");
  const [isConfirming, setIsConfirming] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) {
      setErrorMessage("Please enter a finding statement.");
      return;
    }

    setIsAdding(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/cases/${caseId}/findings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: statement.trim(),
          kind,
          evidenceIds: selectedEvidenceIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to record finding");

      setStatement("");
      setSelectedEvidenceIds([]);
      setSuccessMessage("Finding successfully recorded.");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create finding");
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmCause = async (findingId: string) => {
    if (!confirmRationale.trim()) {
      setErrorMessage("Confirmation rationale is required to confirm a root cause.");
      return;
    }

    setIsConfirming(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/v1/tenants/${tenantId}/cases/${caseId}/findings/${findingId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rationale: confirmRationale.trim(),
            evidenceId: confirmEvidenceId || undefined,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to confirm root cause");

      setConfirmingFindingId(null);
      setConfirmRationale("");
      setSuccessMessage("Confirmed root cause recorded with human engineer authorization.");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to confirm root cause");
    } finally {
      setIsConfirming(false);
    }
  };

  const KIND_BADGES: Record<FindingKind, { label: string; bg: string; text: string; border: string }> = {
    FACT: { label: "Fact", bg: "bg-[#E7EFF7]", text: "text-[#17212F]", border: "border-[#D8E0E9]" },
    AI_HYPOTHESIS: { label: "AI Hypothesis — Unconfirmed", bg: "bg-sky-50", text: "text-[#2F5F91]", border: "border-sky-200" },
    TESTED: { label: "Tested Hypothesis", bg: "bg-amber-50", text: "text-[#8A5700]", border: "border-amber-200" },
    CONFIRMED: { label: "Confirmed Root Cause", bg: "bg-emerald-50", text: "text-[#216E4A]", border: "border-emerald-300" },
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#D8E0E9] shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E7EFF7] text-[#2F5F91]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17212F] tracking-tight">
              Investigation Findings & Root Cause
            </h3>
            <p className="text-xs text-[#526173] mt-0.5">
              Distinguish facts and hypotheses. Only a confirmed root cause satisfies closure gates.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-[#B42318]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#B42318]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-[#216E4A]">
          <Check className="h-4 w-4 shrink-0 text-[#216E4A]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Findings List */}
      <div className="space-y-3">
        {findings.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#526173]">
            No findings recorded yet. Add observations or confirm hypotheses below.
          </div>
        ) : (
          findings.map((f) => {
            const badge = KIND_BADGES[f.kind];
            const isConfirmed = f.kind === "CONFIRMED";

            return (
              <div
                key={f.id}
                className={`p-4 rounded-xl border transition-all ${
                  isConfirmed
                    ? "bg-emerald-50/50 border-emerald-300 shadow-sm"
                    : "bg-[#F7F9FC] border-[#D8E0E9]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium ${badge.bg} ${badge.border} ${badge.text}`}>
                    {badge.label}
                  </span>

                  {isQualityEngineer && !isConfirmed && (
                    <button
                      onClick={() => {
                        setConfirmingFindingId(f.id);
                        setConfirmRationale(`Confirmed through 5-Why analysis and verification of physical evidence.`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#216E4A] text-xs font-semibold border border-emerald-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Confirm as Root Cause
                    </button>
                  )}
                </div>

                <p className="mt-2 text-sm text-[#17212F] leading-relaxed font-medium">
                  {f.statement}
                </p>

                {isConfirmed && f.confirmedBy && (
                  <div className="mt-2 text-xs text-[#216E4A] flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Confirmed by {f.confirmedBy.displayName || f.confirmedBy.email}</span>
                  </div>
                )}

                {f.evidenceLinks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-[#D8E0E9]">
                    {f.evidenceLinks.map((link) => (
                      <span
                        key={link.evidence.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#D8E0E9] text-[10px] text-[#526173] font-mono"
                      >
                        <FileText className="h-3 w-3" />
                        {link.evidence.originalFilename}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Finding Form */}
      <form onSubmit={handleCreateFinding} className="pt-4 border-t border-[#D8E0E9] space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#526173]">
          Record New Observation / Finding
        </h4>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="e.g. Spindle runout measured at 0.035mm exceeded 0.010mm limit"
            disabled={isAdding}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
          />

          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as FindingKind)}
            disabled={isAdding}
            className="w-full sm:w-40 px-3 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91] shrink-0"
          >
            <option value="FACT">FACT</option>
            <option value="AI_HYPOTHESIS">AI HYPOTHESIS</option>
            <option value="TESTED">TESTED</option>
          </select>

          <button
            type="submit"
            disabled={isAdding || !statement.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#2F5F91] hover:bg-[#214B78] disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add Finding
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {confirmingFindingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#D8E0E9] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-[#216E4A]">
              <CheckCircle2 className="h-5 w-5" />
              <h4 className="text-base font-bold text-[#17212F]">Explicit Root Cause Confirmation</h4>
            </div>

            <p className="text-xs text-[#526173]">
              As a Quality Engineer, you are certifying this finding as the confirmed root cause.
              AI cannot confirm causes; human engineering approval is recorded permanently in the audit trail.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
                Engineering Confirmation Rationale *
              </label>
              <textarea
                rows={3}
                value={confirmRationale}
                onChange={(e) => setConfirmRationale(e.target.value)}
                placeholder="State how this root cause was proven via physical evidence and testing..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#216E4A]"
              />
            </div>

            {availableEvidence.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
                  Corroborating Evidence File
                </label>
                <select
                  value={confirmEvidenceId}
                  onChange={(e) => setConfirmEvidenceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#216E4A]"
                >
                  <option value="">None / Existing links</option>
                  {availableEvidence.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.originalFilename} {ev.caption ? `(${ev.caption})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmingFindingId(null)}
                disabled={isConfirming}
                className="px-4 py-2 rounded-xl border border-[#D8E0E9] text-[#526173] hover:text-[#17212F] bg-white hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCause(confirmingFindingId)}
                disabled={isConfirming || !confirmRationale.trim()}
                className="px-5 py-2 rounded-xl bg-[#216E4A] hover:bg-[#1a573a] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                {isConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Confirm Root Cause
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert, Plus, HelpCircle, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
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
    FACT: { label: "Verified Fact", bg: "bg-blue-950/60", text: "text-blue-300", border: "border-blue-700/60" },
    AI_HYPOTHESIS: { label: "AI Hypothesis", bg: "bg-purple-950/60", text: "text-purple-300", border: "border-purple-700/60" },
    TESTED: { label: "Tested Finding", bg: "bg-yellow-950/60", text: "text-yellow-300", border: "border-yellow-700/60" },
    CONFIRMED: { label: "Confirmed Root Cause", bg: "bg-emerald-950/60", text: "text-emerald-300", border: "border-emerald-700/60" },
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Investigation Findings & Root Cause
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distinguish facts and hypotheses. Only a confirmed root cause satisfies closure gates.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center gap-2 text-xs text-emerald-300">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Findings List */}
      <div className="space-y-3">
        {findings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
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
                    ? "bg-emerald-950/30 border-emerald-600/40 shadow-lg shadow-emerald-500/5"
                    : "bg-slate-950/60 border-slate-800"
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
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Confirm as Root Cause
                    </button>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-200 leading-relaxed font-medium">
                  {f.statement}
                </p>

                {isConfirmed && f.confirmedBy && (
                  <div className="mt-2 text-xs text-emerald-400/90 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Confirmed by {f.confirmedBy.displayName || f.confirmedBy.email}</span>
                  </div>
                )}

                {f.evidenceLinks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-900">
                    {f.evidenceLinks.map((link) => (
                      <span
                        key={link.evidence.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono"
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
      <form onSubmit={handleCreateFinding} className="pt-4 border-t border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Record New Observation / Finding
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3">
            <input
              type="text"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="e.g. Spindle runout measured at 0.035mm exceeded 0.010mm limit"
              disabled={isAdding}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as FindingKind)}
              disabled={isAdding}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FACT">FACT</option>
              <option value="AI_HYPOTHESIS">AI HYPOTHESIS</option>
              <option value="TESTED">TESTED</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isAdding || !statement.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add Finding
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {confirmingFindingId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <h4 className="text-base font-bold text-white">Explicit Root Cause Confirmation</h4>
            </div>

            <p className="text-xs text-slate-300">
              As a Quality Engineer, you are certifying this finding as the confirmed root cause.
              AI cannot confirm causes; human engineering approval is recorded permanently in the audit trail.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Engineering Confirmation Rationale *
              </label>
              <textarea
                rows={3}
                value={confirmRationale}
                onChange={(e) => setConfirmRationale(e.target.value)}
                placeholder="State how this root cause was proven via physical evidence and testing..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {availableEvidence.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Corroborating Evidence File
                </label>
                <select
                  value={confirmEvidenceId}
                  onChange={(e) => setConfirmEvidenceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCause(confirmingFindingId)}
                disabled={isConfirming || !confirmRationale.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
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

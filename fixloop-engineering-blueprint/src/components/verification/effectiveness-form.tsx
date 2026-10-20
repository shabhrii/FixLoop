"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, Loader2, ShieldCheck, FileCheck } from "lucide-react";
import { EffectivenessOutcome } from "@prisma/client";

interface EvidenceOption {
  id: string;
  originalFilename: string;
  caption?: string | null;
}

interface EffectivenessFormProps {
  tenantId: string;
  caseId: string;
  availableEvidence: EvidenceOption[];
  onRecorded?: () => void;
}

export function EffectivenessForm({
  tenantId,
  caseId,
  availableEvidence,
  onRecorded,
}: EffectivenessFormProps) {
  const [criterion, setCriterion] = useState("");
  const [sampleSize, setSampleSize] = useState("30");
  const [outOfToleranceCount, setOutOfToleranceCount] = useState("0");
  const [outcome, setOutcome] = useState<EffectivenessOutcome>("EFFECTIVE");
  const [notes, setNotes] = useState("");
  const [evidenceId, setEvidenceId] = useState(availableEvidence[0]?.id || "");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criterion.trim()) {
      setErrorMessage("Please specify the verification criterion.");
      return;
    }

    const n = parseInt(sampleSize, 10);
    const failures = parseInt(outOfToleranceCount, 10);

    if (isNaN(n) || n <= 0) {
      setErrorMessage("Sample size must be a positive integer.");
      return;
    }
    if (isNaN(failures) || failures < 0 || failures > n) {
      setErrorMessage("Out of tolerance count cannot exceed sample size.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(
        `/api/v1/tenants/${tenantId}/cases/${caseId}/effectiveness-checks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            criterion: criterion.trim(),
            sampleSize: n,
            outOfToleranceCount: failures,
            outcome,
            reviewerComment: notes.trim() || undefined,
            evidenceIds: evidenceId ? [evidenceId] : [],
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to record effectiveness check");

      setSuccessMessage("Effectiveness evaluation recorded. Closure guard updated.");
      setCriterion("");
      setNotes("");
      if (onRecorded) onRecorded();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record effectiveness check");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#D8E0E9] shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-[#216E4A]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#17212F] tracking-tight">
            Record Statistical Effectiveness Review
          </h3>
          <p className="text-xs text-[#526173]">
            A case cannot be closed until a human Quality Engineer logs an EFFECTIVE verification check.
          </p>
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
          <CheckCircle className="h-4 w-4 shrink-0 text-[#216E4A]" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
            Verification Criterion *
          </label>
          <input
            type="text"
            value={criterion}
            onChange={(e) => setCriterion(e.target.value)}
            placeholder="e.g. Zero bore runout across next 30 consecutive machined parts"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
              Sample Size *
            </label>
            <input
              type="number"
              min="1"
              value={sampleSize}
              onChange={(e) => setSampleSize(e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
              Out of Tolerance Count *
            </label>
            <input
              type="number"
              min="0"
              value={outOfToleranceCount}
              onChange={(e) => setOutOfToleranceCount(e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
              Determination Outcome *
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as EffectivenessOutcome)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
            >
              <option value="EFFECTIVE">EFFECTIVE (Fix proven successful)</option>
              <option value="NOT_EFFECTIVE">NOT EFFECTIVE (Recurrence observed)</option>
              <option value="INCONCLUSIVE">INCONCLUSIVE (Further data needed)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
            Corroborating Evidence File
          </label>
          <select
            value={evidenceId}
            onChange={(e) => setEvidenceId(e.target.value)}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
          >
            <option value="">None / Note verification</option>
            {availableEvidence.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.originalFilename} {ev.caption ? `(${ev.caption})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
            Engineering Inspection Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Details of measurement equipment, calibration certificate, or operator observations..."
            disabled={isLoading}
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || !criterion.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#216E4A] hover:bg-[#1a573a] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck className="h-3.5 w-3.5" />}
            Record Effectiveness Check
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { CaseStatus, ActionStatus, EffectivenessOutcome, FindingKind } from "@prisma/client";

interface ActionItem {
  id: string;
  isRequired: boolean;
  status: ActionStatus;
  proofLinks: any[];
}

interface FindingItem {
  id: string;
  kind: FindingKind;
}

interface EffectivenessItem {
  id: string;
  outcome: EffectivenessOutcome;
}

interface CloseCaseDialogProps {
  tenantId: string;
  caseId: string;
  caseVersion: number;
  currentStatus: CaseStatus;
  actions: ActionItem[];
  findings: FindingItem[];
  latestEffectiveness: EffectivenessItem | null;
  isQualityEngineer: boolean;
  isOpen: boolean;
  onClose: () => void;
  onClosed?: () => void;
}

export function CloseCaseDialog({
  tenantId,
  caseId,
  caseVersion,
  currentStatus,
  actions,
  findings,
  latestEffectiveness,
  isQualityEngineer,
  isOpen,
  onClose,
  onClosed,
}: CloseCaseDialogProps) {
  const [notes, setNotes] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [liveFindings, setLiveFindings] = useState(findings);
  const [liveActions, setLiveActions] = useState(actions);
  const [liveEffectiveness, setLiveEffectiveness] = useState(latestEffectiveness);
  const [liveVersion, setLiveVersion] = useState(caseVersion);

  // Sync with latest server state when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLiveFindings(findings);
    setLiveActions(actions);
    setLiveEffectiveness(latestEffectiveness);
    setLiveVersion(caseVersion);

    fetch(`/api/v1/tenants/${tenantId}/cases/${caseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          const c = data.data;
          if (c.findings) setLiveFindings(c.findings);
          if (c.actions) setLiveActions(c.actions);
          if (c.effectivenessChecks) {
            setLiveEffectiveness(c.effectivenessChecks[0] || null);
          }
          if (c.version) setLiveVersion(c.version);
        }
      })
      .catch((err) => console.error("Error refreshing case dialog state:", err));
  }, [isOpen, tenantId, caseId, findings, actions, latestEffectiveness, caseVersion]);

  if (!isOpen) return null;

  // Evaluate closure invariants locally for immediate user feedback
  const blockingReasons: string[] = [];

  if (!isQualityEngineer) {
    blockingReasons.push("Only Quality Engineers or Admins have authority to close cases.");
  }

  const hasConfirmedRootCause = liveFindings.some((f) => f.kind === "CONFIRMED");
  if (!hasConfirmedRootCause) {
    blockingReasons.push("Missing confirmed root cause. At least one finding must be explicitly confirmed by an engineer.");
  }

  const incompleteActions = liveActions.filter((a) => a.isRequired && a.status !== "COMPLETED");
  if (incompleteActions.length > 0) {
    blockingReasons.push(`${incompleteActions.length} required action task(s) are not yet marked COMPLETED with proof.`);
  }

  if (!liveEffectiveness) {
    blockingReasons.push("No statistical effectiveness check has been recorded.");
  } else if (liveEffectiveness.outcome !== "EFFECTIVE") {
    blockingReasons.push(`Latest effectiveness check is '${liveEffectiveness.outcome}'. Case closure requires an EFFECTIVE outcome.`);
  }

  const canClose = blockingReasons.length === 0;

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canClose) return;

    setIsClosing(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/cases/${caseId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedVersion: liveVersion,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to close case");

      if (onClosed) onClosed();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Case closure was rejected by the server policy engine");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[#D8E0E9] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8E0E9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#216E4A]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17212F] tracking-tight">
                Case Closure Verification Gate
              </h3>
              <span className="text-[10px] font-mono text-[#526173]">Policy Invariant Enforcer</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-[#17212F] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#B42318] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Blocking reasons if not met */}
        {!canClose ? (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8A5700]">
              <Ban className="h-4 w-4 text-[#8A5700]" />
              Closure Gate Blocked ({blockingReasons.length} Unmet Invariants)
            </div>
            <ul className="space-y-2 text-xs text-[#8A5700] pl-1">
              {blockingReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#8A5700] font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            {!latestEffectiveness && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const el = document.getElementById("section-effectiveness-form");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-[#2F5F91] hover:bg-[#214B78] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                Go to Effectiveness Verification Form &darr;
              </button>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-[#216E4A]">
            <CheckCircle2 className="h-5 w-5 text-[#216E4A] shrink-0" />
            <div>
              <span className="font-bold">All Closure Prerequisites Satisfied</span>
              <p className="text-[11px] text-[#216E4A]/90 mt-0.5">
                Confirmed root cause, completed corrective action proofs, and statistical effectiveness verified.
              </p>
            </div>
          </div>
        )}

        {/* Form when ready */}
        <form onSubmit={handleClose} className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
              Final Engineering Closing Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summary of long-term containment effectiveness and customer/plant sign-off..."
              disabled={!canClose || isClosing}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#216E4A] disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isClosing}
              className="px-4 py-2 rounded-xl border border-[#D8E0E9] text-xs font-semibold text-[#526173] hover:text-[#17212F] bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canClose || isClosing}
              className="px-5 py-2 rounded-xl bg-[#216E4A] hover:bg-[#1a573a] disabled:opacity-40 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              {isClosing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              Close & Lock Quality Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
  Loader2,
  FileQuestion,
  Lightbulb,
} from "lucide-react";

interface AiSuggestionItem {
  id: string;
  status: string;
  suggestionType: string;
  outputJson: any;
  requestedAt: string;
}

interface AiSuggestionPanelProps {
  tenantId: string;
  caseId: string;
  suggestions: AiSuggestionItem[];
  canRequest: boolean;
  onRefresh?: () => void;
}

export function AiSuggestionPanel({
  tenantId,
  caseId,
  suggestions = [],
  canRequest,
  onRefresh,
}: AiSuggestionPanelProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const latest = suggestions[0];
  const output = latest?.outputJson;

  const handleRequest = async () => {
    setIsRequesting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/cases/${caseId}/ai-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionType: "CAUSE_HYPOTHESES" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to generate AI hypotheses");

      setSuccessMessage("AI candidate hypotheses generated. Please review and decide below.");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to request AI analysis");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDecision = async (
    suggestionId: string,
    decision: "ACCEPTED" | "EDITED" | "REJECTED"
  ) => {
    setIsRequesting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/v1/tenants/${tenantId}/cases/${caseId}/ai-suggestions/${suggestionId}/decision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            decisionNote: decisionNote || `Proposal ${decision.toLowerCase()} by engineer.`,
            approvedValues:
              decision === "ACCEPTED" && output?.findings
                ? {
                    acceptedTitle: output.titleSuggestion || undefined,
                    acceptedCategory: output.categorySuggestion || undefined,
                    adoptedFindings: output.findings.map((f: any) => ({
                      statement: f.statement,
                      kind: "AI_HYPOTHESIS" as const,
                    })),
                  }
                : undefined,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to record suggestion decision");

      setSuccessMessage(`Proposal marked ${decision}. Original model outputs preserved.`);
      setDecidingId(null);
      setDecisionNote("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record decision");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6">
      {/* Header & Untrusted Warning */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Diagnostic Assistant
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/50">
                Untrusted Proposal Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates cause hypotheses and diagnostic tests. AI output requires explicit human engineering acceptance.
            </p>
          </div>
        </div>

        {canRequest && (
          <button
            onClick={handleRequest}
            disabled={isRequesting}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            {isRequesting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Synthesizing Hypotheses...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate Root Cause Hypotheses
              </>
            )}
          </button>
        )}
      </div>

      {/* Safety Notice Callout */}
      <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3 text-xs text-purple-200">
        <Shield className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-purple-300">Safety Policy Invariant:</strong> AI outputs are advisory only and cannot confirm causes, approve effectiveness, or close cases. All accepted hypotheses are recorded in the audit trail under human authorization.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center gap-2 text-xs text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Suggestion Content Display */}
      {!latest ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <FileQuestion className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p>No AI hypotheses generated for this case yet.</p>
          <p className="text-[11px] text-slate-600 mt-1">
            Click &quot;Generate Root Cause Hypotheses&quot; to synthesize defect patterns.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <span className="text-xs font-mono text-purple-400 font-semibold">
                Status: {latest.status}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {new Date(latest.requestedAt).toLocaleString()}
              </span>
            </div>

            {/* Summary */}
            {output?.summary && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Summary Analysis
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  {output.summary}
                </p>
              </div>
            )}

            {/* Possible Causes & Tests */}
            {output?.possibleCauses && output.possibleCauses.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                  Proposed Root Causes & Diagnostic Tests
                </h4>
                <div className="space-y-2">
                  {output.possibleCauses.map((cause: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="font-semibold text-white">
                        {idx + 1}. {cause.statement}
                      </div>
                      {cause.testToRun && (
                        <div className="text-[11px] text-cyan-300/90 font-mono">
                          Test: {cause.testToRun}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Candidate Findings */}
            {output?.findings && output.findings.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Candidate Findings
                </h4>
                <div className="space-y-1.5">
                  {output.findings.map((finding: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300 flex items-center justify-between"
                    >
                      <span>{finding.statement}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {finding.kind}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Human Decision Controls */}
            {latest.status === "READY" && (
              <div className="pt-4 border-t border-slate-900 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  onClick={() => handleDecision(latest.id, "REJECTED")}
                  disabled={isRequesting}
                  className="px-4 py-2 rounded-xl border border-red-800/50 hover:bg-red-950/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject Proposal
                </button>

                <button
                  onClick={() => handleDecision(latest.id, "ACCEPTED")}
                  disabled={isRequesting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Accept into Investigation Findings
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

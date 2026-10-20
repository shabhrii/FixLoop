"use client";

import { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
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
      setDecisionNote("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record decision");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#D8E0E9] shadow-sm space-y-6">
      {/* Header & Untrusted Warning */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E7EFF7] text-[#2F5F91]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#17212F] tracking-tight">
                AI Diagnostic Assistant
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E7EFF7] text-[#2F5F91] border border-blue-200">
                Untrusted Proposal Engine
              </span>
            </div>
            <p className="text-xs text-[#526173] mt-0.5">
              Generates cause hypotheses and diagnostic tests. AI output requires explicit human engineering acceptance.
            </p>
          </div>
        </div>

        {canRequest && (
          <button
            onClick={handleRequest}
            disabled={isRequesting}
            className="px-4 py-2.5 rounded-xl bg-[#2F5F91] hover:bg-[#214B78] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
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
      <div className="p-3.5 rounded-xl bg-[#F3F7FB] border border-[#CBD5E1] flex items-start gap-3 text-xs text-[#17212F]">
        <Shield className="h-4 w-4 text-[#2F5F91] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#17212F]">Safety Policy Invariant:</strong> AI outputs are advisory only and cannot confirm causes, approve effectiveness, or close cases. All accepted hypotheses are recorded in the audit trail under human authorization.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-[#B42318]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#B42318]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-[#216E4A]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#216E4A]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Suggestion Content Display */}
      {!latest ? (
        <div className="py-12 text-center text-[#526173] text-xs">
          <FileQuestion className="h-8 w-8 mx-auto mb-2 text-slate-400" />
          <p>No AI hypotheses generated for this case yet.</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Click &quot;Generate Root Cause Hypotheses&quot; to synthesize defect patterns.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#F7F9FC] border border-[#D8E0E9] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E0E9]">
              <span className="text-xs font-mono text-[#2F5F91] font-semibold">
                Status: {latest.status}
              </span>
              <span className="text-[11px] font-mono text-[#526173]">
                {new Date(latest.requestedAt).toLocaleString()}
              </span>
            </div>

            {/* Summary */}
            {output?.summary && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#526173] mb-1">
                  Summary Analysis
                </h4>
                <p className="text-xs text-[#17212F] leading-relaxed bg-white p-3 rounded-xl border border-[#D8E0E9]">
                  {output.summary}
                </p>
              </div>
            )}

            {/* Possible Causes & Tests */}
            {output?.possibleCauses && output.possibleCauses.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#526173] mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  Proposed Root Causes & Diagnostic Tests
                </h4>
                <div className="space-y-2">
                  {output.possibleCauses.map((cause: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-[#D8E0E9] text-xs space-y-1"
                    >
                      <div className="font-semibold text-[#17212F]">
                        {idx + 1}. {cause.statement}
                      </div>
                      {cause.testToRun && (
                        <div className="text-[11px] text-[#245B86] font-mono">
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#526173] mb-2">
                  Candidate Findings
                </h4>
                <div className="space-y-1.5">
                  {output.findings.map((finding: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-[#D8E0E9] text-xs text-[#17212F] flex items-center justify-between"
                    >
                      <span>{finding.statement}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E7EFF7] text-[#2F5F91] border border-blue-200">
                        {finding.kind}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Human Decision Controls */}
            {latest.status === "READY" && (
              <div className="pt-4 border-t border-[#D8E0E9] flex flex-wrap items-center justify-end gap-2.5">
                <button
                  onClick={() => handleDecision(latest.id, "REJECTED")}
                  disabled={isRequesting}
                  className="px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-[#B42318] text-xs font-semibold flex items-center gap-1.5 transition-colors bg-white"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject Proposal
                </button>

                <button
                  onClick={() => handleDecision(latest.id, "ACCEPTED")}
                  disabled={isRequesting}
                  className="px-5 py-2 rounded-xl bg-[#2F5F91] hover:bg-[#214B78] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
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

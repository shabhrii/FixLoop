"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  User,
  FileCheck,
  AlertCircle,
  Loader2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ActionStatus, ActionType } from "@prisma/client";

interface ActionProofLink {
  evidence: {
    id: string;
    originalFilename: string;
    caption?: string | null;
  };
}

interface ActionItem {
  id: string;
  actionType: ActionType;
  description: string;
  status: ActionStatus;
  isRequired: boolean;
  dueAt: string;
  version: number;
  completionNote?: string | null;
  completedAt?: string | null;
  assignee: { displayName: string | null; email: string };
  completedBy?: { displayName: string | null; email: string } | null;
  proofLinks: ActionProofLink[];
}

interface ActionCardProps {
  tenantId: string;
  caseId: string;
  action: ActionItem;
  availableEvidence: Array<{ id: string; originalFilename: string; caption?: string | null }>;
  isCurrentAssigneeOrQE: boolean;
  onCompleted?: () => void;
}

export function ActionCard({
  tenantId,
  caseId,
  action,
  availableEvidence,
  isCurrentAssigneeOrQE,
  onCompleted,
}: ActionCardProps) {
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completionNote, setCompletionNote] = useState("");
  const [proofEvidenceId, setProofEvidenceId] = useState(availableEvidence[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCompleted = action.status === "COMPLETED";
  const isOverdue = !isCompleted && new Date(action.dueAt) < new Date();

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionNote.trim()) {
      setErrorMessage("Please enter a completion note explaining the fix.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/v1/tenants/${tenantId}/cases/${caseId}/actions/${action.id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedVersion: action.version,
            completionNote: completionNote.trim(),
            proofEvidenceId: proofEvidenceId || undefined,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to complete action");

      setShowCompleteForm(false);
      setCompletionNote("");
      if (onCompleted) onCompleted();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const TYPE_CONFIG: Record<ActionType, { label: string; color: string }> = {
    CONTAINMENT: { label: "CONTAINMENT", color: "bg-amber-950/60 text-amber-300 border-amber-700/60" },
    CORRECTIVE: { label: "CORRECTIVE", color: "bg-cyan-950/60 text-cyan-300 border-cyan-700/60" },
    PREVENTIVE: { label: "PREVENTIVE", color: "bg-blue-950/60 text-blue-300 border-blue-700/60" },
  };

  const STATUS_CONFIG: Record<ActionStatus, { label: string; bg: string; text: string; border: string }> = {
    OPEN: { label: "Open", bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700" },
    IN_PROGRESS: { label: "In Progress", bg: "bg-blue-950/60", text: "text-blue-300", border: "border-blue-700/60" },
    COMPLETED: { label: "Completed with Proof", bg: "bg-emerald-950/60", text: "text-emerald-300", border: "border-emerald-700/60" },
    CANCELLED: { label: "Cancelled", bg: "bg-slate-900", text: "text-slate-500", border: "border-slate-800" },
  };

  const typeMeta = TYPE_CONFIG[action.actionType];
  const statusMeta = STATUS_CONFIG[action.status];

  return (
    <div
      className={`p-5 rounded-xl border transition-all ${
        isCompleted
          ? "bg-slate-950/40 border-slate-800/80"
          : isOverdue
          ? "bg-red-950/15 border-red-800/50"
          : "bg-slate-950/80 border-slate-800"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${typeMeta.color}`}>
            {typeMeta.label}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-medium ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}>
            {statusMeta.label}
          </span>
          {action.isRequired && (
            <span className="text-[10px] font-mono text-slate-500">Required for closure</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Clock className={`h-3.5 w-3.5 ${isOverdue ? "text-red-400" : "text-slate-500"}`} />
          <span className={isOverdue ? "text-red-400 font-semibold" : "text-slate-400"}>
            Due {new Date(action.dueAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-200 leading-relaxed mb-3">
        {action.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-900 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate-500" />
          <span>Assigned to: <strong className="text-white">{action.assignee.displayName || action.assignee.email}</strong></span>
        </div>

        {!isCompleted && isCurrentAssigneeOrQE && (
          <button
            onClick={() => setShowCompleteForm(!showCompleteForm)}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-semibold border border-cyan-500/30 flex items-center gap-1.5 transition-colors text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Complete Task
            {showCompleteForm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Completion Details if Completed */}
      {isCompleted && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs space-y-1">
          <div className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed by {action.completedBy?.displayName || action.completedBy?.email} on {new Date(action.completedAt!).toLocaleDateString()}
          </div>
          {action.completionNote && (
            <p className="text-slate-300 italic">&quot;{action.completionNote}&quot;</p>
          )}
          {action.proofLinks.length > 0 && (
            <div className="mt-1 flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Proof Attached: {action.proofLinks[0].evidence.originalFilename}</span>
            </div>
          )}
        </div>
      )}

      {/* Complete Form Modal / Inline */}
      {showCompleteForm && (
        <form onSubmit={handleComplete} className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-cyan-800/60 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Submit Completion & Physical Proof
          </h4>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-700/60 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Completion Engineering Note *
            </label>
            <textarea
              rows={2}
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="State what corrective action was applied and verified on machine..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Attach Proof Evidence (Photo / CMM Report)
            </label>
            <select
              value={proofEvidenceId}
              onChange={(e) => setProofEvidenceId(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">No separate file / verified via note</option>
              {availableEvidence.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.originalFilename} {ev.caption ? `(${ev.caption})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowCompleteForm(false)}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !completionNote.trim()}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 flex items-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Confirm Action Completed
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

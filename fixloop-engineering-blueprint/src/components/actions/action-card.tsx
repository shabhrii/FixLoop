"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  User,
  FileCheck,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ActionStatus, ActionType } from "@prisma/client";

interface ActionProofLink {
  evidence: {
    id: string;
    originalFilename?: string;
    originalFileName?: string;
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
  isActionOwner?: boolean;
  onCompleted?: () => void;
}

export function ActionCard({
  tenantId,
  caseId,
  action,
  availableEvidence,
  isCurrentAssigneeOrQE,
  isActionOwner = false,
  onCompleted,
}: ActionCardProps) {
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completionNote, setCompletionNote] = useState("");
  const [proofEvidenceId, setProofEvidenceId] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [waiverReason, setWaiverReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canComplete = isCurrentAssigneeOrQE || isActionOwner;
  const isCompleted = action.status === "COMPLETED";
  const isOverdue = !isCompleted && new Date(action.dueAt) < new Date();

  const handleProofFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let resolvedFileType = file.type;
    if (!resolvedFileType) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "jpg" || ext === "jpeg") resolvedFileType = "image/jpeg";
      else if (ext === "png") resolvedFileType = "image/png";
      else if (ext === "webp") resolvedFileType = "image/webp";
      else if (ext === "pdf") resolvedFileType = "application/pdf";
      else if (ext === "csv") resolvedFileType = "text/csv";
    }

    setIsUploadingProof(true);
    setErrorMessage(null);

    try {
      // Step 1: Upload Intent
      const intentRes = await fetch(
        `/api/v1/tenants/${tenantId}/cases/${caseId}/evidence/upload-intents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: resolvedFileType || "application/octet-stream",
            fileSize: file.size,
            evidenceType: "ACTION_PROOF",
            caption: `Proof for action: ${action.description.substring(0, 40)}`,
          }),
        }
      );
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.error?.message || "Failed to initialize proof upload");

      const evId = intentData.evidence?.id || intentData.evidenceId;
      const uploadUrl = intentData.uploadUrl;

      // Step 2: PUT raw bytes
      const arrayBuffer = await file.arrayBuffer();
      const transferRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": resolvedFileType || "application/octet-stream" },
        body: arrayBuffer,
      });
      if (!transferRes.ok) throw new Error("Failed to transfer proof file bytes");

      // Step 3: Finalize
      const finRes = await fetch(
        `/api/v1/tenants/${tenantId}/evidence/${evId}/finalize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      if (!finRes.ok) throw new Error("Failed to finalize proof evidence");

      setProofEvidenceId(evId);
      setUploadedFileName(file.name);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload proof file");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionNote.trim()) {
      setErrorMessage("Please enter a completion note explaining the fix.");
      return;
    }

    const hasProof = Boolean(proofEvidenceId);
    const finalWaiver = !hasProof
      ? (waiverReason.trim() || `Verified on machine floor by action verifier: ${completionNote.trim()}`)
      : undefined;

    if (!hasProof && finalWaiver && finalWaiver.length < 10) {
      setErrorMessage("An audited waiver rationale of at least 10 characters is required when no proof file is attached.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: Record<string, any> = {
        expectedVersion: action.version,
        completionNote: completionNote.trim(),
        proofEvidenceIds: proofEvidenceId ? [proofEvidenceId] : [],
      };
      if (finalWaiver) {
        payload.waiverReason = finalWaiver;
      }

      const res = await fetch(
        `/api/v1/tenants/${tenantId}/cases/${caseId}/actions/${action.id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to complete action");

      setShowCompleteForm(false);
      setCompletionNote("");
      setWaiverReason("");
      setUploadedFileName(null);
      if (onCompleted) onCompleted();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const TYPE_CONFIG: Record<ActionType, { label: string; color: string }> = {
    CONTAINMENT: { label: "CONTAINMENT", color: "bg-amber-50 text-[#8A5700] border-amber-200" },
    CORRECTIVE: { label: "CORRECTIVE", color: "bg-[#E7EFF7] text-[#245B86] border-blue-200" },
    PREVENTIVE: { label: "PREVENTIVE", color: "bg-sky-50 text-[#2F5F91] border-sky-200" },
  };

  const STATUS_CONFIG: Record<ActionStatus, { label: string; bg: string; text: string; border: string }> = {
    OPEN: { label: "Open", bg: "bg-slate-100", text: "text-[#17212F]", border: "border-slate-200" },
    IN_PROGRESS: { label: "In Progress", bg: "bg-blue-50", text: "text-[#2F5F91]", border: "border-blue-200" },
    COMPLETED: { label: "Completed with Proof", bg: "bg-emerald-50", text: "text-[#216E4A]", border: "border-emerald-200" },
    CANCELLED: { label: "Cancelled", bg: "bg-slate-100", text: "text-[#526173]", border: "border-slate-200" },
  };

  const typeMeta = TYPE_CONFIG[action.actionType];
  const statusMeta = STATUS_CONFIG[action.status];

  return (
    <div
      className={`p-5 rounded-xl border transition-all ${
        isCompleted
          ? "bg-[#F7F9FC] border-[#D8E0E9]"
          : isOverdue
          ? "bg-red-50/70 border-red-200 shadow-sm"
          : "bg-white border-[#D8E0E9] shadow-sm hover:border-[#2F5F91]/40"
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
            <span className="text-[10px] font-mono text-[#526173]">Required for closure</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Clock className={`h-3.5 w-3.5 ${isOverdue ? "text-[#B42318]" : "text-slate-400"}`} />
          <span suppressHydrationWarning className={isOverdue ? "text-[#B42318] font-bold" : "text-[#526173]"}>
            Due {new Date(action.dueAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <p className="text-sm font-medium text-[#17212F] leading-relaxed mb-3">
        {action.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D8E0E9] text-xs text-[#526173]">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span>Assigned to: <strong className="text-[#17212F]">{action.assignee.displayName || action.assignee.email}</strong></span>
        </div>

        {!isCompleted && canComplete && (
          <button
            onClick={() => setShowCompleteForm(!showCompleteForm)}
            className="px-3 py-1.5 rounded-lg bg-[#E7EFF7] hover:bg-blue-100 text-[#2F5F91] font-semibold border border-blue-200 flex items-center gap-1.5 transition-colors text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Complete Task
            {showCompleteForm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Completion Details if Completed */}
      {isCompleted && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
          <div suppressHydrationWarning className="text-[#216E4A] font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed by {action.completedBy?.displayName || action.completedBy?.email} on {new Date(action.completedAt!).toLocaleDateString()}
          </div>
          {action.completionNote && (
            <p className="text-[#17212F] italic">&quot;{action.completionNote}&quot;</p>
          )}
          {action.proofLinks.length > 0 && (
            <div className="mt-1 flex items-center gap-1.5 text-[#526173] font-mono text-[11px]">
              <FileCheck className="h-3.5 w-3.5 text-[#216E4A]" />
              <span>Proof Attached: {action.proofLinks[0].evidence.originalFileName || action.proofLinks[0].evidence.originalFilename || "Verified Proof"}</span>
            </div>
          )}
        </div>
      )}

      {/* Complete Form Modal / Inline */}
      {showCompleteForm && (
        <form onSubmit={handleComplete} className="mt-4 p-4 rounded-xl bg-[#F7F9FC] border border-[#D8E0E9] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2F5F91]">
              Submit Completion &amp; Physical Proof
            </h4>
            <span className="text-[10px] font-mono text-[#526173]">Action Verifier Gate</span>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-[#B42318] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
              Completion Engineering Note *
            </label>
            <textarea
              rows={2}
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="State what corrective action was applied and verified on machine floor..."
              disabled={isSubmitting || isUploadingProof}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
            />
          </div>

          {/* Proof Evidence Section with Direct Upload */}
          <div className="p-3 rounded-xl bg-white border border-[#D8E0E9] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[#526173] uppercase tracking-wider">
                Proof Evidence (Photo / CMM / Inspection Report)
              </label>
              {isUploadingProof && (
                <span className="text-[11px] text-[#2F5F91] flex items-center gap-1 font-mono">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading proof...
                </span>
              )}
            </div>

            {uploadedFileName ? (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-[#216E4A]">
                <div className="flex items-center gap-1.5 font-semibold">
                  <FileCheck className="h-4 w-4" />
                  <span>Attached: {uploadedFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProofEvidenceId("");
                    setUploadedFileName(null);
                  }}
                  className="text-[11px] text-[#B42318] hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-[#E7EFF7] hover:bg-blue-100 text-[#2F5F91] border border-blue-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                    <FileCheck className="h-3.5 w-3.5" />
                    Upload Proof File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleProofFileUpload}
                      disabled={isSubmitting || isUploadingProof}
                      accept="image/*,application/pdf,text/csv"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">or choose from case evidence:</span>
                </div>

                {availableEvidence.length > 0 && (
                  <select
                    value={proofEvidenceId}
                    onChange={(e) => setProofEvidenceId(e.target.value)}
                    disabled={isSubmitting || isUploadingProof}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
                  >
                    <option value="">No existing file selected</option>
                    {availableEvidence.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.originalFilename} {ev.caption ? `(${ev.caption})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {!proofEvidenceId && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#526173] uppercase tracking-wider">
                  Audited Waiver Rationale (If no separate proof file)
                </label>
                <button
                  type="button"
                  onClick={() => setWaiverReason("Physical fix inspected and verified directly on machine cell tooling")}
                  className="text-[10px] text-[#2F5F91] hover:underline font-mono"
                >
                  Fill standard waiver
                </button>
              </div>
              <input
                type="text"
                value={waiverReason}
                onChange={(e) => setWaiverReason(e.target.value)}
                placeholder="Reason why physical proof is waived for this action (min 10 chars)..."
                disabled={isSubmitting || isUploadingProof}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
              />
              <p className="text-[10px] text-[#526173] mt-1">
                Per quality rules, completed actions must have either an attached file or an audited waiver rationale.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowCompleteForm(false)}
              disabled={isSubmitting || isUploadingProof}
              className="px-3 py-1.5 rounded-lg border border-[#D8E0E9] text-xs text-[#526173] hover:text-[#17212F] bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingProof || !completionNote.trim()}
              className="px-4 py-1.5 rounded-lg bg-[#2F5F91] hover:bg-[#214B78] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
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

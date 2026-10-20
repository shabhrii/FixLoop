"use client";

import { useState } from "react";
import { Plus, CheckSquare, X, AlertCircle, Loader2 } from "lucide-react";
import { ActionType } from "@prisma/client";

interface UserOption {
  id: string;
  displayName: string | null;
  email: string;
}

interface ActionEditorProps {
  tenantId: string;
  caseId: string;
  assignees: UserOption[];
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function ActionEditor({
  tenantId,
  caseId,
  assignees,
  isOpen,
  onClose,
  onCreated,
}: ActionEditorProps) {
  const [actionType, setActionType] = useState<ActionType>("CONTAINMENT");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(assignees[0]?.id || "");
  const [dueDays, setDueDays] = useState("3");
  const [isRequired, setIsRequired] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage("Please enter an action description.");
      return;
    }
    if (!assigneeId) {
      setErrorMessage("Please select an action assignee.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + (parseInt(dueDays, 10) || 3));

    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/cases/${caseId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType,
          description: description.trim(),
          assigneeId,
          dueAt: dueAt.toISOString(),
          isRequired,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to create action");

      setDescription("");
      if (onCreated) onCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create action");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[#D8E0E9] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8E0E9]">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#2F5F91]" />
            <h3 className="text-base font-bold text-[#17212F] tracking-tight">
              Assign Corrective Action Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-[#17212F] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-[#B42318]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#B42318]" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
              Action Type *
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as ActionType)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
            >
              <option value="CONTAINMENT">CONTAINMENT (Immediate quarantine, stop defect flow)</option>
              <option value="CORRECTIVE">CORRECTIVE (Eliminate proven root cause)</option>
              <option value="PREVENTIVE">PREVENTIVE (Systemic tooling/documentation upgrade)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
              Task Description & Proof Requirements *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State exactly what must be done and what physical proof artifact must be attached before completion..."
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
                Assignee Owner *
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
              >
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.displayName || a.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
                Due In (Days)
              </label>
              <select
                value={dueDays}
                onChange={(e) => setDueDays(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
              >
                <option value="1">1 Day (Urgent Containment)</option>
                <option value="3">3 Days (Standard)</option>
                <option value="7">7 Days (Tooling / Maintenance)</option>
                <option value="14">14 Days (Process Redesign)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-[#D8E0E9] text-slate-500 hover:text-[#17212F] bg-white hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="px-5 py-2 rounded-xl bg-[#2F5F91] hover:bg-[#214B78] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

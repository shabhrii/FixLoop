"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus } from "lucide-react";
import { ActionCard } from "@/components/actions/action-card";
import { ActionEditor } from "@/components/actions/action-editor";

interface AssigneeOption {
  id: string;
  displayName: string | null;
  email: string;
}

interface EvidenceOption {
  id: string;
  originalFilename: string;
  caption?: string | null;
}

interface CaseActionsSectionProps {
  tenantId: string;
  caseId: string;
  actions: any[];
  availableEvidence: EvidenceOption[];
  assignees: AssigneeOption[];
  isQualityEngineer: boolean;
  currentUserId: string;
}

export function CaseActionsSection({
  tenantId,
  caseId,
  actions,
  availableEvidence,
  assignees,
  isQualityEngineer,
  currentUserId,
}: CaseActionsSectionProps) {
  const router = useRouter();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <div
      className="p-6 rounded-2xl space-y-4 shadow-sm"
      style={{ backgroundColor: "var(--fl-surface)", border: "1px solid var(--fl-border)" }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 pb-3"
        style={{ borderBottom: "1px solid var(--fl-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{ backgroundColor: "var(--fl-blue-050)" }}
          >
            <CheckCircle2 className="h-5 w-5" style={{ color: "var(--fl-blue-700)" }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight" style={{ color: "var(--fl-text)" }}>
              Corrective &amp; Containment Actions ({actions.length})
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--fl-text-muted)" }}>
              Tasks required to isolate the failure and prevent defect recurrence.
            </p>
          </div>
        </div>

        {isQualityEngineer && (
          <button
            onClick={() => setIsEditorOpen(true)}
            id="btn-assign-action-task"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: "var(--fl-blue-700)" }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Assign Action Task
          </button>
        )}
      </div>

      <div className="space-y-3 pt-1">
        {actions.length === 0 ? (
          <div className="py-10 text-center text-xs space-y-2" style={{ color: "var(--fl-text-muted)" }}>
            <p className="font-medium">No corrective actions assigned yet.</p>
            {isQualityEngineer && (
              <p className="text-[11px]">
                Click <strong>&quot;Assign Action Task&quot;</strong> above to create containment or root-cause countermeasures.
              </p>
            )}
          </div>
        ) : (
          actions.map((action: any) => (
            <ActionCard
              key={action.id}
              tenantId={tenantId}
              caseId={caseId}
              action={action}
              availableEvidence={availableEvidence}
              isCurrentAssigneeOrQE={isQualityEngineer || action.assigneeId === currentUserId}
              onCompleted={() => router.refresh()}
            />
          ))
        )}
      </div>

      {/* Action Editor Dialog */}
      <ActionEditor
        tenantId={tenantId}
        caseId={caseId}
        assignees={assignees}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onCreated={() => {
          setIsEditorOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

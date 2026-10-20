"use client";

import { useState } from "react";
import { GitBranch, Plus, Trash2, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface WhyStep {
  stepNumber: number;
  question: string;
  answer?: string | null;
  evidenceIds?: string[];
}

interface EvidenceOption {
  id: string;
  originalFilename: string;
  caption?: string | null;
}

interface FiveWhyEditorProps {
  tenantId: string;
  caseId: string;
  initialSteps: WhyStep[];
  availableEvidence: EvidenceOption[];
  canEdit: boolean;
  onSaved?: () => void;
}

export function FiveWhyEditor({
  tenantId,
  caseId,
  initialSteps = [],
  availableEvidence = [],
  canEdit,
  onSaved,
}: FiveWhyEditorProps) {
  const [steps, setSteps] = useState<WhyStep[]>(
    initialSteps.length > 0
      ? initialSteps
      : [
          { stepNumber: 1, question: "Why did the defect occur?", answer: "", evidenceIds: [] },
          { stepNumber: 2, question: "Why did that happen?", answer: "", evidenceIds: [] },
          { stepNumber: 3, question: "Why was that condition present?", answer: "", evidenceIds: [] },
        ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const addStep = () => {
    if (steps.length >= 7) return;
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        question: `Why step ${steps.length + 1}?`,
        answer: "",
        evidenceIds: [],
      },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: "question" | "answer", val: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: val };
    setSteps(newSteps);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Filter to steps that have both a non-empty question and answer
    const validSteps = steps
      .filter((s) => s.question.trim().length >= 3 && s.answer && s.answer.trim().length >= 3)
      .map((s, idx) => ({
        stepNumber: idx + 1,
        question: s.question.trim(),
        answer: s.answer!.trim(),
        evidenceIds: s.evidenceIds || [],
      }));

    if (validSteps.length === 0) {
      setErrorMessage("Please answer at least one 5-Why question (minimum 3 characters).");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/v1/tenants/${tenantId}/cases/${caseId}/investigation/why-steps`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            steps: validSteps,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to save 5-Why investigation");
      }

      setSuccessMessage("5-Why investigation steps saved successfully.");
      if (onSaved) onSaved();
    } catch (err: any) {
      setErrorMessage(err.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#D8E0E9] shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E7EFF7] text-[#2F5F91]">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17212F] tracking-tight">
              5-Why Root Cause Analysis
            </h3>
            <p className="text-xs text-[#526173] mt-0.5">
              Drill down systematically to isolate the underlying failure mechanism.
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={addStep}
            disabled={steps.length >= 7 || isSaving}
            className="px-3 py-1.5 rounded-xl border border-[#D8E0E9] bg-white hover:bg-slate-50 text-[#17212F] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Why Step
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-[#B42318]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#B42318]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-[#216E4A]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#216E4A]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Step Items List */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.stepNumber}
            className="p-4 rounded-xl bg-[#F7F9FC] border border-[#D8E0E9] space-y-3 relative group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="h-7 w-7 rounded-full bg-[#E7EFF7] border border-[#D8E0E9] text-[#2F5F91] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                {canEdit ? (
                  <input
                    type="text"
                    value={step.question}
                    onChange={(e) => updateStep(index, "question", e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-400 focus:border-[#2F5F91] focus:border-solid text-xs font-semibold text-[#17212F] px-2.5 py-1.5 focus:outline-none transition-colors"
                  />
                ) : (
                  <span className="text-xs font-semibold text-[#17212F] px-1 py-1">{step.question}</span>
                )}
              </div>

              {canEdit && steps.length > 1 && (
                <button
                  onClick={() => removeStep(index)}
                  disabled={isSaving}
                  title="Remove step"
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div>
              <textarea
                rows={2}
                value={step.answer || ""}
                onChange={(e) => updateStep(index, "answer", e.target.value)}
                placeholder={`State the direct cause for Why #${step.stepNumber}...`}
                disabled={!canEdit || isSaving}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5F91] leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#2F5F91] hover:bg-[#214B78] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving 5-Why Chain...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save 5-Why Investigation
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

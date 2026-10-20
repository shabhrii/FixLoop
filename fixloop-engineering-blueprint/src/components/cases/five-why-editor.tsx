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

    // Validate that at least the first question & answer are non-empty
    if (!steps[0].answer?.trim()) {
      setErrorMessage("Please provide an answer for at least the first Why question.");
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
            steps: steps.map((s) => ({
              stepNumber: s.stepNumber,
              question: s.question.trim(),
              answer: s.answer?.trim() || null,
              evidenceIds: s.evidenceIds || [],
            })),
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
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              5-Why Root Cause Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Drill down systematically to isolate the underlying failure mechanism.
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={addStep}
            disabled={steps.length >= 7 || isSaving}
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Why Step
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Step Items List */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.stepNumber}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 relative group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                {canEdit ? (
                  <input
                    type="text"
                    value={step.question}
                    onChange={(e) => updateStep(index, "question", e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-purple-500 text-xs font-semibold text-slate-200 px-1 py-0.5 focus:outline-none"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">{step.question}</span>
                )}
              </div>

              {canEdit && steps.length > 1 && (
                <button
                  onClick={() => removeStep(index)}
                  disabled={isSaving}
                  title="Remove step"
                  className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
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
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
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

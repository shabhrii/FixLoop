"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertOctagon, Send, FileEdit, AlertCircle, Loader2, Info } from "lucide-react";
import { CreateCaseSchema } from "@/lib/validation/case";

interface SiteOption {
  id: string;
  name: string;
  code?: string | null;
}

interface CaseIntakeFormProps {
  tenantId: string;
  sites: SiteOption[];
}

export function CaseIntakeForm({ tenantId, sites }: CaseIntakeFormProps) {
  const router = useRouter();

  const [siteId, setSiteId] = useState(sites[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [category, setCategory] = useState("DIMENSIONAL");
  const [partNumber, setPartNumber] = useState("");
  const [machineId, setMachineId] = useState("");
  const [operation, setOperation] = useState("");
  const [observedValue, setObservedValue] = useState<string>("");
  const [specification, setSpecification] = useState("");
  const [unit, setUnit] = useState("mm");
  const [quantityInspected, setQuantityInspected] = useState<string>("");
  const [quantityAffected, setQuantityAffected] = useState<string>("");
  const [botField, setBotField] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (isDraft: boolean) => {
    // Client honeypot check
    if (botField.trim() !== "") {
      setErrorMessage("Automated submission detected.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      siteId,
      title: title.trim(),
      description: description.trim(),
      severity,
      category: category || null,
      partNumber: partNumber.trim() || null,
      machineId: machineId.trim() || null,
      operation: operation.trim() || null,
      observedValue: observedValue !== "" ? parseFloat(observedValue) : null,
      specification: specification.trim() || null,
      unit: unit.trim() || null,
      quantityInspected: quantityInspected !== "" ? parseInt(quantityInspected, 10) : null,
      quantityAffected: quantityAffected !== "" ? parseInt(quantityAffected, 10) : null,
      isDraft,
      bot_field: botField,
    };

    // Client validation
    const validation = CreateCaseSchema.safeParse(payload);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      for (const err of validation.error.errors) {
        const key = err.path.join(".");
        if (!errMap[key]) {
          errMap[key] = err.message;
        }
      }
      setFieldErrors(errMap);
      setErrorMessage(validation.error.errors[0]?.message || "Validation failed. Please review the highlighted fields.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create quality case");
      }

      router.push(`/app/cases/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
          <AlertOctagon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Report Nonconformance / Intake Defect
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log observed manufacturing defect parameters, tolerances, and initial containment.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center gap-2.5 text-xs text-red-300">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="mt-6 space-y-6">
        {/* Core Case Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Factory Site *
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Initial Severity *
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low (Cosmetic, non-functional)</option>
              <option value="MEDIUM">Medium (Out of spec, salvageable)</option>
              <option value="HIGH">High (Scrap, potential batch impact)</option>
              <option value="CRITICAL">Critical (Safety hazard, line stoppage)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Defect Title / Summary *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="e.g. Bore diameter undersized by 0.04mm on Bearing Housing"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.title ? "border-red-500 focus:ring-red-500" : "border-slate-800"
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Detailed Problem Description *
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: "" }));
            }}
            placeholder="Describe what was observed, machine state, tooling conditions, and initial containment actions taken..."
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.description ? "border-red-500 focus:ring-red-500" : "border-slate-800"
            }`}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.description}</p>
          )}
        </div>

        {/* Manufacturing Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Part Number
            </label>
            <input
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="e.g. PN-4091-B"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Machine ID / Cell
            </label>
            <input
              type="text"
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              placeholder="e.g. CNC-MILL-04"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Operation / Process
            </label>
            <input
              type="text"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              placeholder="e.g. OP-20 Finish Boring"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Measurement & Specification */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Observed Value
            </label>
            <input
              type="number"
              step="any"
              value={observedValue}
              onChange={(e) => setObservedValue(e.target.value)}
              placeholder="e.g. 49.96"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Specification / Target
            </label>
            <input
              type="text"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              placeholder="e.g. 50.00 ± 0.02"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Unit
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. mm, µm, bar"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quantity Inspected vs Affected */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Quantity Inspected
            </label>
            <input
              type="number"
              min="1"
              value={quantityInspected}
              onChange={(e) => setQuantityInspected(e.target.value)}
              placeholder="e.g. 50"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Quantity Affected / Nonconforming
            </label>
            <input
              type="number"
              min="0"
              value={quantityAffected}
              onChange={(e) => {
                setQuantityAffected(e.target.value);
                if (fieldErrors.quantityAffected) setFieldErrors((prev) => ({ ...prev, quantityAffected: "" }));
              }}
              placeholder="e.g. 8"
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.quantityAffected ? "border-red-500 focus:ring-red-500" : "border-slate-800"
              }`}
            />
            {fieldErrors.quantityAffected && (
              <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.quantityAffected}</p>
            )}
          </div>
        </div>

        {/* Spam Honeypot Field */}
        <div className="sr-only" aria-hidden="true" style={{ display: "none" }}>
          <label htmlFor="case_hp">Do not fill this field</label>
          <input
            id="case_hp"
            type="text"
            name="case_hp"
            value={botField}
            onChange={(e) => setBotField(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <FileEdit className="h-4 w-4" />
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting Case...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Nonconformance
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

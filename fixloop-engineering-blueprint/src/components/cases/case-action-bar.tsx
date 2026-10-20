"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Lock,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { CaseStatus } from "@prisma/client";
import { CloseCaseDialog } from "@/components/verification/close-case-dialog";
import { ReportExportButton } from "@/components/reports/report-export-button";

interface CaseActionBarProps {
  tenantId: string;
  caseId: string;
  caseVersion: number;
  currentStatus: CaseStatus;
  isQualityEngineer: boolean;
  actions: any[];
  findings: any[];
  latestEffectiveness: any | null;
}

export function CaseActionBar({
  tenantId,
  caseId,
  caseVersion,
  currentStatus,
  isQualityEngineer,
  actions,
  findings,
  latestEffectiveness,
}: CaseActionBarProps) {
  const router = useRouter();
  const [isCloseOpen, setIsCloseOpen] = useState(false);

  // Triage state
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [triageCategory, setTriageCategory] = useState("DIMENSIONAL");
  const [triageSeverity, setTriageSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [containment, setContainment] = useState("");
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageError, setTriageError] = useState<string | null>(null);

  const handleTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containment.trim()) {
      setTriageError("Please describe the physical containment action taken.");
      return;
    }

    setIsTriaging(true);
    setTriageError(null);

    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/cases/${caseId}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: triageCategory,
          severity: triageSeverity,
          containmentAssessment: containment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Triage failed");

      setIsTriageOpen(false);
      router.refresh();
    } catch (err: any) {
      setTriageError(err.message || "Failed to triage case");
    } finally {
      setIsTriaging(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Triage Button if SUBMITTED or TRIAGE */}
      {isQualityEngineer && (currentStatus === "SUBMITTED" || currentStatus === "TRIAGE") && (
        <button
          onClick={() => setIsTriageOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#2F5F91] hover:bg-[#214B78] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5F91]"
        >
          <PlayCircle className="h-4 w-4" />
          {currentStatus === "TRIAGE" ? "Complete Triage & Begin 5-Why Investigation" : "Triage & Begin 5-Why Investigation"}
        </button>
      )}

      {/* Close Case Dialog trigger */}
      {isQualityEngineer && currentStatus !== "CLOSED" && currentStatus !== "CANCELLED" && (
        <button
          onClick={() => setIsCloseOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#216E4A] hover:bg-[#1a573a] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#216E4A]"
        >
          <Lock className="h-4 w-4" />
          Verify & Close Case
        </button>
      )}

      {/* Export Tamper-Evident Report */}
      <ReportExportButton tenantId={tenantId} caseId={caseId} />

      {/* Close Case Dialog */}
      <CloseCaseDialog
        tenantId={tenantId}
        caseId={caseId}
        caseVersion={caseVersion}
        currentStatus={currentStatus}
        actions={actions}
        findings={findings}
        latestEffectiveness={latestEffectiveness}
        isQualityEngineer={isQualityEngineer}
        isOpen={isCloseOpen}
        onClose={() => setIsCloseOpen(false)}
        onClosed={() => router.refresh()}
      />

      {/* Triage Modal */}
      {isTriageOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#D8E0E9] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-[#2F5F91]">
              <ShieldAlert className="h-5 w-5" />
              <h4 className="text-base font-bold text-[#17212F]">Engineering Triage & Containment</h4>
            </div>

            <p className="text-xs text-[#526173]">
              Quality Engineer must assess defect containment before releasing case to 5-Why root cause investigation.
            </p>

            {triageError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#B42318]">
                {triageError}
              </div>
            )}

            <form onSubmit={handleTriage} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
                    Confirmed Severity *
                  </label>
                  <select
                    value={triageSeverity}
                    onChange={(e) => setTriageSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
                    Defect Category *
                  </label>
                  <select
                    value={triageCategory}
                    onChange={(e) => setTriageCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
                  >
                    <option value="DIMENSIONAL">Dimensional</option>
                    <option value="SURFACE">Surface Finish</option>
                    <option value="MATERIAL">Material / Hardness</option>
                    <option value="ASSEMBLY">Assembly Fit</option>
                    <option value="PROCESS">Process / Feedrate</option>
                    <option value="SAFETY">Safety</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
                  Containment Action Implemented *
                </label>
                <textarea
                  rows={3}
                  value={containment}
                  onChange={(e) => setContainment(e.target.value)}
                  placeholder="e.g. Quarantined pallets 409 and 410. Verified cutting tool offset calibrated..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTriageOpen(false)}
                  disabled={isTriaging}
                  className="px-4 py-2 rounded-xl border border-[#D8E0E9] text-xs text-[#526173] hover:text-[#17212F] bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTriaging || !containment.trim()}
                  className="px-5 py-2 rounded-xl bg-[#2F5F91] hover:bg-[#214B78] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {isTriaging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                  Confirm Triage & Advance to Investigating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

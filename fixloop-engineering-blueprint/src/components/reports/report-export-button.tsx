"use client";

import { useState } from "react";
import { Download, AlertCircle, Loader2, Shield } from "lucide-react";

interface ReportExportButtonProps {
  tenantId: string;
  caseId: string;
}

export function ReportExportButton({ tenantId, caseId }: ReportExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setChecksum(null);

    const idempotencyKey = `report-${caseId}-${Date.now()}`;

    try {
      // Step 1: Request report generation
      const genRes = await fetch(`/api/v1/tenants/${tenantId}/cases/${caseId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error?.message || "Failed to generate audit report");

      const reportId = genData.id;

      // Step 2: Fetch authorized download URL
      const dlRes = await fetch(`/api/v1/tenants/${tenantId}/reports/${reportId}`);
      const dlData = await dlRes.json();
      if (!dlRes.ok) throw new Error(dlData.error?.message || "Failed to retrieve download capability");

      setChecksum(dlData.checksum);

      // Automatically trigger download
      window.open(dlData.downloadUrl, "_blank");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to export report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#17212F] text-xs font-semibold border border-[#D8E0E9] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2F5F91]" />
            Generating Audit Snapshot...
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5 text-[#2F5F91]" />
            Export Tamper-Evident Report
          </>
        )}
      </button>

      {checksum && (
        <span className="text-[10px] font-mono text-[#216E4A] flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
          <Shield className="h-3 w-3" />
          <span>SHA-256: {checksum.substring(0, 12)}...</span>
        </span>
      )}

      {errorMessage && (
        <span className="text-[11px] text-[#B42318] flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-200">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{errorMessage}</span>
        </span>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Download, FileText, CheckCircle2, AlertCircle, Loader2, Shield } from "lucide-react";

interface ReportExportButtonProps {
  tenantId: string;
  caseId: string;
}

export function ReportExportButton({ tenantId, caseId }: ReportExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setDownloadUrl(null);
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

      setDownloadUrl(dlData.downloadUrl);
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
    <div className="space-y-2">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
            Generating Audit Snapshot...
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5 text-blue-400" />
            Export Tamper-Evident Report
          </>
        )}
      </button>

      {checksum && (
        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>SHA-256: {checksum.substring(0, 16)}...</span>
        </div>
      )}

      {errorMessage && (
        <div className="text-[11px] text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

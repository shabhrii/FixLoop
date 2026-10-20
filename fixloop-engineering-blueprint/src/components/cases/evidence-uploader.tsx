"use client";

import { useState, useRef } from "react";
import { Upload, Camera, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { EvidenceType } from "@prisma/client";

interface EvidenceUploaderProps {
  tenantId: string;
  caseId: string;
  allowedTypes?: EvidenceType[];
  defaultType?: EvidenceType;
  onUploaded?: (evidence: any) => void;
}

export function EvidenceUploader({
  tenantId,
  caseId,
  allowedTypes = [
    "DEFECT_PHOTO",
    "MEASUREMENT",
    "PROCESS_RECORD",
    "ACTION_PROOF",
    "VERIFICATION_PROOF",
    "OTHER",
  ],
  defaultType = "DEFECT_PHOTO",
  onUploaded,
}: EvidenceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>(defaultType);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Step 1: Request upload intent
      setUploadProgress("Initiating secure upload intent...");
      const intentRes = await fetch(
        `/api/v1/tenants/${tenantId}/cases/${caseId}/evidence/upload-intents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            evidenceType,
            caption: caption.trim() || undefined,
          }),
        }
      );

      const intentData = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentData.error?.message || "Failed to initialize upload intent");
      }

      const { evidenceId, uploadUrl } = intentData;

      // Step 2: Transfer raw file bytes
      setUploadProgress("Transferring tamper-resistant evidence bytes...");
      const arrayBuffer = await file.arrayBuffer();

      const transferRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: arrayBuffer,
      });

      if (!transferRes.ok) {
        throw new Error("Failed to write evidence bytes to storage");
      }

      // Step 3: Finalize evidence
      setUploadProgress("Verifying checksum and marking evidence AVAILABLE...");
      const finalizeRes = await fetch(
        `/api/v1/tenants/${tenantId}/evidence/${evidenceId}/finalize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actualSizeBytes: file.size,
            actualMimeType: file.type || "application/octet-stream",
          }),
        }
      );

      const finalizedData = await finalizeRes.json();
      if (!finalizeRes.ok) {
        throw new Error(finalizedData.error?.message || "Failed to finalize evidence");
      }

      setSuccessMessage(`Successfully captured and verified "${file.name}"`);
      setFile(null);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onUploaded) onUploaded(finalizedData);
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Camera className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Upload Physical Evidence
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Attach tamper-evident defect photos, CMM measurements, or action completion proofs.
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Evidence Type
            </label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
              disabled={isUploading}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allowedTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Caption / Measurement Note
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Bore depth at spindle 2"
              disabled={isUploading}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* File Select Area */}
        <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center bg-slate-950/40 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id={`file-upload-${caseId}`}
          />
          <label
            htmlFor={`file-upload-${caseId}`}
            className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
          >
            <Upload className="h-6 w-6 text-slate-400 mb-1" />
            <span className="text-xs font-semibold text-blue-400 hover:text-blue-300">
              {file ? file.name : "Click to select photo or test document"}
            </span>
            <span className="text-[10px] text-slate-500">
              {file
                ? `${(file.size / 1024).toFixed(1)} KB`
                : "PNG, JPG, PDF, CSV, TXT up to 15MB"}
            </span>
          </label>
        </div>

        {isUploading && (
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center gap-2.5 text-xs text-blue-300">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400 shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Verifying Evidence...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Finalize Evidence Upload
            </>
          )}
        </button>
      </form>
    </div>
  );
}

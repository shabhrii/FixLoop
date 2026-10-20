"use client";

import { useState, useRef } from "react";
import { Upload, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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

    // Determine and validate MIME type
    let resolvedFileType = file.type;
    if (!resolvedFileType) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "jpg" || ext === "jpeg") resolvedFileType = "image/jpeg";
      else if (ext === "png") resolvedFileType = "image/png";
      else if (ext === "webp") resolvedFileType = "image/webp";
      else if (ext === "pdf") resolvedFileType = "application/pdf";
      else if (ext === "csv") resolvedFileType = "text/csv";
    }

    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf", "text/csv"];
    if (!ALLOWED_MIME.includes(resolvedFileType)) {
      setErrorMessage("Unsupported file type. Please upload a JPEG, PNG, WebP image, PDF, or CSV.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Step 1: Request upload intent with schema-compliant field names
      setUploadProgress("Initiating secure upload intent...");
      const intentRes = await fetch(
        `/api/v1/tenants/${tenantId}/cases/${caseId}/evidence/upload-intents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: resolvedFileType,
            fileSize: file.size,
            evidenceType,
            caption: caption.trim() || undefined,
          }),
        }
      );

      const intentData = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentData.error?.message || "Failed to initialize upload intent");
      }

      const evidenceId = intentData.evidence?.id || intentData.evidenceId;
      const uploadUrl = intentData.uploadUrl;
      if (!evidenceId || !uploadUrl) {
        throw new Error("Invalid response from upload service");
      }

      // Step 2: Transfer raw file bytes
      setUploadProgress("Transferring tamper-resistant evidence bytes...");
      const arrayBuffer = await file.arrayBuffer();

      const transferRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": resolvedFileType },
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
          body: JSON.stringify({}),
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
    <div className="p-5 rounded-2xl bg-white border border-[#D8E0E9] shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="h-4 w-4 text-[#2F5F91]" />
        <h3 className="text-sm font-bold text-[#17212F] uppercase tracking-wider">
          Upload Physical Evidence
        </h3>
      </div>
      <p className="text-xs text-[#526173] mb-4">
        Attach tamper-evident defect photos, CMM measurements, or action completion proofs.
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-[#B42318]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#B42318]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-[#216E4A]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#216E4A]" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
              Evidence Type
            </label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
              disabled={isUploading}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
            >
              {allowedTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#526173] uppercase tracking-wider mb-1">
              Caption / Measurement Note
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Bore depth at spindle 2"
              disabled={isUploading}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8E0E9] text-xs text-[#17212F] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5F91]"
            />
          </div>
        </div>

        {/* File Select Area */}
        <div className="border-2 border-dashed border-[#D8E0E9] hover:border-[#2F5F91] rounded-xl p-4 text-center bg-[#F7F9FC] transition-colors">
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
            <span className="text-xs font-semibold text-[#2F5F91] hover:text-[#214B78]">
              {file ? file.name : "Click to select photo or test document"}
            </span>
            <span className="text-[10px] text-[#526173]">
              {file
                ? `${(file.size / 1024).toFixed(1)} KB`
                : "PNG, JPG, PDF, CSV, TXT up to 15MB"}
            </span>
          </label>
        </div>

        {isUploading && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 text-xs text-[#2F5F91]">
            <Loader2 className="h-4 w-4 animate-spin text-[#2F5F91] shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full py-2.5 px-4 rounded-xl bg-[#2F5F91] hover:bg-[#214B78] disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
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

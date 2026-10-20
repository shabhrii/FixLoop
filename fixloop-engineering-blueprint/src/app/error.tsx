"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception without exposing confidential customer or defect details
    console.error("[FixLoop Client Error Boundary]:", error.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-lg text-center p-8 sm:p-10 rounded-2xl bg-slate-900/80 border border-red-900/40 shadow-2xl backdrop-blur-md">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
          <AlertOctagon className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Application Error Detected
        </h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          An unexpected error occurred while executing this operation. The incident was isolated to preserve session security and tenant integrity.
        </p>

        {error.digest && (
          <div className="mt-4 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-500">
            Error Diagnostic Ref: {error.digest}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Operation
          </button>
          <Link
            href="/app"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-medium text-xs transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Cpu, ArrowLeft, AlertTriangle, Layers } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                FixLoop
              </span>
              <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 border border-blue-700/50">
                Precision QMS
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Center 404 Card */}
      <main className="relative z-10 max-w-xl mx-auto px-6 py-20 flex-1 flex flex-col justify-center text-center">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-md">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-6">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200 mt-2">Resource or Page Not Found</h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            The defect case, audit snapshot, or path you requested could not be located. It may have been moved, archived, or restricted under tenant boundary isolation.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app/cases"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Layers className="h-4 w-4" />
              Return to Defect Queue
            </Link>
            <Link
              href="/app"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-medium text-xs transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Workspace Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 py-6 px-6 text-center text-xs text-slate-600">
        <p>FixLoop Engineering Platform • Zero-Trust Manufacturing Quality System</p>
      </footer>
    </div>
  );
}

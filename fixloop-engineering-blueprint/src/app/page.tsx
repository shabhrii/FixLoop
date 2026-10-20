import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ShieldAlert,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  GitBranch,
} from "lucide-react";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("fixloop_session");

  if (sessionToken?.value) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background radial glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Zero-Trust Closed-Loop Manufacturing Quality Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Stop Defect Recurrence with{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              Proof-Backed Corrective Action
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl">
            FixLoop turns shop-floor nonconformances into immutable, auditable root cause resolutions.
            Featuring structured 5-Why analysis, tamper-evident evidence capture, AI-assisted hypotheses,
            and strict physical verification gates before case closure.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all"
            >
              Enter Workspace Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#pillars"
              className="px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 font-semibold transition-all"
            >
              View System Architecture
            </a>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div id="pillars" className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Intake & Triage</h2>
            <p className="mt-2 text-sm text-slate-400">
              Immediate containment logging with part numbers, machine specs, tolerance deviations, and tamper-resistant photo proof.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <GitBranch className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">5-Why & AI Assistance</h2>
            <p className="mt-2 text-sm text-slate-400">
              Structured 5-Why root cause isolation. Untrusted AI suggestions require explicit human confirmation before becoming confirmed causes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Guarded Verification</h2>
            <p className="mt-2 text-sm text-slate-400">
              Cases cannot be closed without confirmed root cause, completed corrective action proof, and statistical effectiveness sampling.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Multi-Tenant Isolation</h2>
            <p className="mt-2 text-sm text-slate-400">
              Rigid tenant boundary enforcement at both application and policy layers. Immutable append-only audit trail for compliance.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>FixLoop Engineering Platform • Multi-Tenant Precision Quality Management System</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

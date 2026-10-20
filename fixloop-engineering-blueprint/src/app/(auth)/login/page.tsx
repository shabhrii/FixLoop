"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cpu,
  Shield,
  Wrench,
  UserCheck,
  CheckCircle,
  Eye,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

const DEMO_PERSONAS = [
  {
    role: "QUALITY_ENGINEER",
    name: "Demo Quality Engineer",
    email: "qe@synthetic-demo.com",
    desc: "Triage nonconformances, isolate 5-Why root cause, evaluate effectiveness & close cases.",
    icon: Shield,
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    role: "OPERATOR",
    name: "Demo Operator",
    email: "operator@synthetic-demo.com",
    desc: "Report shop-floor defects, log observed deviations & attach photo evidence.",
    icon: Wrench,
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    role: "ACTION_OWNER",
    name: "Demo Action Owner",
    email: "actionowner@synthetic-demo.com",
    desc: "Execute corrective tasks, upload proof of fix & submit completion notes.",
    icon: CheckCircle,
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    role: "TENANT_ADMIN",
    name: "Demo Admin",
    email: "admin@synthetic-demo.com",
    desc: "Manage factory sites, oversee member roles & configure workspace settings.",
    icon: UserCheck,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    role: "AUDITOR",
    name: "Demo Auditor",
    email: "auditor@synthetic-demo.com",
    desc: "Read-only compliance inspection of closed cases, reports and immutable audit trail.",
    icon: Eye,
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [botField, setBotField] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmailFormat = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return "Please enter your work email address.";
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid work email address (e.g. name@company.com).";
    }
    return null;
  };

  const handleLogin = async (loginEmail: string) => {
    const emailError = validateEmailFormat(loginEmail);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    // Client honeypot check
    if (botField.trim() !== "") {
      setErrorMessage("Automated submission detected.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password,
          bot_field: botField,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Authentication failed. Check your credentials.");
      }

      router.push("/app");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during sign in.");
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/25 mb-4">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            FixLoop Quality Platform
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your tenant workspace and audit trail.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-700/60 flex items-start gap-3 text-red-200 text-sm">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Sign in error</p>
              <p className="mt-0.5 text-xs text-red-200/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md mb-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@precision-manufacturing.com"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            {/* Spam Honeypot Field (Offscreen / Hidden to humans) */}
            <div className="sr-only" aria-hidden="true" style={{ display: "none" }}>
              <label htmlFor="website_hp">Do not fill this field</label>
              <input
                id="website_hp"
                type="text"
                name="website_hp"
                value={botField}
                onChange={(e) => setBotField(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Identity...
                </>
              ) : (
                <>
                  Sign In to Workspace
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* 1-Click Demo Persona Selector */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interactive Demo Personas
            </h2>
            <span className="text-[11px] text-blue-400 font-mono">1-Click Sign In</span>
          </div>

          <div className="space-y-2.5">
            {DEMO_PERSONAS.map((persona) => {
              const Icon = persona.icon;
              return (
                <button
                  key={persona.email}
                  onClick={() => {
                    setEmail(persona.email);
                    handleLogin(persona.email);
                  }}
                  disabled={isLoading}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 hover:border-slate-700 transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">
                        {persona.name}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${persona.badgeColor}`}>
                        {persona.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {persona.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legal & Compliance Footer Links */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-400 transition-colors underline-offset-2 hover:underline">
            Terms & Conditions
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-slate-400 transition-colors underline-offset-2 hover:underline">
            System Architecture
          </Link>
        </div>
      </div>
    </div>
  );
}

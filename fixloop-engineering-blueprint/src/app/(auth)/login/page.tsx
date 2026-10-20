"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
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
    name: "Quality Engineer",
    email: "qe@synthetic-demo.com",
    desc: "Triage nonconformances, isolate root cause, evaluate effectiveness and close cases.",
    icon: Shield,
    badgeStyle: { backgroundColor: "#E7EFF7", color: "#2F5F91", borderColor: "#2F5F91" },
  },
  {
    role: "OPERATOR",
    name: "Operator",
    email: "operator@synthetic-demo.com",
    desc: "Report shop-floor defects, log observed deviations and attach photo evidence.",
    icon: Wrench,
    badgeStyle: { backgroundColor: "#FEF3C7", color: "#8A5700", borderColor: "#8A5700" },
  },
  {
    role: "ACTION_OWNER",
    name: "Action Owner",
    email: "actionowner@synthetic-demo.com",
    desc: "Execute corrective tasks, upload proof of fix and submit completion notes.",
    icon: CheckCircle,
    badgeStyle: { backgroundColor: "#E7EFF7", color: "#245B86", borderColor: "#245B86" },
  },
  {
    role: "TENANT_ADMIN",
    name: "Tenant Admin",
    email: "admin@synthetic-demo.com",
    desc: "Manage factory sites, oversee member roles and configure workspace settings.",
    icon: UserCheck,
    badgeStyle: { backgroundColor: "#DCFCE7", color: "#216E4A", borderColor: "#216E4A" },
  },
  {
    role: "AUDITOR",
    name: "Auditor",
    email: "auditor@synthetic-demo.com",
    desc: "Read-only compliance inspection of closed cases and immutable audit trail.",
    icon: Eye,
    badgeStyle: { backgroundColor: "#F7F9FC", color: "#526173", borderColor: "#D8E0E9" },
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
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
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
        throw new Error(
          data.error?.message || "Authentication failed. Check your credentials."
        );
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
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 py-12"
      style={{ backgroundColor: "var(--fl-blue-050)", color: "var(--fl-text)" }}
    >
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center h-12 w-12 rounded-xl text-white font-bold text-lg mb-4"
            style={{ backgroundColor: "var(--fl-blue-700)" }}
          >
            FL
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fl-text)" }}>
            Sign in to FixLoop
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--fl-text-muted)" }}>
            Access your tenant workspace and audit trail.
          </p>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-lg flex items-start gap-3 text-sm"
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "var(--fl-danger)",
            }}
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Sign in error</p>
              <p className="mt-0.5 text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Login form */}
        <div
          className="rounded-xl p-6 sm:p-8 mb-5"
          style={{
            backgroundColor: "var(--fl-surface)",
            border: "1px solid var(--fl-border)",
            boxShadow: "0 1px 3px rgba(23,33,47,0.06)",
          }}
        >
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--fl-text)" }}
              >
                Work email address <span aria-hidden="true" style={{ color: "var(--fl-danger)" }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                disabled={isLoading}
                required
                className="fl-input"
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--fl-text)" }}
              >
                Password <span aria-hidden="true" style={{ color: "var(--fl-danger)" }}>*</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                required
                className="fl-input"
                aria-required="true"
              />
            </div>

            {/* Honeypot */}
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
              id="login-submit"
              disabled={isLoading}
              className="fl-btn-primary w-full py-3 text-sm rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                <>
                  Sign in to workspace
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo persona selector */}
        <div
          className="rounded-xl p-5 mb-5"
          style={{
            backgroundColor: "var(--fl-surface)",
            border: "1px solid var(--fl-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--fl-text-muted)" }}>
              Demo personas
            </h2>
            <span className="text-[11px] font-mono" style={{ color: "var(--fl-blue-700)" }}>
              1-click sign-in
            </span>
          </div>

          <div className="space-y-2">
            {DEMO_PERSONAS.map((persona) => {
              const Icon = persona.icon;
              return (
                <button
                  key={persona.email}
                  id={`demo-persona-${persona.role.toLowerCase()}`}
                  onClick={() => {
                    setEmail(persona.email);
                    handleLogin(persona.email);
                  }}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors group hover:border-[var(--fl-blue-700)] hover:bg-[var(--fl-blue-050)]"
                  style={{
                    border: "1px solid var(--fl-border)",
                    backgroundColor: "var(--fl-surface-muted)",
                  }}
                  aria-label={`Sign in as ${persona.name}`}
                >
                  <div
                    className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--fl-blue-050)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "var(--fl-blue-700)" }} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="text-sm font-semibold" style={{ color: "var(--fl-text)" }}>
                        {persona.name}
                      </span>
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                        style={persona.badgeStyle}
                      >
                        {persona.role}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--fl-text-muted)" }}>
                      {persona.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legal footer */}
        <div className="text-center text-xs flex items-center justify-center gap-4" style={{ color: "var(--fl-text-muted)" }}>
          <Link href="/privacy" className="hover:underline underline-offset-2 transition-colors">
            Privacy Policy
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:underline underline-offset-2 transition-colors">
            Terms
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/" className="hover:underline underline-offset-2 transition-colors">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

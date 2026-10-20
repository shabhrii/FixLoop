import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  GitBranch,
  ClipboardCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("fixloop_session");

  if (sessionToken?.value) {
    redirect("/app");
  }

  /* ------------------------------------------------------------------ */
  /* Workflow steps – no fabricated metrics, purely descriptive          */
  /* ------------------------------------------------------------------ */
  const WORKFLOW_STEPS = [
    { num: "01", title: "Report", desc: "Log a defect with part, machine, measurement, and photo evidence." },
    { num: "02", title: "Triage", desc: "Classify severity, assign owner, and confirm containment action." },
    { num: "03", title: "Investigate", desc: "Conduct structured 5-Why analysis with evidence-linked findings." },
    { num: "04", title: "Act", desc: "Assign and track corrective actions with proof-of-completion uploads." },
    { num: "05", title: "Verify", desc: "Evaluate effectiveness against defined criteria before marking complete." },
    { num: "06", title: "Close", desc: "Close the case only after the server confirms all verification gates pass." },
  ];

  const CAPABILITIES = [
    {
      icon: ShieldCheck,
      title: "Evidence-backed investigation",
      desc: "Structured 5-Why chains with explicit fact, hypothesis, and confirmed-cause distinctions.",
    },
    {
      icon: GitBranch,
      title: "AI-assisted, human-confirmed",
      desc: "AI suggestions are labeled and require explicit acceptance before becoming part of the record.",
    },
    {
      icon: ClipboardCheck,
      title: "Guarded effectiveness verification",
      desc: "Cases cannot close without a reviewer confirming that defined acceptance criteria were met.",
    },
    {
      icon: Lock,
      title: "Multi-tenant isolation",
      desc: "Strict tenant boundaries at every application and policy layer with an immutable audit trail.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--fl-page)", color: "var(--fl-text)" }}>

      {/* ===============================================================
          Navigation (design.md §6 Public navigation)
          =============================================================== */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: "var(--fl-page)",
          borderColor: "var(--fl-border)",
          boxShadow: "0 1px 3px rgba(23,33,47,0.06)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fl-blue-700 rounded-md" aria-label="FixLoop home">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: "var(--fl-blue-700)" }}
            >
              FL
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: "var(--fl-text)" }}>
              FixLoop
            </span>
          </Link>

          {/* Nav links */}
          <nav aria-label="Public navigation" className="hidden md:flex items-center gap-6">
            <a href="#workflow" className="text-sm font-medium transition-colors hover:text-fl-blue-700" style={{ color: "var(--fl-text-muted)" }}>
              Workflow
            </a>
            <a href="#capabilities" className="text-sm font-medium transition-colors hover:text-fl-blue-700" style={{ color: "var(--fl-text-muted)" }}>
              Capabilities
            </a>
            <Link href="/privacy" className="text-sm font-medium transition-colors hover:text-fl-blue-700" style={{ color: "var(--fl-text-muted)" }}>
              Privacy
            </Link>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold transition-colors px-3 py-1.5 rounded-md"
              style={{ color: "var(--fl-blue-700)" }}
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="fl-btn-primary rounded-full px-5 py-2.5 text-sm"
            >
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===============================================================
          Hero (design.md §2.1, §5 Public website layout)
          =============================================================== */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: "var(--fl-blue-050)" }}
        aria-label="Product hero"
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--fl-blue-700)" }}>
              Manufacturing Quality Management
            </p>
            <h1 className="text-display font-extrabold leading-tight tracking-tight" style={{ color: "var(--fl-text)" }}>
              Turn defects into{" "}
              <span style={{ color: "var(--fl-blue-700)" }}>verified fixes.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed max-w-xl" style={{ color: "var(--fl-text-muted)" }}>
              Capture evidence, investigate causes, assign corrective actions, and verify that the fix worked — all in one auditable workflow.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login" className="fl-btn-primary rounded-full px-7 py-3.5 text-base">
                Enter workspace demo
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <a href="#workflow" className="fl-btn-secondary rounded-full px-7 py-3.5 text-base">
                See how it works
              </a>
            </div>
          </div>

          {/* Hero workflow visualization */}
          <div
            className="hidden lg:flex flex-col justify-between p-8 rounded-2xl relative overflow-hidden h-80 shadow-md"
            style={{
              background: "linear-gradient(135deg, #17365A 0%, #214B78 60%, #2F5F91 100%)",
              border: "1px solid #1E446E",
            }}
            aria-hidden="true"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-widest text-sky-200 uppercase">
                Closed-Loop QMS Pipeline
              </span>
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
                Audited State Machine
              </span>
            </div>

            <div className="my-auto py-6">
              <div className="flex items-center justify-between gap-2">
                {[
                  { num: "01", name: "Report" },
                  { num: "02", name: "Triage" },
                  { num: "03", name: "5-Why" },
                  { num: "04", name: "Action" },
                  { num: "05", name: "Verify" },
                  { num: "06", name: "Close" },
                ].map((s, idx, arr) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className="text-center px-1">
                      <div className="text-[10px] font-mono text-sky-300 font-bold">{s.num}</div>
                      <div className="text-xs font-semibold text-white mt-0.5">{s.name}</div>
                    </div>
                    {idx < arr.length - 1 && (
                      <span className="text-white/40 text-sm font-light">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-sky-100">
              <span>Server-enforced verification gates</span>
              <span className="font-mono text-white font-semibold">100% Traceable</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===============================================================
          Workflow steps (design.md §2.1)
          =============================================================== */}
      <section id="workflow" className="py-20 px-6" style={{ backgroundColor: "var(--fl-page)" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "var(--fl-text)" }}>
              One workflow, end-to-end
            </h2>
            <p className="mt-3 text-base max-w-lg mx-auto" style={{ color: "var(--fl-text-muted)" }}>
              Every stage has a clear owner, required evidence, and a server-enforced gate before progression.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WORKFLOW_STEPS.map((step) => (
              <div
                key={step.num}
                className="fl-card rounded-xl p-6"
              >
                <div
                  className="text-xs font-mono font-bold tracking-widest mb-3"
                  style={{ color: "var(--fl-blue-700)" }}
                >
                  {step.num}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: "var(--fl-text)" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--fl-text-muted)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===============================================================
          Capabilities (design.md §2.1 feature panel)
          =============================================================== */}
      <section
        id="capabilities"
        className="py-20 px-6"
        style={{ backgroundColor: "var(--fl-blue-900)", color: "#ffffff" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Built for industrial quality
            </h2>
            <p className="mt-3 text-base max-w-lg mx-auto text-white/70">
              Designed around the workflows that manufacturing quality engineers rely on every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="p-6 rounded-xl flex gap-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <div
                    className="shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                  >
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{cap.title}</h3>
                    <p className="text-sm leading-relaxed text-white/70">{cap.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===============================================================
          Final CTA
          =============================================================== */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--fl-blue-050)" }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: "var(--fl-text)" }}>
            Ready to close the loop?
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: "var(--fl-text-muted)" }}>
            Try the interactive workspace demo using the roles and evidence flows your team will use.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/login" className="fl-btn-primary rounded-full px-7 py-3.5 text-base">
              Enter workspace demo
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-4 text-xs" style={{ color: "var(--fl-text-muted)" }}>
            No signup required for the demo environment.
          </p>
        </div>
      </section>

      {/* ===============================================================
          Footer (design.md §2.1)
          =============================================================== */}
      <footer
        className="py-8 px-6 border-t"
        style={{ backgroundColor: "var(--fl-page)", borderColor: "var(--fl-border)" }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="h-6 w-6 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "var(--fl-blue-700)" }}
            >
              FL
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--fl-text-muted)" }}>
              FixLoop Precision QMS
            </span>
          </div>
          <nav aria-label="Footer navigation" className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs transition-colors hover:underline" style={{ color: "var(--fl-text-muted)" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs transition-colors hover:underline" style={{ color: "var(--fl-text-muted)" }}>
              Terms &amp; Conditions
            </Link>
            <Link href="/login" className="text-xs transition-colors hover:underline" style={{ color: "var(--fl-blue-700)" }}>
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { Cpu, ArrowLeft, Scale, Lock, ShieldCheck, AlertTriangle, Clock, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — FixLoop Precision QMS",
  description: "Terms and conditions, acceptable use policy, and enterprise service agreement for FixLoop Quality Platform.",
};

export default function TermsPage() {
  const lastUpdated = "October 20, 2026";
  const operatorName = process.env.NEXT_PUBLIC_OPERATOR_NAME || "FixLoop Platform Operator";
  const legalContactEmail = process.env.NEXT_PUBLIC_LEGAL_EMAIL || "legal@fixloop.local";

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
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

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20"
            >
              Workspace Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex-1">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-4">
            <Scale className="h-3.5 w-3.5" />
            Master Enterprise SaaS Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Terms & Conditions of Service
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Last Revised: {lastUpdated}
            </span>
            <span className="text-slate-600">•</span>
            <span>Document Ref: FL-TOS-2026.4</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400 font-medium">B2B Commercial Service</span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">01.</span>
              Acceptance of Terms & Scope
            </h2>
            <p>
              These Terms & Conditions (&quot;Terms&quot;) constitute a Master SaaS Agreement template between {operatorName} (&quot;Operator&quot;) and the subscribing factory entity (&quot;Customer&quot;, &quot;Tenant&quot;, or &quot;You&quot;).
            </p>
            <p>
              FixLoop is an enterprise B2B platform engineered for precision manufacturing nonconformance tracking, 5-Why root cause isolation, corrective action tracking, and physical verification gating. Specific signed pilot contracts and statements of work govern active tenant pilots and prevail over default terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">02.</span>
              Role-Based Access Control & User Responsibilities
            </h2>
            <p>
              FixLoop implements strict role-based governance. Access credentials and permissions must correspond to designated personnel:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>
                <strong className="text-white">Quality Engineer (QE):</strong> Holds authoritative permission to triage nonconformances, confirm root causes, record physical effectiveness measurements, and authorize formal case closure.
              </li>
              <li>
                <strong className="text-white">Operator:</strong> Authorized to report shop-floor nonconformances, log physical measurements, and attach photographic proof.
              </li>
              <li>
                <strong className="text-white">Action Owner:</strong> Authorized to execute assigned containment and corrective action plans and attach completion proof.
              </li>
              <li>
                <strong className="text-white">Tenant Admin:</strong> Authorized to configure site parameters, invite personnel, and manage active tenant memberships.
              </li>
              <li>
                <strong className="text-white">Auditor:</strong> Granted read-only compliance access to verified snapshots and tamper-evident audit logs.
              </li>
            </ul>
            <p className="text-xs text-slate-400">
              Customers are solely responsible for maintaining the confidentiality of session tokens, ensuring credential rotation, and immediately revoking accounts of departing personnel.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">03.</span>
              AI Hypothesis Disclaimer & Human-in-the-Loop Policy
            </h2>
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/50 text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                Critical Industrial Quality Notice
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                FixLoop AI features provide probabilistic, advisory suggestions for root-cause hypotheses and corrective recommendations. <strong>FixLoop AI cannot and does not certify physical part conformity, guarantee machine calibration, or fulfill regulatory safety obligations.</strong>
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                All AI suggestions require independent human physical inspection and explicit confirmation by a qualified Quality Engineer. The Customer retains full legal, regulatory, and mechanical responsibility for manufacturing approvals, product release decisions, and safety standards compliance.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">04.</span>
              Evidence Integrity & Cryptographic Audit Trails
            </h2>
            <p>
              When uploading photographic proof, inspection records, or calibration certificates to FixLoop:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li>Customer warrants that uploaded evidence accurately reflects authentic physical conditions.</li>
              <li>FixLoop generates SHA-256 cryptographic snapshot fingerprints for audit records and formal closure reports.</li>
              <li>Attempting to forge, falsify, or tamper with evidence metadata, timestamps, or signed URLs is a material breach of this Agreement.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">05.</span>
              Acceptable Use & Multi-Tenant Boundary Protection
            </h2>
            <p>Customer agrees not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li>Attempt to access or probe data belonging to other tenants or bypass tenant isolation safeguards.</li>
              <li>Perform denial-of-service attacks, automated spam injection, or unauthorized penetration testing without prior written authorization.</li>
              <li>Reverse engineer, decompile, or extract the underlying algorithms of the FixLoop platform.</li>
              <li>Upload malicious code, corrupted binaries, or content that infringes third-party intellectual property.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">06.</span>
              Limitation of Liability & Warranty Disclaimer
            </h2>
            <p>
              Except as explicitly stated in a signed Service Level Agreement, FixLoop is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. FixLoop disclaims all warranties of merchantability, fitness for a particular manufacturing purpose, or error-free operation.
            </p>
            <p>
              In no event shall FixLoop be liable for indirect, incidental, punitive, or consequential damages, including shop-floor production downtime, scrap part costs, machine damage, or loss of manufacturing contracts.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">07.</span>
              Term, Termination & Data Portability
            </h2>
            <p>
              Either party may terminate subscription services in accordance with their enterprise order form. Upon termination, Customer has the right to export all historical case records, 5-Why trees, and audit snapshots in standard machine-readable formats (JSON / PDF) for 60 calendar days before records are scheduled for cryptographic purge.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 pb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">08.</span>
              Governing Law & Legal Inquiries
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Delaware, United States, without regard to conflict of law principles.
            </p>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between flex-wrap gap-4 mt-2">
              <div>
                <p className="font-semibold text-white">FixLoop Legal Affairs & Compliance</p>
                <p className="text-xs text-slate-400 mt-0.5">Enterprise Contracts & Risk Governance</p>
              </div>
              <a
                href="mailto:legal@fixloop.io"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-mono transition-all flex items-center gap-2 border border-slate-700"
              >
                <Mail className="h-4 w-4" />
                {legalContactEmail}
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 {operatorName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-slate-300 underline underline-offset-4">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Workspace Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
